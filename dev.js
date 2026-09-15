import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Iniciando ESTUDIO SMART (Backend + Frontend)...');

// 1. Start backend server
const serverProcess = spawn('node', ['server/index.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

// 2. Start Vite frontend
const viteProcess = spawn('npx.cmd', ['vite', '--host', 'localhost', '--port', '5173'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true,
});

process.on('SIGINT', () => {
  serverProcess.kill();
  viteProcess.kill();
  process.exit();
});
