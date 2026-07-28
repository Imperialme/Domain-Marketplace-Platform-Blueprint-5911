import { getAccessToken } from './oauth.js';
import { base64UrlEncode } from './util.js';

function buildRawMessage({ to, from, subject, body }) {
  const lines = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body,
  ];
  return base64UrlEncode(lines.join('\r\n'));
}

export async function createDraft(env, payload) {
  const { contact_name = '', email = '', reference = '' } = payload;

  if (!email) {
    return { gmail: 'skipped_no_email' };
  }

  if (!env.GOOGLE_REFRESH_TOKEN) {
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

  const accessToken = await getAccessToken(env);
  const raw = buildRawMessage({ to: email, from: env.GMAIL_USER, subject, body });

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ message: { raw } }),
  });

  if (!res.ok) {
    throw new Error(`Gmail draft create failed: ${res.status} ${await res.text()}`);
  }

  return { gmail: 'draft_created' };
}
