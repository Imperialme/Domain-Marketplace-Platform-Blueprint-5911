const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY || '';
const MAILGUN_DOMAIN  = process.env.MAILGUN_DOMAIN  || '';
const ADMIN_EMAIL     = process.env.VITE_ADMIN_EMAIL || 'ask@netzone.me';
const MG_HOST = process.env.MAILGUN_REGION === 'eu'
  ? 'api.eu.mailgun.net'
  : 'api.mailgun.net';

const formatTime = (s) => {
  if (!s || s <= 0) return null;
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60), r = s % 60;
  return r > 0 ? `${m}m ${r}s` : `${m}m`;
};

async function mgPost(params) {
  const body = new URLSearchParams(params).toString();
  const creds = btoa(`api:${MAILGUN_API_KEY}`);
  const res = await fetch(`https://${MG_HOST}/v3/${MAILGUN_DOMAIN}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${creds}`,
    },
    body,
  });
  return { ok: res.ok, status: res.status, data: await res.text() };
}

const adminHtml = (d) => `
<div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
  <div style="background:#2563eb;padding:24px 32px;border-radius:12px 12px 0 0">
    <h1 style="color:#fff;margin:0;font-size:22px">New Domain Offer 🎉</h1>
    <p style="color:#bfdbfe;margin:6px 0 0;font-size:15px">${d.domainName}</p>
    ${d.ref ? `<p style="color:#93c5fd;margin:4px 0 0;font-size:12px;font-family:monospace">Ref: ${d.ref}</p>` : ''}
  </div>
  <div style="background:#f8fafc;padding:28px 32px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0;border-top:none">
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b;width:40%">Offer Amount</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0;font-weight:700;font-size:20px;color:#16a34a">USD ${Number(d.offerAmount).toLocaleString()}</td></tr>
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
      <tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;color:#64748b">Source</td>
          <td style="padding:10px 0;border-bottom:1px solid #e2e8f0">${d.referrerSource || 'Direct'}</td></tr>
      ${d.timeOnPage ? `<tr><td style="padding:10px 0;color:#64748b">Time on Page</td>
          <td style="padding:10px 0">${formatTime(d.timeOnPage)}</td></tr>` : ''}
    </table>

    ${d.message ? `<div style="margin-top:20px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:16px">
      <p style="margin:0 0 6px;color:#64748b;font-size:13px;text-transform:uppercase;letter-spacing:.05em">Message from Buyer</p>
      <p style="margin:0;color:#1e293b">${d.message}</p>
    </div>` : ''}

    <div style="margin-top:24px">
      <a href="mailto:${d.buyerEmail}?subject=Re: ${encodeURIComponent(d.domainName)} — Your Offer${d.ref ? encodeURIComponent(` [${d.ref}]`) : ''}"
         style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600">
        Reply to ${d.buyerName} →
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
    <p style="margin:0 0 20px">
      Thank you for your offer for <strong>${d.domainName}</strong>. We will be in touch with you shortly to finalize the details and see how we can move forward with the negotiation.
    </p>

    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
      <tr style="background:#f1f5f9"><td colspan="2" style="padding:12px 16px;font-weight:600;color:#475569;font-size:13px;text-transform:uppercase;letter-spacing:.05em">Offer Summary</td></tr>
      <tr><td style="padding:10px 16px;border-top:1px solid #e2e8f0;color:#64748b">Reference</td>
          <td style="padding:10px 16px;border-top:1px solid #e2e8f0;font-family:monospace;font-weight:700;color:#2563eb">${d.ref || '—'}</td></tr>
      <tr><td style="padding:10px 16px;border-top:1px solid #e2e8f0;color:#64748b">Domain</td>
          <td style="padding:10px 16px;border-top:1px solid #e2e8f0;font-weight:700">${d.domainName}</td></tr>
      <tr><td style="padding:10px 16px;border-top:1px solid #e2e8f0;color:#64748b">Your Offer</td>
          <td style="padding:10px 16px;border-top:1px solid #e2e8f0;font-weight:700;color:#16a34a">USD ${Number(d.offerAmount).toLocaleString()}</td></tr>
      <tr><td style="padding:10px 16px;border-top:1px solid #e2e8f0;color:#64748b">Payment Method</td>
          <td style="padding:10px 16px;border-top:1px solid #e2e8f0">${d.paymentMethod}</td></tr>
    </table>

    <p style="margin:24px 0 8px;color:#475569">Use your reference number <strong style="color:#2563eb;font-family:monospace">${d.ref || ''}</strong> in any future correspondence with us.</p>
    <p style="margin:0;color:#94a3b8;font-size:13px">This is a confirmation of your inquiry — not an acceptance of your offer. Simply reply to this email if you have any questions.</p>
  </div>
</div>`;

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
    return Response.json({ error: 'Mailgun not configured — set MAILGUN_API_KEY and MAILGUN_DOMAIN in Netlify env vars' }, { status: 503 });
  }

  let data;
  try {
    data = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const fromAddress = `${data.domainName} via NetZone <noreply@${MAILGUN_DOMAIN}>`;
  const refLabel = data.ref ? ` [${data.ref}]` : '';

  const [adminResult, buyerResult] = await Promise.allSettled([
    mgPost({
      from:    fromAddress,
      to:      ADMIN_EMAIL,
      subject: `New offer on ${data.domainName} — USD ${Number(data.offerAmount).toLocaleString()}${refLabel}`,
      html:    adminHtml(data),
    }),
    mgPost({
      from:    fromAddress,
      to:      data.buyerEmail,
      subject: `Your offer for ${data.domainName} — Confirmation${refLabel}`,
      html:    buyerHtml(data),
    }),
  ]);

  const ok =
    adminResult.status === 'fulfilled' && adminResult.value.ok &&
    buyerResult.status  === 'fulfilled' && buyerResult.value.ok;

  return Response.json({
    ok,
    admin: adminResult.status === 'fulfilled' ? adminResult.value : { error: String(adminResult.reason) },
    buyer: buyerResult.status  === 'fulfilled' ? buyerResult.value  : { error: String(buyerResult.reason) },
  }, { status: ok ? 200 : 207 });
};

export const config = { path: '/api/send-email' };
