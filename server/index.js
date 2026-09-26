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
  deleteUser,
  getAllUsers,
  saveGeneration,
  updateGeneration,
  getGenerationsByUser,
  getAllGenerations,
  savePayment,
  getAllPayments
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

const WHATSAPP_SUPPORT_PHONE = process.env.WHATSAPP_PHONE || '+51 907 318 642';
const WHATSAPP_SUPPORT_NUMBER_CLEAN = process.env.WHATSAPP_CLEAN || '51907318642';

const PAYMENT_INFO = {
  yapePhone: '917858325',
  yapeHolder: 'Jonathan Encina',
  bcpAccount: '21505929964057',
  bcpCci: '00221510592996405728',
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
// CLIENT AUTHENTICATION (EMAIL & PASSWORD DIRECT ACCESS)
// -------------------------------------------------------------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Por favor ingresa un correo electrónico válido' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Por favor ingresa tu contraseña' });
    }

    const userId = email.toLowerCase().trim();
    const user = await getUser(userId);

    if (!user || user.isAuthorized === false) {
      return res.status(403).json({
        error: 'Este correo no está registrado o aún no cuenta con autorización de acceso. Contacta con administración para habilitar tu acceso.',
        unauthorized: true
      });
    }

    // Verify password if user has one configured
    if (user.password && user.password.trim() !== '') {
      if (user.password.trim() !== password.trim()) {
        return res.status(401).json({
          error: 'Contraseña incorrecta. Por favor verifica tu clave o solicítala al administrador.'
        });
      }
    } else {
      // If user was created without a password, set this password
      await updateUser(userId, { password: password.trim() });
      user.password = password.trim();
    }

    const userGenerations = await getGenerationsByUser(userId);
    res.json({ success: true, user, generations: userGenerations });
  } catch (err) {
    console.error('Error in /api/auth/login:', err);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

app.post('/api/auth/set-password', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Por favor ingresa un correo electrónico válido' });
    }
    if (!password || password.trim().length < 3) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 3 caracteres' });
    }

    const userId = email.toLowerCase().trim();
    const user = await getUser(userId);

    if (!user || user.isAuthorized === false) {
      return res.status(403).json({
        error: 'Tu correo aún no ha sido autorizado en el sistema por el administrador. Solicita tu acceso primero.',
        unauthorized: true
      });
    }

    const updates = { password: password.trim() };
    if (name && name.trim()) {
      updates.name = name.trim();
    }

    const updatedUser = await updateUser(userId, updates);
    const userGenerations = await getGenerationsByUser(userId);

    res.json({
      success: true,
      message: 'Contraseña establecida exitosamente',
      user: updatedUser,
      generations: userGenerations
    });
  } catch (err) {
    console.error('Error in /api/auth/set-password:', err);
    res.status(500).json({ error: 'Error al establecer contraseña' });
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
    if (!user || user.isAuthorized === false) {
      return res.status(401).json({ error: 'Usuario no autorizado. Inicia sesión con tu correo y contraseña.' });
    }

    if (user.tokens <= 0) {
      return res.status(403).json({
        error: 'No tienes fotos disponibles en tu cuenta. Contacta al administrador para recargar tus fotos.',
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
      isWatermarked: false,
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
      isWatermarked: false
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

// Grant / Authorize Access to Email from Admin Panel
app.post('/api/admin/users/grant-access', async (req, res) => {
  try {
    const { email, name, password, tokens, notes } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Debes proporcionar un correo electrónico válido' });
    }

    const userId = email.toLowerCase().trim();
    const existing = await getUser(userId);

    // Default tokens is 50 when granting access
    let assignedTokens = 50;
    if (tokens !== undefined && tokens !== null && tokens !== '') {
      const parsedTokens = Number(tokens);
      if (!isNaN(parsedTokens) && parsedTokens >= 0) {
        assignedTokens = parsedTokens;
      }
    } else if (existing && existing.tokens !== undefined) {
      assignedTokens = existing.tokens;
    }

    const assignedPassword = (password && password.trim())
      ? password.trim()
      : (existing?.password || 'smart' + Math.floor(1000 + Math.random() * 9000));

    const user = await upsertUser({
      email: userId,
      name: (name && name.trim()) ? name.trim() : (existing?.name || userId.split('@')[0]),
      password: assignedPassword,
      tokens: assignedTokens,
      isAuthorized: true,
      notes: notes || existing?.notes || 'Autorizado por administrador',
      avatar: existing?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(userId)
    });

    console.log(`🔑 [ADMIN] Acceso otorgado a: ${userId} | Clave: ${assignedPassword} | Tokens: ${assignedTokens}`);

    res.json({
      success: true,
      message: `Acceso concedido a ${user.email} con ${user.tokens} fotos y contraseña asignada.`,
      user
    });
  } catch (err) {
    console.error('Error in /api/admin/users/grant-access:', err);
    res.status(500).json({ error: 'Error al autorizar cliente' });
  }
});

// Edit user details from Admin (password, name, tokens, authorization)
app.post('/api/admin/users/:email/edit', async (req, res) => {
  try {
    const userId = req.params.email.toLowerCase().trim();
    const { name, password, tokens, isAuthorized, notes } = req.body;

    const user = await getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (password !== undefined) updates.password = password.trim();
    if (tokens !== undefined && tokens !== '') {
      const parsed = Number(tokens);
      if (!isNaN(parsed)) updates.tokens = Math.max(0, parsed);
    }
    if (isAuthorized !== undefined) updates.isAuthorized = Boolean(isAuthorized);
    if (notes !== undefined) updates.notes = notes;

    const updated = await updateUser(userId, updates);

    console.log(`✏️ [ADMIN] Usuario ${userId} modificado por administrador`);
    res.json({ success: true, message: 'Datos del cliente actualizados exitosamente', user: updated });
  } catch (err) {
    console.error('Error in /api/admin/users/:email/edit:', err);
    res.status(500).json({ error: 'Error al actualizar datos del cliente' });
  }
});

// Delete user permanently
app.delete('/api/admin/users/:email', async (req, res) => {
  try {
    const userId = req.params.email.toLowerCase().trim();
    const deleted = await deleteUser(userId);
    if (!deleted) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    console.log(`🗑️ [ADMIN] Usuario ${userId} eliminado permanentemente`);
    res.json({ success: true, message: `Usuario ${userId} eliminado correctamente` });
  } catch (err) {
    console.error('Error in DELETE /api/admin/users/:email:', err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
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
    console.log(`🔑 Autenticación directa por Correo + Contraseña & Panel Admin activo`);
  });
}

startServer();
