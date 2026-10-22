const { spawn } = require('child_process');

// Starter hele projektet med én kommando (npm run dev):
// 1. Den lokale AI-server i baggrunden.
// 2. Expo i forgrunden, så Expo stadig kan vise QR-koden og bruge tastaturgenveje.
// Når Expo stoppes (Ctrl+C), stoppes serveren også.
const server = spawn(process.execPath, ['--env-file-if-exists=server/.env', 'server/index.js'], {
  stdio: 'inherit',
});

const expo = spawn('npx', ['expo', 'start'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

server.on('exit', (code) => {
  if (code) {
    console.error('The AI server stopped. Is port 3001 already in use?');
  }
});

expo.on('exit', (code) => {
  server.kill();
  process.exit(code ?? 0);
});
