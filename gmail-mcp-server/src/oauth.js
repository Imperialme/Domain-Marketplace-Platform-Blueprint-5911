import http from 'node:http';
import { google } from 'googleapis';
import { getOAuthClientCredentials } from './store.js';

// gmail.modify covers search/read plus the label changes archive & mark read/unread need,
// draft create/update, and send. It excludes permanent delete, which this server never does.
export const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];

export function createOAuth2Client(redirectUri) {
  const { clientId, clientSecret } = getOAuthClientCredentials();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Runs Google's loopback OAuth flow: spins up a one-shot local HTTP server on an
 * OS-assigned port, opens the consent screen, and resolves with tokens once Google
 * redirects back with an authorization code. Nothing here talks to any server but
 * Google's and localhost.
 */
export async function runLoopbackAuthFlow() {
  const { default: open } = await import('open');

  return await new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      try {
        const url = new URL(req.url, 'http://127.0.0.1');
        if (url.pathname !== '/oauth2callback') {
          res.writeHead(404).end();
          return;
        }

        const error = url.searchParams.get('error');
        const code = url.searchParams.get('code');

        if (error) {
          res.writeHead(400, { 'Content-Type': 'text/html' });
          res.end(`<h1>Authorization failed</h1><p>${error}</p><p>You can close this tab.</p>`);
          server.close();
          reject(new Error(`Google OAuth error: ${error}`));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end('<h1>Gmail account connected</h1><p>You can close this tab and return to the terminal.</p>');
        server.close();

        const redirectUri = `http://127.0.0.1:${server.address().port}/oauth2callback`;
        const oauth2Client = createOAuth2Client(redirectUri);
        const { tokens } = await oauth2Client.getToken(code);
        resolve({ tokens, oauth2Client });
      } catch (err) {
        reject(err);
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;
      const oauth2Client = createOAuth2Client(redirectUri);
      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: GMAIL_SCOPES,
      });

      console.error(`\nOpening your browser to sign in to Google...\nIf it doesn't open automatically, visit:\n\n  ${authUrl}\n`);
      open(authUrl).catch(() => {
        // Headless environment or no default browser handler — the printed URL above still works.
      });
    });

    server.on('error', reject);
  });
}
