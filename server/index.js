import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  initDatabase,
  getUser,
  upsertUser,
  updateUser,
  getAllUsers,
  saveGeneration,
  updateGeneration,
  getGenerationsByUser,
  getAllGenerations,
  savePayment,
  getAllPayments,
  checkAndIncrementVoucherAttempt,
  getPeruDateString
} from './db.js';

dotenv.config({ override: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files (public and compiled Vite dist)
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
}

const distDir = path.join(__dirname, '../dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

// -------------------------------------------------------------
// ENVIRONMENT & CREDENTIALS CONFIGURATION (READ FROM PROCESS.ENV)
// -------------------------------------------------------------
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || '';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const WHATSAPP_SUPPORT_PHONE = process.env.WHATSAPP_PHONE || '+51 907 318 642';
const WHATSAPP_SUPPORT_NUMBER_CLEAN = process.env.WHATSAPP_CLEAN || '51907318642';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

function getGoogleRedirectUri(req) {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  if (process.env.RENDER_EXTERNAL_URL) return `${process.env.RENDER_EXTERNAL_URL}/callback`;
  if (req && req.headers && req.headers.host) {
    const protocol = req.headers['x-forwarded-proto'] || (req.connection && req.connection.encrypted ? 'https' : 'http');
    return `${protocol}://${req.headers.host}/callback`;
  }
  return `http://localhost:${PORT}/callback`;
}

const PAYMENT_INFO = {
  yapePhone: '917858325',
  yapeHolder: 'Jonathan Encina',
  bcpAccount: '21505929964057',
  bcpCci: '00221510592996405728',
  price: 15,
  tokensPerPackage: 50,
  whatsappPhone: WHATSAPP_SUPPORT_PHONE
};

// Helper: Decode JWT
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// -------------------------------------------------------------
// ASYNCHRONOUS GENERATION QUEUE & CONCURRENCY CONTROLLER
// -------------------------------------------------------------
const generationQueue = [];
const jobsMap = new Map();
let activeWorkersCount = 0;
const MAX_CONCURRENT_WORKERS = 1; // 1 concurrent request to Replicate prevents 429 throttling

async function processQueue() {
  if (activeWorkersCount >= MAX_CONCURRENT_WORKERS || generationQueue.length === 0) {
    return;
  }

  const job = generationQueue.shift();
  if (!job) return;

  activeWorkersCount++;
  job.status = 'processing';
  job.startedAt = Date.now();
  console.log(`⚡ [QUEUE] Iniciando procesamiento de Job ${job.id} para ${job.userId} (Tema: ${job.themeName})`);

  try {
    // Enhance strict prompt
    let strictPrompt = `CRITICAL INSTRUCTION: Analyze the input image carefully. Maintain the EXACT NUMBER of people present in the input photo with NO additions and NO removals (single portrait = 1 person; couple = both 2 people together; family or group = all members together). Accurately preserve each person's unique facial features, recognizable likeness, ethnicity, age, and gender. Elegantly style each individual in age-appropriate and gender-appropriate thematic attire according to: ${job.themePrompt}.`;

    if (job.customDetails && typeof job.customDetails === 'string' && job.customDetails.trim()) {
      strictPrompt += ` ADDITIONAL USER CUSTOMIZATION & DESIRED POSE/ELEMENTS: "${job.customDetails.trim()}". Please integrate these specific requested elements, accessories, or pose details naturally and cohesively into the composition.`;
    }

    strictPrompt += ` High-end professional studio photography, natural photorealistic skin textures, 8k resolution, photographic masterpiece. CONTENT GUIDELINE: Tasteful high-fashion elegance, safe for work, allow stylish cleavage, evening gowns or swimwear if requested, zero nudity or explicit pornography.`;

    const payload = {
      input: {
        prompt: strictPrompt,
        input_images: [job.userPhoto],
        quality: 'low',
        aspect_ratio: '1:1',
        output_format: 'webp',
        number_of_images: 1
      }
    };

    // 1. Initiate prediction on Replicate
    let repRes = await fetch('https://api.replicate.com/v1/models/openai/gpt-image-2.5-flare/predictions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + REPLICATE_API_TOKEN,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!repRes.ok) {
      console.warn(`gpt-image-2.5-flare devolvió ${repRes.status}, intentando openai/gpt-image-2...`);
      repRes = await fetch('https://api.replicate.com/v1/models/openai/gpt-image-2/predictions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + REPLICATE_API_TOKEN,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
    }

    const prediction = await repRes.json();

    if (!repRes.ok) {
      throw new Error(prediction.detail || prediction.error || 'Error al conectar con el motor IA');
    }

    job.predictionId = prediction.id;
    console.log(`✅ [QUEUE] Predicción creada en Replicate: ${prediction.id}`);

    // 2. Poll Replicate internally until completion
    let isCompleted = false;
    let attempts = 0;
    const maxAttempts = 60; // 60 * 1.5s = 90s max wait

    while (!isCompleted && attempts < maxAttempts) {
      attempts++;
      await new Promise(r => setTimeout(r, 1500));

      const pollRes = await fetch('https://api.replicate.com/v1/predictions/' + prediction.id, {
        headers: { 'Authorization': 'Bearer ' + REPLICATE_API_TOKEN }
      });

      if (!pollRes.ok) continue;
      const pollData = await pollRes.json();

      if (pollData.status === 'succeeded' && pollData.output) {
        isCompleted = true;
        const outputUrl = Array.isArray(pollData.output) ? pollData.output[0] : pollData.output;
        job.outputUrl = outputUrl;
        job.status = 'succeeded';

        // Deduct token from user in Database
        const user = await getUser(job.userId);
        if (user) {
          const newTokens = Math.max(0, user.tokens - 1);
          await updateUser(job.userId, {
            tokens: newTokens,
            hasUsedFreeTrial: true,
            totalGenerated: (user.totalGenerated || 0) + 1
          });
          job.tokensRemaining = newTokens;
        }

        // Save generation record
        const genRecord = {
          id: 'gen_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
          userId: job.userId,
          themeId: job.themeId,
          themeName: job.themeName,
          predictionId: prediction.id,
          originalImage: job.userPhoto.length > 300 ? job.userPhoto.substring(0, 300) + '...' : job.userPhoto,
          resultImage: outputUrl,
          isWatermarked: job.isWatermarked,
          status: 'succeeded',
          createdAt: new Date().toISOString()
        };
        await saveGeneration(genRecord);
        job.generation = genRecord;

        console.log(`🎉 [QUEUE] Job ${job.id} completado con éxito en ${((Date.now() - job.createdAt) / 1000).toFixed(1)}s!`);
      } else if (pollData.status === 'failed' || pollData.status === 'canceled') {
        isCompleted = true;
        job.status = 'failed';
        job.error = pollData.error || 'La generación no pudo completarse.';
        console.error(`❌ [QUEUE] Job ${job.id} falló:`, job.error);
      }
    }

    if (!isCompleted) {
      job.status = 'failed';
      job.error = 'Tiempo de espera agotado en el servidor IA.';
    }

  } catch (err) {
    console.error(`❌ [QUEUE] Error en worker procesando Job ${job.id}:`, err);
    job.status = 'failed';
    job.error = err.message || 'Error interno de procesamiento.';
  } finally {
    activeWorkersCount--;
    // Immediately process next in queue
    setImmediate(processQueue);
  }
}

// -------------------------------------------------------------
// GOOGLE OAUTH 2.0 FLOW ENDPOINTS
// -------------------------------------------------------------
app.get('/auth/google', (req, res) => {
  const redirectUri = encodeURIComponent(getGoogleRedirectUri(req));
  const scope = encodeURIComponent('openid profile email');
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  res.redirect(googleAuthUrl);
});

app.get('/callback', async (req, res) => {
  try {
    const { code, error } = req.query;
    if (error || !code) {
      return res.redirect('/?auth_error=' + encodeURIComponent(error || 'Acceso cancelado'));
    }

    const redirectUri = getGoogleRedirectUri(req);
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code.toString(),
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      return res.redirect('/?auth_error=' + encodeURIComponent('Error al canjear token con Google'));
    }

    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });
    const googleUser = await userinfoResponse.json();
    if (!userinfoResponse.ok || !googleUser.email) {
      return res.redirect('/?auth_error=' + encodeURIComponent('No se pudo obtener el perfil de Google'));
    }

    const userId = googleUser.email.toLowerCase().trim();
    const user = await upsertUser({
      id: userId,
      googleId: googleUser.sub || '',
      email: userId,
      name: googleUser.name || userId.split('@')[0],
      avatar: googleUser.picture || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(userId)
    });

    res.redirect(`/?auth_user=${encodeURIComponent(JSON.stringify(user))}`);
  } catch (err) {
    console.error('Error in /callback:', err);
    res.redirect('/?auth_error=' + encodeURIComponent('Error en la autenticación'));
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Credencial de Google requerida' });
    }

    let email = '';
    let name = '';
    let picture = '';
    let googleId = '';

    try {
      const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (verifyRes.ok) {
        const googleData = await verifyRes.json();
        email = googleData.email;
        name = googleData.name;
        picture = googleData.picture;
        googleId = googleData.sub;
      } else {
        const decoded = parseJwt(credential);
        if (decoded && decoded.email) {
          email = decoded.email;
          name = decoded.name;
          picture = decoded.picture;
          googleId = decoded.sub;
        }
      }
    } catch (e) {
      const decoded = parseJwt(credential);
      if (decoded && decoded.email) {
        email = decoded.email;
        name = decoded.name;
        picture = decoded.picture;
        googleId = decoded.sub;
      }
    }

    if (!email) {
      return res.status(400).json({ error: 'No se pudo verificar la credencial de Google' });
    }

    const userId = email.toLowerCase().trim();
    const user = await upsertUser({
      id: userId,
      googleId,
      email: userId,
      name: name || userId.split('@')[0],
      avatar: picture || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(userId)
    });

    const userGenerations = await getGenerationsByUser(userId);
    res.json({ success: true, user, generations: userGenerations });
  } catch (err) {
    console.error('Error in /api/auth/google:', err);
    res.status(500).json({ error: 'Error en la verificación de Google' });
  }
});

