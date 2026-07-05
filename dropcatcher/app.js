// Entry point for Plesk's Node.js/Passenger app hosting, which runs this
// file directly (no CLI args) and expects the app to listen on
// process.env.PORT — Passenger assigns and reverse-proxies that port to
// your domain. For plain VPS/systemd use, use src/cli.js instead.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startServer } from './src/server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, 'config.json');
if (!fs.existsSync(configPath)) {
  fs.copyFileSync(path.join(__dirname, 'config.example.json'), configPath);
}

startServer(Number(process.env.PORT) || 8053, process.env.HOST || '0.0.0.0');
