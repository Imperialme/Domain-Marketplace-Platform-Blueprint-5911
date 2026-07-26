import crypto from 'node:crypto';
import fs from 'node:fs';
import { ensureHomeDir, MASTER_KEY_FALLBACK_PATH } from './paths.js';

const SERVICE_NAME = 'gmail-mcp-multi-account';
const ACCOUNT_NAME = 'master-key';

let cachedKey = null;

// The master key encrypts every account's OAuth tokens at rest. On macOS it lives
// in Keychain (via keytar), which is what actually keeps it out of plain files.
// A file fallback exists so the server still works if Keychain access is denied,
// but that path is deliberately less secure and we don't pretend otherwise.
async function getOrCreateMasterKey() {
  if (cachedKey) return cachedKey;
  ensureHomeDir();

  let keytar;
  try {
    keytar = (await import('keytar')).default;
  } catch {
    keytar = null;
  }

  if (keytar) {
    try {
      let stored = await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME);
      if (!stored) {
        stored = crypto.randomBytes(32).toString('base64');
        await keytar.setPassword(SERVICE_NAME, ACCOUNT_NAME, stored);
      }
      cachedKey = Buffer.from(stored, 'base64');
      return cachedKey;
    } catch (err) {
      console.error(`[gmail-mcp] Keychain access failed (${err.message}); falling back to a local key file.`);
    }
  }

  if (fs.existsSync(MASTER_KEY_FALLBACK_PATH)) {
    cachedKey = Buffer.from(fs.readFileSync(MASTER_KEY_FALLBACK_PATH, 'utf8'), 'base64');
    return cachedKey;
  }

  const key = crypto.randomBytes(32);
  fs.writeFileSync(MASTER_KEY_FALLBACK_PATH, key.toString('base64'), { mode: 0o600 });
  cachedKey = key;
  return cachedKey;
}

export async function encryptJson(obj) {
  const key = await getOrCreateMasterKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(obj), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    v: 1,
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    data: encrypted.toString('base64'),
  });
}

export async function decryptJson(payload) {
  const key = await getOrCreateMasterKey();
  const { iv, tag, data } = JSON.parse(payload);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(data, 'base64')), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8'));
}
