import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local JSON fallback directory
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');
const GENERATIONS_FILE = path.join(DATA_DIR, 'generations.json');
const PAYMENTS_FILE = path.join(DATA_DIR, 'payments.json');

function loadJSON(file, fallback = {}) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading JSON from ' + file, err);
  }
  return fallback;
}

function saveJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving JSON to ' + file, err);
  }
}

// In-Memory cache for super fast access
let memoryUsers = loadJSON(USERS_FILE, {});
let memoryGenerations = loadJSON(GENERATIONS_FILE, []);
let memoryPayments = loadJSON(PAYMENTS_FILE, []);

// PostgreSQL Connection Pool (Render Database)
let pgPool = null;
let isPostgresActive = false;

export async function initDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    try {
      console.log('🔌 Conectando a Base de Datos PostgreSQL de Render...');
      const pg = await import('pg');
      const { Pool } = pg.default || pg;

      pgPool = new Pool({
        connectionString: databaseUrl,
        ssl: {
          rejectUnauthorized: false
        }
      });

      const client = await pgPool.connect();
      console.log('✅ Conexión establecida con PostgreSQL en Render.');

      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(255) PRIMARY KEY,
          google_id VARCHAR(255),
          email VARCHAR(255) UNIQUE NOT NULL,
          name VARCHAR(255),
          avatar TEXT,
          tokens INTEGER DEFAULT 1,
          has_used_free_trial BOOLEAN DEFAULT FALSE,
          total_generated INTEGER DEFAULT 0,
          voucher_attempts_today INTEGER DEFAULT 0,
          last_voucher_attempt_date VARCHAR(50),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS generations (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          theme_id VARCHAR(255),
          theme_name VARCHAR(255),
          prediction_id VARCHAR(255),
          original_image TEXT,
          result_image TEXT,
          is_watermarked BOOLEAN DEFAULT FALSE,
          status VARCHAR(50) DEFAULT 'starting',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS payments (
          id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          method VARCHAR(50),
          amount NUMERIC(10, 2),
          status VARCHAR(50) DEFAULT 'pending',
          voucher_image TEXT,
          operation_code VARCHAR(255),
          detected_data JSONB,
          verified_by VARCHAR(100),
          verified_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      client.release();
      isPostgresActive = true;
      console.log('✅ Tablas PostgreSQL inicializadas (users, generations, payments).');

      await syncFromPostgres();
    } catch (err) {
      console.warn('⚠️ No se pudo conectar a PostgreSQL, usando persistencia local JSON:', err.message);
      isPostgresActive = false;
    }
  } else {
    console.log('📁 DATABASE_URL no detectada, usando persistencia local JSON.');
  }
}

async function syncFromPostgres() {
  if (!isPostgresActive || !pgPool) return;
  try {
    const usersRes = await pgPool.query('SELECT * FROM users');
    const newUsers = {};
    for (const row of usersRes.rows) {
      newUsers[row.id] = {
        id: row.id,
        googleId: row.google_id,
        email: row.email,
        name: row.name,
        avatar: row.avatar,
        tokens: Number(row.tokens),
        hasUsedFreeTrial: Boolean(row.has_used_free_trial),
        totalGenerated: Number(row.total_generated || 0),
        voucherAttemptsToday: Number(row.voucher_attempts_today || 0),
        lastVoucherAttemptDate: row.last_voucher_attempt_date,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString()
      };
    }
    memoryUsers = newUsers;
    saveJSON(USERS_FILE, memoryUsers);

    const gensRes = await pgPool.query('SELECT * FROM generations ORDER BY created_at DESC LIMIT 500');
    memoryGenerations = gensRes.rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      themeId: r.theme_id,
      themeName: r.theme_name,
      predictionId: r.prediction_id,
      originalImage: r.original_image,
      resultImage: r.result_image,
      isWatermarked: Boolean(r.is_watermarked),
      status: r.status,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
    }));
    saveJSON(GENERATIONS_FILE, memoryGenerations);

    const payRes = await pgPool.query('SELECT * FROM payments ORDER BY created_at DESC LIMIT 500');
    memoryPayments = payRes.rows.map(r => ({
      id: r.id,
      userId: r.user_id,
      method: r.method,
      amount: Number(r.amount),
      status: r.status,
      voucherImage: r.voucher_image,
      operationCode: r.operation_code,
      detectedData: r.detected_data,
      verifiedBy: r.verified_by,
      verifiedAt: r.verified_at,
      createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString()
    }));
    saveJSON(PAYMENTS_FILE, memoryPayments);

    console.log('🔄 Sincronizado con PostgreSQL: ' + Object.keys(memoryUsers).length + ' usuarios, ' + memoryGenerations.length + ' fotos, ' + memoryPayments.length + ' pagos.');
  } catch (err) {
    console.error('Error syncing from Postgres:', err);
  }
}