app.post('/api/auth/quick-login', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Por favor ingresa un correo electrónico válido' });
    }

    const userId = email.toLowerCase().trim();
    const displayName = name && name.trim() ? name.trim() : userId.split('@')[0];

    const user = await upsertUser({
      id: userId,
      googleId: 'email_' + Date.now(),
      email: userId,
      name: displayName,
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(userId)
    });

    const userGenerations = await getGenerationsByUser(userId);
    res.json({ success: true, user, generations: userGenerations });
  } catch (err) {
    console.error('Error in /api/auth/quick-login:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

app.get('/api/payment-info', (req, res) => {
  res.json(PAYMENT_INFO);
});

app.get('/api/user/:email', async (req, res) => {
  const userId = req.params.email.toLowerCase().trim();
  const user = await getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  const userGenerations = await getGenerationsByUser(userId);
  res.json({ user, generations: userGenerations });
});

// -------------------------------------------------------------
// CREATE IMAGE GENERATION IN QUEUE
// -------------------------------------------------------------
app.post('/api/generate', async (req, res) => {
  try {
    const { userEmail, userPhoto, themeId, themeName, themePrompt, customDetails } = req.body;

    if (!userEmail) return res.status(400).json({ error: 'Debes iniciar sesión para generar' });
    if (!userPhoto) return res.status(400).json({ error: 'Debes subir una foto' });
    if (!themePrompt) return res.status(400).json({ error: 'El prompt temático es requerido' });

    const userId = userEmail.toLowerCase().trim();
    const user = await getUser(userId);
    if (!user) {
      return res.status(401).json({ error: 'Usuario no registrado. Inicia sesión con Google.' });
    }

    const isFreeGeneration = !user.hasUsedFreeTrial && user.tokens === 1;
    if (user.tokens <= 0) {
      return res.status(403).json({
        error: 'No tienes fotos disponibles. Adquiere el paquete de 50 fotos por S/ 15 para continuar creando.',
        needsRecharge: true
      });
    }

    // Safety moderation check
    const combinedInputText = ((themePrompt || '') + ' ' + (customDetails || '') + ' ' + (themeName || '')).toLowerCase();
    const explicitForbiddenWords = [
      'porn', 'porno', 'pornografía', 'pornografia', 'xxx', 'desnudo total', 'desnuda total',
      'completamente desnudo', 'completamente desnuda', 'naked', 'nude', 'nsfw', 'genitals',
      'genitales', 'vagina', 'penis', 'pene', 'sexo explícito', 'sexo explicito', 'hentai',
      'erotismo explícito', 'erotismo explicito', 'anal', 'masturbation'
    ];

    if (explicitForbiddenWords.some(w => combinedInputText.includes(w))) {
      return res.status(400).json({
        error: 'Tu solicitud contiene términos restringidos. Permitimos escotes elegantes, trajes de baño y vestidos de gala, pero no desnudos explícitos ni pornografía.'
      });
    }

    // Create unique Job in Queue
    const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const queuePosition = generationQueue.length + 1;
    const estimatedSeconds = queuePosition * 12;

    const job = {
      id: jobId,
      userId,
      userPhoto,
      themeId: themeId || 'custom',
      themeName: themeName || 'Tema Personalizado',
      themePrompt,
      customDetails,
      isWatermarked: isFreeGeneration,
      status: 'queued',
      predictionId: null,
      outputUrl: null,
      error: null,
      tokensRemaining: user.tokens,
      createdAt: Date.now()
    };

    jobsMap.set(jobId, job);
    generationQueue.push(job);

    console.log(`📥 [QUEUE] Nuevo Job ${jobId} registrado en cola (Posición: #${queuePosition}, Usuario: ${userId})`);

    // Trigger worker
    processQueue();

    res.json({
      success: true,
      jobId: jobId,
      predictionId: jobId,
      status: 'queued',
      queuePosition: queuePosition,
      estimatedSeconds: estimatedSeconds,
      isWatermarked: isFreeGeneration
    });

  } catch (err) {
    console.error('Error in /api/generate:', err);
    res.status(500).json({ error: err.message || 'Error al conectar con el motor de IA' });
  }
});

// -------------------------------------------------------------
// LIVE QUEUE STATUS POLLING ENDPOINT
// -------------------------------------------------------------
app.get('/api/queue/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobsMap.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job no encontrado en la cola' });
  }

  // Calculate live queue position if still in queue
  let currentPosition = 0;
  if (job.status === 'queued') {
    const idx = generationQueue.findIndex(j => j.id === jobId);
    currentPosition = idx !== -1 ? idx + 1 : 1;
  }

  const elapsedSeconds = Math.floor((Date.now() - job.createdAt) / 1000);
  const estimatedSeconds = Math.max(3, (currentPosition * 10) + (job.status === 'processing' ? 15 : 0) - elapsedSeconds);

  res.json({
    jobId: job.id,
    status: job.status,
    queuePosition: currentPosition,
    estimatedSeconds: estimatedSeconds,
    elapsedSeconds: elapsedSeconds,
    output: job.outputUrl,
    isWatermarked: job.isWatermarked,
    tokensRemaining: job.tokensRemaining,
    generation: job.generation,
    error: job.error
  });
});

