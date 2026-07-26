import fs from 'node:fs';
import { CONFIG_PATH, ensureHomeDir, tokenPath } from './paths.js';
import { encryptJson, decryptJson } from './crypto.js';

const DEFAULT_CONFIG = { oauthClient: null, accounts: [] };

export function loadConfig() {
  ensureHomeDir();
  if (!fs.existsSync(CONFIG_PATH)) return structuredClone(DEFAULT_CONFIG);
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

export function saveConfig(config) {
  ensureHomeDir();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });
}

export function getOAuthClientCredentials() {
  const { oauthClient } = loadConfig();
  if (!oauthClient?.clientId || !oauthClient?.clientSecret) {
    throw new Error(
      'No Google OAuth client configured yet. Run `gmail-mcp init` first with the Client ID/Secret from your Google Cloud OAuth client.'
    );
  }
  return oauthClient;
}

export function setOAuthClientCredentials(clientId, clientSecret) {
  const config = loadConfig();
  config.oauthClient = { clientId, clientSecret };
  saveConfig(config);
}

export function listAccounts() {
  return loadConfig().accounts;
}

export function findAccount(idOrEmail) {
  const accounts = listAccounts();
  return accounts.find((a) => a.id === idOrEmail || a.email.toLowerCase() === idOrEmail.toLowerCase());
}

export function requireAccount(idOrEmail) {
  const account = findAccount(idOrEmail);
  if (!account) {
    const known = listAccounts().map((a) => `${a.id} (${a.email})`).join(', ') || '(none configured)';
    throw new Error(`Unknown account "${idOrEmail}". Configured accounts: ${known}`);
  }
  return account;
}

export function upsertAccountMeta(account) {
  const config = loadConfig();
  const idx = config.accounts.findIndex((a) => a.id === account.id);
  if (idx >= 0) config.accounts[idx] = { ...config.accounts[idx], ...account };
  else config.accounts.push(account);
  saveConfig(config);
}

export function removeAccountMeta(accountId) {
  const config = loadConfig();
  config.accounts = config.accounts.filter((a) => a.id !== accountId);
  saveConfig(config);
}

export async function saveTokens(accountId, tokens) {
  ensureHomeDir();
  const encrypted = await encryptJson(tokens);
  fs.writeFileSync(tokenPath(accountId), encrypted, { mode: 0o600 });
}

export async function loadTokens(accountId) {
  const file = tokenPath(accountId);
  if (!fs.existsSync(file)) return null;
  return decryptJson(fs.readFileSync(file, 'utf8'));
}

export function deleteTokens(accountId) {
  const file = tokenPath(accountId);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}
