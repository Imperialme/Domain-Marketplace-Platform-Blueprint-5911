import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

export const HOME_DIR = process.env.GMAIL_MCP_HOME || path.join(os.homedir(), '.gmail-mcp');
export const CONFIG_PATH = path.join(HOME_DIR, 'config.json');
export const TOKENS_DIR = path.join(HOME_DIR, 'tokens');
export const MASTER_KEY_FALLBACK_PATH = path.join(HOME_DIR, 'master.key');

export function ensureHomeDir() {
  fs.mkdirSync(HOME_DIR, { recursive: true, mode: 0o700 });
  fs.mkdirSync(TOKENS_DIR, { recursive: true, mode: 0o700 });
  try {
    fs.chmodSync(HOME_DIR, 0o700);
    fs.chmodSync(TOKENS_DIR, 0o700);
  } catch {
    // best-effort on filesystems that don't support chmod semantics
  }
}

export function tokenPath(accountId) {
  return path.join(TOKENS_DIR, `${accountId}.enc`);
}