// Backward-compatible prediction status endpoint
app.get('/api/prediction/:predictionId', (req, res) => {
  const { predictionId } = req.params;
  const job = jobsMap.get(predictionId);
  if (job) {
    let currentPosition = 0;
    if (job.status === 'queued') {
      const idx = generationQueue.findIndex(j => j.id === predictionId);
      currentPosition = idx !== -1 ? idx + 1 : 1;
    }
    return res.json({
      status: job.status,
      queuePosition: currentPosition,
      output: job.outputUrl,
      isWatermarked: job.isWatermarked,
      tokensRemaining: job.tokensRemaining,
      generation: job.generation,
      error: job.error
    });
  }

  res.json({ status: 'starting' });
});

// -------------------------------------------------------------
// INTELLIGENT PAYMENT AUDIT WITH 3-ATTEMPT DAILY LIMIT
// -------------------------------------------------------------
async function analyzeVoucherWithGemini(voucherBase64) {
  if (!voucherBase64) {
    return { es_valido_s15_reciente: false, motivo_rechazo: 'No se subió imagen de comprobante.' };
  }

  let mimeType = 'image/jpeg';
  let rawBase64 = voucherBase64;
  if (voucherBase64.startsWith('data:')) {
    const matches = voucherBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      rawBase64 = matches[2];
    }
  }

  const now = new Date();
  const peruFormatter = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  const peruTimeStr = peruFormatter.format(now);
  const peruDateOnly = peruTimeStr.split(',')[0].trim();

  const prompt = `
Eres un auditor experto de seguridad financiera para Estudio Smart en Perú.
Analiza este comprobante de pago con MÁXIMA RIGUROSIDAD.

DATOS ACTUALES EN PERÚ:
- Fecha y Hora actual en Perú (UTC-5): ${peruTimeStr}
- Fecha de hoy: ${peruDateOnly}
- Titular oficial: Jonathan Encina (917858325 / BCP 21505929964057)
- Monto requerido: S/ 15.00 PEN (o superior)
- Antigüedad máxima: 2 horas (120 min)

REGLAS DE VALIDACIÓN:
1. Comprueba autenticidad y éxito de la transacción.
2. Extrae: metodo_pago, monto, fecha_comprobante (DD/MM/YYYY), hora_comprobante (HH:MM), numero_operacion, destinatario, minutos_antiguedad.
3. "es_valido_s15_reciente": true SI Y SOLO SI monto >= S/ 15.00, fecha = HOY en Perú, antigüedad <= 120 minutos.
4. "motivo_rechazo": explicación clara si no cumple.

Responde ÚNICAMENTE en JSON válido:
{
  "es_valido_s15_reciente": true,
  "metodo_pago": "Yape",
  "monto": 15.00,
  "moneda": "PEN",
  "fecha_comprobante": "15/09/2026",
  "hora_comprobante": "10:10",
  "numero_operacion": "98765432",
  "destinatario": "Jonathan Encina",
  "minutos_antiguedad": 5,
  "motivo_rechazo": null
}
`;

  const payload = {
    contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: rawBase64 } }] }],
    generationConfig: { temperature: 0.1, response_mime_type: 'application/json' }
  };

  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
  let parsedResult = null;

  for (const model of models) {
    try {
      const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (apiRes.ok) {
        const jsonRes = await apiRes.json();
        const rawText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          let clean = rawText.trim();
          if (clean.startsWith('```json')) clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          else if (clean.startsWith('```')) clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
          parsedResult = JSON.parse(clean);
          break;
        }
      }
    } catch (e) {
      console.warn(`Aviso con ${model}:`, e.message);
    }
  }

  return parsedResult;
}

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { userEmail, method, operationCode, voucherBase64 } = req.body;

    if (!userEmail) return res.status(400).json({ error: 'Email de usuario requerido' });
    if (!voucherBase64) return res.status(400).json({ error: 'Por favor sube la captura de tu comprobante de pago.' });

    const userId = userEmail.toLowerCase().trim();
    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado. Inicia sesión primero.' });
    }

    // 1. Check & Enforce Daily Limit (Max 3 voucher upload attempts per day)
    const attemptCheck = await checkAndIncrementVoucherAttempt(userId);
    const whatsappMessage = encodeURIComponent(
      `Hola Estudio Smart, solicito revisión humana de mi comprobante de pago de S/ 15.\nMi cuenta: ${userId}\nCódigo OP: ${operationCode || 'Adjunto imagen'}`
    );
    const whatsappUrl = `https://wa.me/${WHATSAPP_SUPPORT_NUMBER_CLEAN}?text=${whatsappMessage}`;

    if (!attemptCheck.allowed) {
      return res.status(429).json({
        success: false,
        isRejected: true,
        error: 'Has alcanzado el límite máximo de 3 intentos de verificación de comprobante por hoy.',
        reason: 'Por seguridad del sistema solo se permiten 3 comprobantes diarios por cliente. Escríbenos a nuestro WhatsApp oficial para validarlo manualmente.',
        attemptsToday: attemptCheck.attemptsToday,
        attemptsLeft: 0,
        maxAttempts: 3,
        whatsappPhone: WHATSAPP_SUPPORT_PHONE,
        whatsappLink: whatsappUrl
      });
    }

    // 2. Perform Intelligent AI Audit
    const aiAnalysis = await analyzeVoucherWithGemini(voucherBase64);

    if (!aiAnalysis) {
      return res.status(400).json({
        success: false,
        isRejected: true,
        error: 'No se pudo auditar el comprobante automáticamente en este momento.',
        reason: 'Puedes enviar tu comprobante a WhatsApp para que nuestro equipo lo autorice de inmediato.',
        attemptsLeft: attemptCheck.attemptsLeft,
        whatsappPhone: WHATSAPP_SUPPORT_PHONE,
        whatsappLink: whatsappUrl
      });
    }

    const detectedOpCode = (aiAnalysis.numero_operacion || operationCode || '').trim();
    const detectedAmount = Number(aiAnalysis.monto) || 0;
    const isRecentAndValid = aiAnalysis.es_valido_s15_reciente === true && detectedAmount >= 15;

    // Check duplicate operation code
    if (detectedOpCode && detectedOpCode.length > 3) {
      const allPayments = await getAllPayments();
      const isDuplicate = allPayments.some(
        p => p.status === 'verified' && p.operationCode && p.operationCode.trim().toLowerCase() === detectedOpCode.toLowerCase()
      );
      if (isDuplicate) {
        return res.status(400).json({
          success: false,
          isRejected: true,
          error: 'Este comprobante / código de operación (' + detectedOpCode + ') ya fue verificado anteriormente.',
          attemptsLeft: attemptCheck.attemptsLeft,
          whatsappPhone: WHATSAPP_SUPPORT_PHONE,
          whatsappLink: whatsappUrl
        });
      }
    }

    if (!isRecentAndValid) {
      const rejectReason = aiAnalysis.motivo_rechazo || 'El comprobante no corresponde al monto de S/ 15.00 o tiene más de 2 horas de antigüedad.';
      return res.status(400).json({
        success: false,
        isRejected: true,
        error: rejectReason,
        attemptsLeft: attemptCheck.attemptsLeft,
        whatsappPhone: WHATSAPP_SUPPORT_PHONE,
        whatsappLink: whatsappUrl
      });
    }

    // Payment Approved Successfully!
    const tokensToAdd = PAYMENT_INFO.tokensPerPackage; // 50 tokens
    const now = new Date();
    const peruDateStr = now.toLocaleDateString('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: '2-digit', year: 'numeric' });

    const paymentRecord = {
      id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      userId,
      method: aiAnalysis.metodo_pago || method || 'yape',
      amount: detectedAmount,
      status: 'verified',
      voucherImage: 'voucher_verified_ai',
      operationCode: detectedOpCode || ('OP-' + Math.floor(100000 + Math.random() * 900000)),
      detectedData: aiAnalysis,
      verifiedBy: 'IA_Automatica',
      verifiedAt: now.toISOString(),
      createdAt: now.toISOString()
    };

    await savePayment(paymentRecord);
    const newTokens = (user.tokens || 0) + tokensToAdd;
    await updateUser(userId, { tokens: newTokens });

    console.log(`✅ ¡PAGO APROBADO! Usuario: ${userId}, Monto: S/ ${detectedAmount}, +50 fotos acreditadas (Total: ${newTokens})`);

    res.json({
      success: true,
      message: `¡Pago de S/ ${detectedAmount.toFixed(2)} verificado con éxito! Se han acreditado ${tokensToAdd} fotos Ultra HD.`,
      tokensAdded: tokensToAdd,
      newTotalTokens: newTokens,
      payment: paymentRecord
    });

  } catch (err) {
    console.error('Error in /api/verify-payment:', err);
    res.status(500).json({
      error: 'Error interno en la verificación de pago.',
      whatsappPhone: WHATSAPP_SUPPORT_PHONE,
      whatsappLink: `https://wa.me/${WHATSAPP_SUPPORT_NUMBER_CLEAN}?text=${encodeURIComponent('Hola Estudio Smart, tuve un error al verificar mi pago de S/ 15.')}`
    });
  }
});

