const https = require('https');

const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || '';
const MAILGUN_DOMAIN  = process.env.MAILGUN_DOMAIN  || '';
const ADMIN_EMAIL     = process.env.VITE_ADMIN_EMAIL || 'mail@shahid.me';
// For EU accounts: set MAILGUN_REGION=eu in Netlify env vars
const MG_HOST = process.env.MAILGUN_REGION === 'eu'
  ? 'api.eu.mailgun.net'
  : 'api.mailgun.net';

function mgPost(params) {
  const body = new URLSearchParams(params).toString();
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: MG_HOST,
        path: `/v3/${MAILGUN_DOMAIN}/messages`,
        method: 'POST',
        auth: `api:${MAILGUN_API_KEY}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ ok: res.statusCode < 300, status: res.statusCode, data }));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const adminHtml = (d) => `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
  <div style="background:#2563eb;padding:24px 32px;border-radius:12px 12px 0 0">
    <h1 style="color:#fff;margin:0;font-size:22px">New Domain Offer 🎉</h1>
    <p style="color:#bfdbfe;margin:6px 0 0;font-size:15px">${d.domainName}</p>
  </div>
  <div style="background:#f8fafc;padding:28px 32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">

    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;width:40%">Offer Amount</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-weight:700;font-size:20px;color:#16a34a">$${Number(d.offerAmount).toLocaleString()}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b">Payment Method</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-weight:600">${d.paymentMethod}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b">Buyer Name</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0">${d.buyerName}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b">Buyer Email</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0"><a href="mailto:${d.buyerEmail}" style="color:#2563eb">${d.buyerEmail}</a></td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b">Phone</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0">${d.buyerPhone || '—'}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b">Location</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0">${[d.city, d.country].filter(Boolean).join(', ') || '—'}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b">IP Address</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-family:monospace;font-size:13px">${d.ip || '—'}</td></tr>
      <tr><td style="padding:10px 0;color:#64748b">Source</td>
          <td style="padding:10px 0">${d.referrerSource || 'Direct'}</td></tr>
    </table>

    ${d.message ? `<div style="margin-top:20px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px">
      <p style="margin:0 0 6px;color:#64748b;font-size:13px">MESSAGE FROM BUYER</p>
      <p style="margin:0;color:#1e293b">${d.message}</p>
    </div>` : ''}

    <div style="margin-top:24px">
      <a href="mailto:${d.buyerEmail}?subject=Re: ${encodeURIComponent(d.domainName)} — Your Offer"
         style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
        Reply to Buyer →
      </a>
    </div>
  </div>
</div>`;

const buyerHtml = (d) => `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
  <div style="background:#2563eb;padding:24px 32px;border-radius:12px 12px 0 0">
    <h1 style="color:#fff;margin:0;font-size:22px">Your Offer Was Received ✅</h1>
    <p style="color:#bfdbfe;margin:6px 0 0;font-size:15px">${d.domainName}</p>
  </div>
  <div style="background:#f8fafc;padding:28px 32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
    <p style="margin:0 0 20px">Hi ${d.buyerName},</p>
    <p style="margin:0 0 20px">We received your offer for <strong>${d.domainName}</strong> and we'll review it shortly.</p>

    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
      <tr style="background:#f1f5f9"><td colspan="2" style="padding:12px 16px;font-weight:600;color:#475569;font-size:13px">OFFER SUMMARY</td></tr>
      <tr><td style="padding:10px 16px;border-top:1px solid #e2e8f0;color:#64748b">Domain</td>
          <td style="padding:10px 16px;border-top:1px solid #e2e8f0;font-weight:700">${d.domainName}</td></tr>
      <tr><td style="padding:10px 16px;border-top:1px solid #e2e8f0;color:#64748b">Your Offer</td>
          <td style="padding:10px 16px;border-top:1px solid #e2e8f0;font-weight:700;color:#16a34a">$${Number(d.offerAmount).toLocaleString()}</td></tr>
      <tr><td style="padding:10px 16px;border-top:1px solid #e2e8f0;color:#64748b">Payment Method</td>
          <td style="padding:10px 16px;border-top:1px solid #e2e8f0">${d.paymentMethod}</td></tr>
    </table>

    <p style="margin:24px 0 8px;color:#475569">We typically respond within <strong>24 hours</strong>. If you have questions, simply reply to this email.</p>
    <p style="margin:0;color:#94a3b8;font-size:13px">This is a confirmation of your inquiry — not an acceptance of your offer.</p>
  </div>
</div>`;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    return { statusCode: 503, body: JSON.stringify({ error: 'Mailgun not configured' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const fromAddress = `${data.domainName} Inquiries <noreply@${MAILGUN_DOMAIN}>`;

  const [adminResult, buyerResult] = await Promise.allSettled([
    mgPost({
      from:    fromAddress,
      to:      ADMIN_EMAIL,
      subject: `New offer on ${data.domainName} — $${Number(data.offerAmount).toLocaleString()} (${data.paymentMethod})`,
      html:    adminHtml(data),
    }),
    mgPost({
      from:    fromAddress,
      to:      data.buyerEmail,
      subject: `Your offer for ${data.domainName} — Confirmation`,
      html:    buyerHtml(data),
    }),
  ]);

  const ok =
    adminResult.status === 'fulfilled' && adminResult.value.ok &&
    buyerResult.status  === 'fulfilled' && buyerResult.value.ok;

  return {
    statusCode: ok ? 200 : 207,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ok,
      admin: adminResult.status === 'fulfilled' ? adminResult.value : { error: String(adminResult.reason) },
      buyer: buyerResult.status  === 'fulfilled' ? buyerResult.value  : { error: String(buyerResult.reason)  },
    }),
  };
};
