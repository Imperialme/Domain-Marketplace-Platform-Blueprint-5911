// ─── Netlify Forms: captured + emailed to admin automatically ────────────────
// Works on Netlify deploys with zero config — no API key needed.
export const submitToNetlify = async (fields) => {
  const body = new URLSearchParams({
    'form-name': 'domain-inquiry',
    'bot-field': '',
    ...fields,
  });
  try {
    const res = await fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    return res.ok;
  } catch {
    return false;
  }
};

// ─── Mailgun via Netlify Function: admin notification + buyer confirmation ────
// Set MAILGUN_API_KEY and MAILGUN_DOMAIN in Netlify → Site Settings → Env Vars.
// For EU Mailgun accounts also add MAILGUN_REGION=eu.
export const sendEmailNotifications = async (data) => {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    return json;
  } catch (err) {
    console.warn('Mailgun notification failed:', err);
    return { ok: false };
  }
};
