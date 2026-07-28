import { createInquiry } from './notion.js';
import { appendRow } from './sheets.js';
import { createDraft } from './gmail.js';
import { handleOAuthStart, handleOAuthCallback } from './oauth.js';
import { json } from './util.js';

function normalizePayload(body) {
  const b = body && typeof body === 'object' ? body : {};
  return {
    task_title: b.task_title || '',
    contact_name: b.contact_name || '',
    company: b.company || '',
    email: b.email || '',
    phone: b.phone || '',
    brand_vehicle: b.brand_vehicle || '',
    parts_list: b.parts_list || '',
    destination: b.destination || '',
    inquiry_type: b.inquiry_type || '',
    reference: b.reference || '',
  };
}

async function handleWebhook(request, env) {
  let rawBody = {};
  try {
    rawBody = await request.json();
  } catch (err) {
    rawBody = {};
  }
  const payload = normalizePayload(rawBody);

  const result = {
    status: 'success',
    reference: payload.reference,
    notion: 'error',
    sheet: 'error',
    gmail: 'error',
  };

  const [notionRes, sheetRes, gmailRes] = await Promise.allSettled([
    createInquiry(env, payload),
    appendRow(env, payload),
    createDraft(env, payload),
  ]);

  if (notionRes.status === 'fulfilled') {
    result.notion = notionRes.value.notion;
    if (notionRes.value.duplicate) {
      result.status = 'duplicate';
    }
  } else {
    console.error('Notion step failed:', notionRes.reason);
    result.notion = 'error';
  }

  if (sheetRes.status === 'fulfilled') {
    result.sheet = sheetRes.value.sheet;
  } else {
    console.error('Sheets step failed:', sheetRes.reason);
    result.sheet = 'error';
  }

  if (gmailRes.status === 'fulfilled') {
    result.gmail = gmailRes.value.gmail;
  } else {
    console.error('Gmail step failed:', gmailRes.reason);
    result.gmail = 'error';
  }

  return json(result);
}

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);

      if (url.pathname === '/' && request.method === 'GET') {
        return json({ status: 'ok', service: 'dmchamp-notion' });
      }

      if (url.pathname === '/oauth/start' && request.method === 'GET') {
        return handleOAuthStart(env);
      }

      if (url.pathname === '/oauth/callback' && request.method === 'GET') {
        return await handleOAuthCallback(url, env);
      }

      if (url.pathname === '/webhook' && request.method === 'POST') {
        return await handleWebhook(request, env);
      }

      return json({ status: 'success', reference: '', notion: 'skipped', sheet: 'skipped', gmail: 'skipped' });
    } catch (err) {
      console.error('Unhandled worker error:', err);
      return json({ status: 'success', reference: '', notion: 'error', sheet: 'error', gmail: 'error' });
    }
  },
};