export function getPeruDateString() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(now);
}

export async function getUser(email) {
  if (!email) return null;
  const userId = email.toLowerCase().trim();
  return memoryUsers[userId] || null;
}

export async function upsertUser(userData) {
  const userId = userData.email.toLowerCase().trim();
  const existing = memoryUsers[userId] || {};

  const user = {
    id: userId,
    googleId: userData.googleId || existing.googleId || '',
    email: userId,
    name: userData.name || existing.name || userId.split('@')[0],
    avatar: userData.avatar || existing.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(userId),
    tokens: userData.tokens !== undefined ? userData.tokens : (existing.tokens !== undefined ? existing.tokens : 1),
    hasUsedFreeTrial: userData.hasUsedFreeTrial !== undefined ? userData.hasUsedFreeTrial : (existing.hasUsedFreeTrial || false),
    totalGenerated: userData.totalGenerated !== undefined ? userData.totalGenerated : (existing.totalGenerated || 0),
    voucherAttemptsToday: userData.voucherAttemptsToday !== undefined ? userData.voucherAttemptsToday : (existing.voucherAttemptsToday || 0),
    lastVoucherAttemptDate: userData.lastVoucherAttemptDate || existing.lastVoucherAttemptDate || getPeruDateString(),
    createdAt: existing.createdAt || userData.createdAt || new Date().toISOString()
  };

  memoryUsers[userId] = user;
  saveJSON(USERS_FILE, memoryUsers);

  if (isPostgresActive && pgPool) {
    try {
      await pgPool.query(`
        INSERT INTO users (id, google_id, email, name, avatar, tokens, has_used_free_trial, total_generated, voucher_attempts_today, last_voucher_attempt_date, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          avatar = EXCLUDED.avatar,
          tokens = EXCLUDED.tokens,
          has_used_free_trial = EXCLUDED.has_used_free_trial,
          total_generated = EXCLUDED.total_generated,
          voucher_attempts_today = EXCLUDED.voucher_attempts_today,
          last_voucher_attempt_date = EXCLUDED.last_voucher_attempt_date,
          updated_at = NOW();
      `, [
        user.id, user.googleId, user.email, user.name, user.avatar,
        user.tokens, user.hasUsedFreeTrial, user.totalGenerated,
        user.voucherAttemptsToday, user.lastVoucherAttemptDate, user.createdAt
      ]);
    } catch (err) {
      console.error('Postgres error in upsertUser:', err);
    }
  }

  return user;
}

