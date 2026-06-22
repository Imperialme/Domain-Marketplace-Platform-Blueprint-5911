import emailjs from '@emailjs/browser';

// ─── EmailJS config (set these in Netlify environment variables) ──────────────
// Sign up free at https://www.emailjs.com  →  200 emails/month free
// Create one email service (Gmail works) and two templates (see comments below)
const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  || '';
const TEMPLATE_ADMIN      = import.meta.env.VITE_EMAILJS_TEMPLATE_ADMIN  || '';
const TEMPLATE_BUYER      = import.meta.env.VITE_EMAILJS_TEMPLATE_BUYER  || '';
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  || '';
const ADMIN_EMAIL         = import.meta.env.VITE_ADMIN_EMAIL || 'mail@shahid.me';

const emailjsReady = () =>
  EMAILJS_SERVICE_ID && TEMPLATE_ADMIN && EMAILJS_PUBLIC_KEY;

// ─── Submit to Netlify Forms (captures + emails admin via Netlify) ────────────
// This works automatically when deployed to Netlify — no API key needed.
export const submitToNetlify = async (fields) => {
  const body = new URLSearchParams({
    'form-name': 'domain-inquiry',
    'bot-field': '',          // honeypot — bots fill this, humans don't
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

// ─── Email to YOU (admin) via EmailJS ─────────────────────────────────────────
// Template variables to use in your EmailJS admin template:
//   {{domain_name}}  {{buyer_name}}  {{buyer_email}}  {{buyer_phone}}
//   {{offer_amount}} {{payment_method}} {{message}}
//   {{visitor_country}} {{visitor_city}} {{visitor_ip}} {{visitor_source}}
//   {{admin_email}}
export const sendAdminNotification = async (data) => {
  if (!emailjsReady()) return false;
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_ADMIN,
      {
        admin_email:      ADMIN_EMAIL,
        domain_name:      data.domainName,
        buyer_name:       data.buyerName,
        buyer_email:      data.buyerEmail,
        buyer_phone:      data.buyerPhone || 'Not provided',
        offer_amount:     `$${Number(data.offerAmount).toLocaleString()}`,
        payment_method:   data.paymentMethod,
        message:          data.message || 'No message',
        visitor_country:  data.country || 'Unknown',
        visitor_city:     data.city || 'Unknown',
        visitor_ip:       data.ip || 'Unknown',
        visitor_source:   data.referrerSource || 'Direct',
      },
      EMAILJS_PUBLIC_KEY,
    );
    return true;
  } catch (err) {
    console.warn('EmailJS admin notification failed:', err);
    return false;
  }
};

// ─── Confirmation email to the BUYER via EmailJS ──────────────────────────────
// Template variables:
//   {{buyer_name}}  {{buyer_email}}  {{domain_name}}
//   {{offer_amount}} {{payment_method}} {{admin_email}}
//
// Suggested subject line: "Your offer for {{domain_name}} — Confirmation"
// Suggested body:
//   Hi {{buyer_name}},
//   We received your offer of {{offer_amount}} for {{domain_name}}.
//   Payment method: {{payment_method}}
//   We'll review your offer and reply within 24 hours.
//   Questions? Reply to this email or contact {{admin_email}}.
export const sendBuyerConfirmation = async (data) => {
  if (!emailjsReady() || !TEMPLATE_BUYER) return false;
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATE_BUYER,
      {
        buyer_name:     data.buyerName,
        buyer_email:    data.buyerEmail,
        domain_name:    data.domainName,
        offer_amount:   `$${Number(data.offerAmount).toLocaleString()}`,
        payment_method: data.paymentMethod,
        admin_email:    ADMIN_EMAIL,
      },
      EMAILJS_PUBLIC_KEY,
    );
    return true;
  } catch (err) {
    console.warn('EmailJS buyer confirmation failed:', err);
    return false;
  }
};
