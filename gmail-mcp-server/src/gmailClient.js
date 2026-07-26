import { google } from 'googleapis';
import { createOAuth2Client } from './oauth.js';
import { requireAccount, loadTokens, saveTokens } from './store.js';

const clientCache = new Map();

/**
 * Returns an authenticated Gmail API client for the given account id/email.
 * Token refresh is automatic: google-auth-library refreshes the access token
 * whenever it's expired, and the 'tokens' event below persists the refreshed
 * (encrypted) token set so future calls don't need to re-auth.
 */
export async function getGmailClient(accountIdOrEmail) {
  const account = requireAccount(accountIdOrEmail);

  if (clientCache.has(account.id)) return clientCache.get(account.id);

  const tokens = await loadTokens(account.id);
  if (!tokens) {
    throw new Error(
      `No stored credentials for account "${account.id}" (${account.email}). Run \`gmail-mcp add-account\` to (re)authorize it.`
    );
  }

  const oauth2Client = createOAuth2Client(); // no redirect needed for refresh/API calls
  oauth2Client.setCredentials(tokens);

  oauth2Client.on('tokens', (newTokens) => {
    const merged = { ...tokens, ...newTokens };
    saveTokens(account.id, merged).catch((err) => {
      console.error(`[gmail-mcp] Failed to persist refreshed tokens for ${account.id}:`, err.message);
    });
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const entry = { gmail, oauth2Client, account };
  clientCache.set(account.id, entry);
  return entry;
}

export async function getUserProfile(accountIdOrEmail) {
  const { gmail } = await getGmailClient(accountIdOrEmail);
  const { data } = await gmail.users.getProfile({ userId: 'me' });
  return data;
}