export async function updateUser(email, updates) {
  const userId = email.toLowerCase().trim();
  const existing = memoryUsers[userId];
  if (!existing) return null;

  Object.assign(existing, updates);
  memoryUsers[userId] = existing;
  saveJSON(USERS_FILE, memoryUsers);

  if (isPostgresActive && pgPool) {
    try {
      const setClauses = [];
      const values = [];
      let idx = 1;

      for (const [key, val] of Object.entries(updates)) {
        const colName = key.replace(/[A-Z]/g, letter => '_' + letter.toLowerCase());
        setClauses.push(colName + ' = $' + idx);
        values.push(val);
        idx++;
      }

      values.push(userId);
      await pgPool.query('UPDATE users SET ' + setClauses.join(', ') + ', updated_at = NOW() WHERE id = $' + idx, values);
    } catch (err) {
      console.error('Postgres error in updateUser:', err);
    }
  }

  return existing;
}

export async function getAllUsers() {
  return Object.values(memoryUsers);
}

export async function checkAndIncrementVoucherAttempt(email) {
  const userId = email.toLowerCase().trim();
  const user = memoryUsers[userId] || await upsertUser({ email: userId });
  const today = getPeruDateString();

  let attemptsToday = user.voucherAttemptsToday || 0;
  if (user.lastVoucherAttemptDate !== today) {
    attemptsToday = 0;
  }

  const MAX_ATTEMPTS = 3;

  if (attemptsToday >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      attemptsToday: attemptsToday,
      attemptsLeft: 0,
      maxAttempts: MAX_ATTEMPTS,
      resetDate: today
    };
  }

  attemptsToday += 1;
  await updateUser(userId, {
    voucherAttemptsToday: attemptsToday,
    lastVoucherAttemptDate: today
  });

  return {
    allowed: true,
    attemptsToday: attemptsToday,
    attemptsLeft: MAX_ATTEMPTS - attemptsToday,
    maxAttempts: MAX_ATTEMPTS,
    resetDate: today
  };
}

export async function saveGeneration(gen) {
  memoryGenerations.unshift(gen);
  saveJSON(GENERATIONS_FILE, memoryGenerations);

  if (isPostgresActive && pgPool) {
    try {
      await pgPool.query(`
        INSERT INTO generations (id, user_id, theme_id, theme_name, prediction_id, original_image, result_image, is_watermarked, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        gen.id, gen.userId, gen.themeId, gen.themeName, gen.predictionId,
        gen.originalImage, gen.resultImage, gen.isWatermarked, gen.status, gen.createdAt
      ]);
    } catch (err) {
      console.error('Postgres error in saveGeneration:', err);
    }
  }
}

export async function updateGeneration(predictionId, updates) {
  const gen = memoryGenerations.find(g => g.predictionId === predictionId || g.id === predictionId);
  if (gen) {
    Object.assign(gen, updates);
    saveJSON(GENERATIONS_FILE, memoryGenerations);

    if (isPostgresActive && pgPool) {
      try {
        await pgPool.query(`
          UPDATE generations SET
            result_image = COALESCE($1, result_image),
            status = COALESCE($2, status)
          WHERE prediction_id = $3 OR id = $3
        `, [updates.resultImage || null, updates.status || null, predictionId]);
      } catch (err) {
        console.error('Postgres error in updateGeneration:', err);
      }
    }
  }
  return gen;
}

export async function getGenerationsByUser(email) {
  const userId = email.toLowerCase().trim();
  return memoryGenerations.filter(g => g.userId === userId);
}

export async function getAllGenerations() {
  return memoryGenerations;
}

export async function savePayment(payment) {
  memoryPayments.unshift(payment);
  saveJSON(PAYMENTS_FILE, memoryPayments);

  if (isPostgresActive && pgPool) {
    try {
      await pgPool.query(`
        INSERT INTO payments (id, user_id, method, amount, status, voucher_image, operation_code, detected_data, verified_by, verified_at, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        payment.id, payment.userId, payment.method, payment.amount, payment.status,
        payment.voucherImage, payment.operationCode, JSON.stringify(payment.detectedData || {}),
        payment.verifiedBy, payment.verifiedAt, payment.createdAt
      ]);
    } catch (err) {
      console.error('Postgres error in savePayment:', err);
    }
  }
}

export async function getAllPayments() {
  return memoryPayments;
}
