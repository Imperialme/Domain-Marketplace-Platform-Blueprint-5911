const { google } = require('googleapis');
const { getOAuth2Client } = require('./oauth');

function buildRawMessage({ to, from, subject, body }) {
  const lines = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body,
  ];
  const message = lines.join('\r\n');

  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function createDraft(payload) {
  const { contact_name = '', email = '', reference = '' } = payload;

  if (!email) {
    return { gmail: 'skipped_no_email' };
  }

  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    return { gmail: 'skipped_no_refresh_token' };
  }

  const subject = `Your Inquiry Has Been Received — ${reference} | SpareParts.me`;
  const body = `Dear ${contact_name},

Thank you for reaching out to SpareParts.me.

We have received your inquiry and assigned it reference: ${reference}

Our team will revert within 24–48 business hours.

Best regards,
Sales Team
SpareParts.me | Imperial MEA General Trading LLC`;

  const auth = getOAuth2Client();
  const gmail = google.gmail({ version: 'v1', auth });

  const raw = buildRawMessage({
    to: email,
    from: process.env.GMAIL_USER,
    subject,
    body,
  });

  await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: { raw },
    },
  });

  return { gmail: 'draft_created' };
}

module.exports = { createDraft };