app.get('/api/history/:email', async (req, res) => {
  const userId = req.params.email.toLowerCase().trim();
  const allUserGens = await getGenerationsByUser(userId);
  res.json({ generations: allUserGens.filter(g => g.status === 'succeeded') });
});

// -------------------------------------------------------------
// ADMIN MANAGEMENT & ANALYTICS ENDPOINTS
// -------------------------------------------------------------
app.get('/api/admin/users', async (req, res) => {
  try {
    const allUsers = await getAllUsers();
    const allGens = await getAllGenerations();
    const allPayments = await getAllPayments();

    const userList = allUsers.map(u => {
      const userGens = allGens.filter(g => g.userId === u.id);
      const userPayments = allPayments.filter(p => p.userId === u.id && p.status === 'verified');
      return {
        ...u,
        totalGenerated: u.totalGenerated || userGens.length,
        paymentsCount: userPayments.length,
        totalSpent: userPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0),
        lastActive: userGens.length > 0 ? userGens[0].createdAt : u.createdAt
      };
    });

    userList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    res.json({ success: true, users: userList });
  } catch (err) {
    console.error('Error in /api/admin/users:', err);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
});

app.get('/api/admin/analytics', async (req, res) => {
  try {
    const usersArr = await getAllUsers();
    const gensArr = await getAllGenerations();
    const paymentsArr = await getAllPayments();

    const totalUsers = usersArr.length;
    const totalGenerations = gensArr.length;
    const succeededGenerations = gensArr.filter(g => g.status === 'succeeded').length;
    const verifiedPayments = paymentsArr.filter(p => p.status === 'verified');
    const totalRevenue = verifiedPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
    const totalTokensInCirculation = usersArr.reduce((acc, u) => acc + (Number(u.tokens) || 0), 0);

    const themeCounts = {};
    for (const gen of gensArr) {
      const tName = gen.themeName || 'Personalizada';
      const tId = gen.themeId || 'custom';
      if (!themeCounts[tId]) {
        themeCounts[tId] = { themeId: tId, themeName: tName, count: 0 };
      }
      themeCounts[tId].count += 1;
    }

    const popularThemes = Object.values(themeCounts)
      .map(item => ({
        ...item,
        percentage: totalGenerations > 0 ? Math.round((item.count / totalGenerations) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      analytics: {
        totalUsers,
        totalGenerations,
        succeededGenerations,
        totalPayments: verifiedPayments.length,
        totalRevenue,
        totalTokensInCirculation,
        popularThemes,
        recentGenerations: gensArr.slice(0, 15),
        recentPayments: paymentsArr.slice(0, 15)
      }
    });
  } catch (err) {
    console.error('Error in /api/admin/analytics:', err);
    res.status(500).json({ error: 'Error al calcular analíticas' });
  }
});

app.post('/api/admin/users/:email/credits', async (req, res) => {
  try {
    const userId = req.params.email.toLowerCase().trim();
    const { tokensToAdd, exactTokens, note } = req.body;

    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const prevTokens = user.tokens || 0;
    let newTokens = prevTokens;
    if (typeof exactTokens === 'number') {
      newTokens = Math.max(0, exactTokens);
    } else if (typeof tokensToAdd === 'number') {
      newTokens = Math.max(0, prevTokens + tokensToAdd);
    } else {
      newTokens = prevTokens + 50;
    }

    await updateUser(userId, { tokens: newTokens });

    const adminLog = {
      id: 'admin_grant_' + Date.now(),
      userId,
      method: 'admin_manual_grant',
      amount: 0,
      status: 'verified',
      voucherImage: 'admin_manual',
      operationCode: 'MANUAL-' + Date.now().toString().slice(-6),
      detectedData: { note: note || 'Autorización manual de paquete' },
      verifiedBy: 'Admin_Manual_Panel',
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    await savePayment(adminLog);

    console.log(`🔑 [ADMIN] Créditos actualizados para ${userId}: ${prevTokens} -> ${newTokens}`);

    res.json({
      success: true,
      message: `Créditos actualizados exitosamente. Nuevo balance: ${newTokens} fotos.`,
      user: { ...user, tokens: newTokens }
    });
  } catch (err) {
    console.error('Error in /api/admin/users/:email/credits:', err);
    res.status(500).json({ error: 'Error al actualizar créditos' });
  }
});

app.post('/api/admin/users/:email/revoke', async (req, res) => {
  try {
    const userId = req.params.email.toLowerCase().trim();
    const user = await getUser(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    await updateUser(userId, { tokens: 0 });
    console.log(`🚫 [ADMIN] Acceso revocado para ${userId}`);

    res.json({
      success: true,
      message: `Se ha revocado el acceso y establecido en 0 créditos a ${user.name}.`,
      user: { ...user, tokens: 0 }
    });
  } catch (err) {
    console.error('Error in /api/admin/users/:email/revoke:', err);
    res.status(500).json({ error: 'Error al revocar acceso' });
  }
});

// Catch-all route to serve index.html for SPA client on Render
if (fs.existsSync(distDir)) {
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Initialize Database and Start Web Service
async function startServer() {
  await initDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor ESTUDIO SMART listo en http://localhost:${PORT}`);
    console.log(`⚡ Cola IA y Concurrencia activa (Máx concurrentes Replicate: ${MAX_CONCURRENT_WORKERS})`);
    console.log(`💳 Límite de seguridad: 3 intentos de comprobante por día por cliente`);
  });
}

startServer();
