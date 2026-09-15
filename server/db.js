import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic storage directory: Supports Render Persistent Disk (/var/data) or custom DATA_DIR
function resolveDataDir() {
  if (process.env.DATA_DIR && process.env.DATA_DIR.trim()) {
    const customPath = path.resolve(process.env.DATA_DIR.trim());
    try {
      if (!fs.existsSync(customPath)) fs.mkdirSync(customPath, { recursive: true });
      return customPath;
    } catch (e) {
      console.warn('No se pudo crear custom DATA_DIR, usando fallback:', e.message);
    }
  }

  // Render Persistent Disk default mount path /var/data
  if (fs.existsSync('/var/data')) {
    return '/var/data';
  }

  // If in Linux/Render container, attempt creating /var/data
  if (process.platform !== 'win32') {
    try {
      fs.mkdirSync('/var/data', { recursive: true });
      return '/var/data';
    } catch (e) {
      // fallback to local dir
    }
  }

  // Local development fallback
  const localDir = path.join(__dirname, 'data');
  if (!fs.existsSync(localDir)) {
    fs.mkdirSync(localDir, { recursive: true });
  }
  return localDir;
}

const DATA_DIR = resolveDataDir();
console.log('💾 Directorio de Almacenamiento Persistente:', DATA_DIR);

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

// In-Memory cache for super-fast sub-millisecond lookups & transactions
let memoryUsers = loadJSON(USERS_FILE, {});
let memoryGenerations = loadJSON(GENERATIONS_FILE, []);
let memoryPayments = loadJSON(PAYMENTS_FILE, []);

export async function initDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Refresh memory cache from disk
    memoryUsers = loadJSON(USERS_FILE, {});
    memoryGenerations = loadJSON(GENERATIONS_FILE, []);
    memoryPayments = loadJSON(PAYMENTS_FILE, []);

    console.log(`✅ Base de Datos en Disco Persistente inicializada en: ${DATA_DIR}`);
    console.log(`📊 Estado inicial: ${Object.keys(memoryUsers).length} usuarios, ${memoryGenerations.length} fotos generadas, ${memoryPayments.length} pagos registrados.`);
  } catch (err) {
    console.error('Error initializing persistent disk database:', err);
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
  return formatter.format(now); // "YYYY-MM-DD"
}

// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------
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
  return user;
}

export async function updateUser(email, updates) {
  const userId = email.toLowerCase().trim();
  const existing = memoryUsers[userId];
  if (!existing) return null;

  Object.assign(existing, updates);
  memoryUsers[userId] = existing;
  saveJSON(USERS_FILE, memoryUsers);
  return existing;
}

export async function getAllUsers() {
  return Object.values(memoryUsers);
}

// -------------------------------------------------------------
// VOUCHER ATTEMPT LIMIT PROTECTION (MAX 3 ATTEMPTS PER DAY)
// -------------------------------------------------------------
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

// -------------------------------------------------------------
// GENERATION OPERATIONS
// -------------------------------------------------------------
export async function saveGeneration(gen) {
  memoryGenerations.unshift(gen);
  saveJSON(GENERATIONS_FILE, memoryGenerations);
  return gen;
}

export async function updateGeneration(predictionId, updates) {
  const gen = memoryGenerations.find(g => g.predictionId === predictionId || g.id === predictionId);
  if (gen) {
    Object.assign(gen, updates);
    saveJSON(GENERATIONS_FILE, memoryGenerations);
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

// -------------------------------------------------------------
// PAYMENT OPERATIONS
// -------------------------------------------------------------
export async function savePayment(payment) {
  memoryPayments.unshift(payment);
  saveJSON(PAYMENTS_FILE, memoryPayments);
  return payment;
}

export async function getAllPayments() {
  return memoryPayments;
}
