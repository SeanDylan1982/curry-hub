// Simple script to start the server with better error handling
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting server with tsx...');

const server = spawn('npx', ['tsx', 'server/index.ts'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    NODE_ENV: 'development',
    DEBUG: '*',
    PORT: 3001
  }
});

server.on('error', (error) => {
  console.error('Failed to start server:', error);  
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('Stopping server...');
  server.kill();
  process.exit(0);
});
