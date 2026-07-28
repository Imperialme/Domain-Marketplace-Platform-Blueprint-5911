const express = require('express');
const { google } = require('googleapis');

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/gmail.compose',
];

function getOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  if (process.env.GOOGLE_REFRESH_TOKEN) {
    client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  }

  return client;
}

const router = express.Router();

router.get('/start', (req, res) => {
  const client = getOAuth2Client();
  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
  res.redirect(url);
});

router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    res.status(200).send(`OAuth error: ${error}`);
    return;
  }

  if (!code) {
    res.status(200).send('Missing authorization code.');
    return;
  }

  try {
    const client = getOAuth2Client();
    const { tokens } = await client.getToken(code);

    if (!tokens.refresh_token) {
      res.status(200).send(
        'No refresh token returned. Revoke app access at https://myaccount.google.com/permissions and try /oauth/start again with prompt=consent.'
      );
      return;
    }

    res.status(200).send(
      `<pre>Copy this value into GOOGLE_REFRESH_TOKEN in your .env / Railway variables, then redeploy:\n\n${tokens.refresh_token}</pre>`
    );
  } catch (err) {
    res.status(200).send(`OAuth callback failed: ${err.message}`);
  }
});

module.exports = { router, getOAuth2Client };
