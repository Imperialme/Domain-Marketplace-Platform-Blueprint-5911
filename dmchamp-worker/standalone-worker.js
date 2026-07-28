/**
 * DM Champ -> Notion + Google Sheets Webhook (no Gmail)
 * Imperial MEA / SpareParts.me
 *
 * Single-file Cloudflare Worker — paste this whole file into the
 * dmchamp-notion Worker's dashboard editor (Workers & Pages -> dmchamp-notion
 * -> Edit code), then set the variables/secrets listed below and Deploy.
 *
 * Required Variables (Settings -> Variables and Secrets):
 *   NOTION_TOKEN          (Secret)  Notion internal integration token
 *   NOTION_DATABASE_ID    (Text)    Inquiry Library database id (the DATABASE object id,
 *                                   not its data source id -- these differ post Notion's
 *                                   2025 data-source split; this is what "Connections" shares)
 *                                   -- defaults to bc9fb35f-6c36-4685-a800-b160a9a52eb6 if unset
 *   GOOGLE_CLIENT_ID      (Secret)
 *   GOOGLE_CLIENT_SECRET  (Secret)
 *   GOOGLE_REDIRECT_URI   (Text)    e.g. https://dmchamp-notion.<subdomain>.workers.dev/oauth/callback
 *   GOOGLE_REFRESH_TOKEN  (Secret)  leave blank until you complete /oauth/start once
 *   GOOGLE_SHEET_ID       (Text)
 *   GOOGLE_SHEET_TAB      (Text)    defaults to "Spare Parts" if unset
 *
 * Routes:
 *   GET  /              health check
 *   GET  /oauth/start    redirects to Google consent screen
 *   GET  /oauth/callback  exchanges the auth code, shows the refresh token to copy
 *   POST /webhook         DM Champ inquiry payload -> Notion + Google Sheets
 */

const DEFAULT_NOTION_DATABASE_ID = 'bc9fb35f-6c36-4685-a800-b160a9a52eb6';
const NOTION_VERSION = '2022-06-28';
const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'].join(' ');

// ---------- helpers ----------

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function extractReference(title) {
  const t = title || '';
  const match = t.match(/INQ26-[A-Z]+-[A-Z0-9]+/);
  return match ? match[0] : t;
}

function normalizePayload(body) {
  const b = body && typeof body === 'object' ? body : {};
  // DM Champ's actual payload nests contact/message details rather than sending
  // flat top-level fields; fall back to flat fields too so manual/curl testing
  // with the old flat shape still works.
  const contact = b.contact && typeof b.contact === 'object' ? b.contact : {};
  const message = b.message && typeof b.message === 'object' ? b.message : {};

  const contactName =
    [contact.first_name, contact.last_name].filter(Boolean).join(' ') || b.contact_name || '';

  return {
    task_title: message.title || b.task_title || '',
    contact_name: contactName,
    company: b.company || '',
    email: contact.email || b.email || '',
    phone: contact.phone_number || b.phone || '',
    brand_vehicle: b.brand_vehicle || '',
    parts_list: message.description || b.parts_list || '',
    destination: b.destination || '',
    inquiry_type: message.type || b.inquiry_type || '',
    reference: extractReference(message.title) || b.reference || '',
  };
}

// ---------- DM Champ message.description parsing (for Notion fields) ----------

function findLineValue(lines, prefix) {
  const lower = prefix.toLowerCase();
  for (const line of lines) {
    if (line.toLowerCase().startsWith(lower)) {
      return line.slice(prefix.length).trim();
    }
  }
  return null;
}

function findAllLineValues(lines, prefix) {
  const lower = prefix.toLowerCase();
  return lines
    .filter((line) => line.toLowerCase().startsWith(lower))
    .map((line) => line.slice(prefix.length).trim());
}

function mapInquiryType(raw) {
  const normalized = (raw || '').trim().toLowerCase();
  if (normalized.includes('wholesale')) return 'B2B';
  if (normalized.startsWith('b2b')) return 'B2B';
  if (normalized.startsWith('b2c')) return 'B2C';
  return 'B2C';
}

function mapConsigneeCountry(destination) {
  const d = (destination || '').toLowerCase();
  if (d.includes('uae') || d.includes('united arab emirates')) return 'UAE';
  if (d.includes('saudi')) return 'Saudi Arabia';
  if (d.includes('kenya')) return 'Kenya';
  if (d.includes('nigeria')) return 'Nigeria';
  if (d.includes('egypt')) return 'Egypt';
  if (d.includes('angola')) return 'Angola';
  // Iraq, India, and anything else unmapped all fall here.
  return 'Other';
}

function cleanPartName(raw) {
  let name = (raw || '').trim();
  name = name.replace(/[-–]?\s*qty:?\s*\d+\s*$/i, '');
  name = name.replace(/\s*x\s*\d+\s*$/i, '');
  name = name.replace(/\$\s*[\d,]+(\.\d+)?\s*$/, '');
  name = name.replace(/[-–,]\s*$/, '');
  return name.trim();
}

function parseQtyValue(raw) {
  const trimmed = (raw || '').trim();
  if (/^\$/.test(trimmed)) return 0; // dollar amounts are not quantities -- ignore entirely
  const numMatch = trimmed.match(/^-?\d+/);
  if (numMatch) return parseInt(numMatch[0], 10);
  return 1; // non-numeric ("Bulk order", etc.) counts as 1
}

function extractDestination(lines) {
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().startsWith('destination:')) {
      const sameLine = lines[i].slice('destination:'.length).trim();
      if (sameLine) return sameLine;
      return (lines[i + 1] || '').trim();
    }
  }
  return '';
}

function extractVins(description) {
  const vins = [];
  const numberedRegex = /\d+\.\s*[^:\n]+:\s*([A-Za-z0-9]{5,})/g;
  let m;
  while ((m = numberedRegex.exec(description)) !== null) {
    vins.push(m[1].trim());
  }
  if (vins.length === 0) {
    const simpleRegex = /VIN:\s*([A-Za-z0-9]+)/gi;
    while ((m = simpleRegex.exec(description)) !== null) {
      vins.push(m[1].trim());
    }
  }
  return vins;
}

function extractNotes(description) {
  const marker = '--- Additional context ---';
  const idx = description.indexOf(marker);
  if (idx === -1) return '';
  return description.slice(idx + marker.length).trim();
}

function parseDmChampFields(rawBody) {
  const b = rawBody && typeof rawBody === 'object' ? rawBody : {};
  const contact = b.contact && typeof b.contact === 'object' ? b.contact : {};
  const message = b.message && typeof b.message === 'object' ? b.message : {};

  const title = message.title || '';
  const description = message.description || '';
  const lines = description
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const contactFullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ');
  const partLines = findAllLineValues(lines, 'Part:');
  const qtyLines = findAllLineValues(lines, 'Qty:');
  const destination = extractDestination(lines);

  return {
    reference: extractReference(title),
    contactName: findLineValue(lines, 'Name:') || contactFullName || '',
    companyName: findLineValue(lines, 'Company:') || '',
    vin: extractVins(description).join(', '),
    destination,
    consigneeCountry: mapConsigneeCountry(destination),
    partsText: partLines.map(cleanPartName).filter(Boolean).join(', '),
    inquiryType: mapInquiryType(findLineValue(lines, 'Inquiry Type:')),
    notes: extractNotes(description),
    lineItems: partLines.length,
    totalQuantity: qtyLines.map(parseQtyValue).reduce((sum, q) => sum + q, 0),
    email: contact.email || '',
    phone: contact.phone_number || '',
  };
}

// ---------- Notion ----------

function notionHeaders(env) {
  return {
    Authorization: `Bearer ${env.NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

async function notionFindByReference(env, databaseId, reference) {
  console.log(`[notion] querying database ${databaseId} for reference "${reference}"`);

  let res;
  try {
    res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: notionHeaders(env),
      body: JSON.stringify({
        filter: { property: 'Reference', title: { equals: reference } },
        page_size: 1,
      }),
    });
  } catch (networkErr) {
    console.error(`[notion] query THREW a network/fetch exception: ${networkErr.stack || networkErr.message}`);
    throw new Error(`Notion query network error: ${networkErr.message}`);
  }

  if (!res.ok) {
    let bodyText;
    try {
      bodyText = await res.text();
    } catch (readErr) {
      bodyText = `<could not read response body: ${readErr.message}>`;
    }
    console.error(
      `[notion] query FAILED — status ${res.status} on database ${databaseId}. Response body: ${bodyText}`
    );
    throw new Error(`Notion query failed: ${res.status} ${bodyText}`);
  }

  let data;
  try {
    data = await res.json();
  } catch (parseErr) {
    console.error(`[notion] query returned ok but body wasn't valid JSON: ${parseErr.message}`);
    throw new Error(`Notion query response parse error: ${parseErr.message}`);
  }

  console.log(`[notion] query ok — ${data.results.length} existing match(es) for "${reference}"`);
  return data.results.length > 0;
}

async function notionCreateInquiry(env, rawBody) {
  try {
    if (!env.NOTION_TOKEN) {
      console.error('[notion] NOTION_TOKEN is not set — skipping Notion write entirely.');
      return { notion: 'skipped_no_token', duplicate: false };
    }

    const databaseId = env.NOTION_DATABASE_ID || DEFAULT_NOTION_DATABASE_ID;
    console.log(
      `[notion] starting createInquiry — database=${databaseId} tokenPrefix=${env.NOTION_TOKEN.slice(0, 8)}...`
    );

    const parsed = parseDmChampFields(rawBody);
    console.log(
      `[notion] parsed fields: reference="${parsed.reference}" contactName="${parsed.contactName}" ` +
        `companyName="${parsed.companyName}" vin="${parsed.vin}" destination="${parsed.destination}" ` +
        `consigneeCountry="${parsed.consigneeCountry}" inquiryType="${parsed.inquiryType}" ` +
        `partsText="${parsed.partsText}" lineItems=${parsed.lineItems} totalQuantity=${parsed.totalQuantity} ` +
        `notes="${parsed.notes}"`
    );

    const isDuplicate = await notionFindByReference(env, databaseId, parsed.reference);
    if (isDuplicate) {
      console.log(`[notion] reference "${parsed.reference}" already exists — skipping page create.`);
      return { notion: 'duplicate', duplicate: true };
    }

    const today = new Date();
    const deadline = addDays(today, 3);

    const properties = {
      Reference: { title: [{ text: { content: parsed.reference } }] },
      'Customer Name': { rich_text: [{ text: { content: parsed.contactName } }] },
      'Customer Email': { email: parsed.email || null },
      'Customer Phone': { phone_number: parsed.phone || null },
      VIN: { rich_text: [{ text: { content: parsed.vin } }] },
      Destination: { rich_text: [{ text: { content: parsed.destination } }] },
      'Consignee Country': { select: { name: parsed.consigneeCountry } },
      'Parts Requested': { rich_text: [{ text: { content: parsed.partsText } }] },
      'Inquiry Type': { select: { name: parsed.inquiryType } },
      'Pipeline Stage': { select: { name: 'Pending RFQ' } },
      Status: { select: { name: 'New' } },
      'Duplicate Flag': { select: { name: 'Clean' } },
      'Ack Sent': { checkbox: false },
      'Supplier Quote Received': { checkbox: false },
      'Inquiry Date': { date: { start: toISODate(today) } },
      'Response Deadline': { date: { start: toISODate(deadline) } },
      Notes: { rich_text: [{ text: { content: parsed.notes } }] },
      'Line Items': { number: parsed.lineItems },
      'Total Quantity': { number: parsed.totalQuantity },
    };

    if (parsed.companyName) {
      properties['Company Name'] = { rich_text: [{ text: { content: parsed.companyName } }] };
    }

    let res;
    try {
      res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: notionHeaders(env),
        body: JSON.stringify({
          parent: { database_id: databaseId },
          properties,
        }),
      });
    } catch (networkErr) {
      console.error(
        `[notion] page create THREW a network/fetch exception: ${networkErr.stack || networkErr.message}`
      );
      throw new Error(`Notion page create network error: ${networkErr.message}`);
    }

    if (!res.ok) {
      let bodyText;
      try {
        bodyText = await res.text();
      } catch (readErr) {
        bodyText = `<could not read response body: ${readErr.message}>`;
      }
      console.error(
        `[notion] page create FAILED — status ${res.status} on database ${databaseId}. Response body: ${bodyText}`
      );
      throw new Error(`Notion page create failed: ${res.status} ${bodyText}`);
    }

    let created;
    try {
      created = await res.json();
    } catch (parseErr) {
      console.error(`[notion] page create returned ok but body wasn't valid JSON: ${parseErr.message}`);
      throw new Error(`Notion page create response parse error: ${parseErr.message}`);
    }

    console.log(`[notion] page created ok — id=${created.id}`);
    return { notion: 'created', duplicate: false };
  } catch (err) {
    console.error(`[notion] createInquiry caught exception: ${err.stack || err.message}`);
    throw err;
  }
}

// ---------- Google OAuth ----------

async function googleGetAccessToken(env) {
  if (!env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('missing_refresh_token');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token;
}

function oauthStart(env) {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', env.GOOGLE_REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('scope', GOOGLE_SCOPES);

  return Response.redirect(url.toString(), 302);
}

async function oauthCallback(requestUrl, env) {
  const error = requestUrl.searchParams.get('error');
  const code = requestUrl.searchParams.get('code');

  if (error) {
    return new Response(`OAuth error: ${error}`, { status: 200 });
  }
  if (!code) {
    return new Response('Missing authorization code.', { status: 200 });
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    return new Response(`OAuth callback failed: ${await res.text()}`, { status: 200 });
  }

  const tokens = await res.json();

  if (!tokens.refresh_token) {
    return new Response(
      'No refresh token returned. Revoke app access at https://myaccount.google.com/permissions and try /oauth/start again with prompt=consent.',
      { status: 200 }
    );
  }

  return new Response(
    `Copy this value and set it as the GOOGLE_REFRESH_TOKEN secret, then redeploy:\n\n${tokens.refresh_token}`,
    { status: 200, headers: { 'content-type': 'text/plain' } }
  );
}

// ---------- Google Sheets ----------

async function sheetsAppendRow(env, payload) {
  if (!env.GOOGLE_REFRESH_TOKEN) {
    return { sheet: 'skipped_no_refresh_token' };
  }

  const {
    contact_name, email, phone, brand_vehicle, parts_list,
    destination, inquiry_type, reference, task_title,
  } = payload;

  const today = new Date();
  const deadline = addDays(today, 2);

  const row = [
    '', toISODate(today), toISODate(deadline), reference, inquiry_type,
    contact_name, email, phone, brand_vehicle, '', parts_list, '',
    destination, 'No', 0, '', '', '', task_title,
  ];

  const accessToken = await googleGetAccessToken(env);
  const tab = env.GOOGLE_SHEET_TAB || 'Spare Parts';
  const range = encodeURIComponent(`'${tab}'!A1`);

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
    }
  );

  if (!res.ok) {
    throw new Error(`Sheets append failed: ${res.status} ${await res.text()}`);
  }

  return { sheet: 'appended' };
}

// ---------- webhook ----------

async function handleWebhook(request, env) {
  const rawText = await request.text();
  console.log(`[webhook] raw request body: ${rawText}`);

  let rawBody = {};
  try {
    rawBody = JSON.parse(rawText);
  } catch (err) {
    console.error(`[webhook] raw body is not valid JSON: ${err.message}`);
    rawBody = {};
  }

  const fieldNames = rawBody && typeof rawBody === 'object' ? Object.keys(rawBody) : [];
  console.log(`[webhook] parsed field names: ${fieldNames.join(', ') || '(none)'}`);

  const payload = normalizePayload(rawBody);
  console.log(
    `[webhook] mapped payload: reference="${payload.reference}" contact_name="${payload.contact_name}" ` +
      `email="${payload.email}" phone="${payload.phone}" inquiry_type="${payload.inquiry_type}" ` +
      `parts_list="${payload.parts_list}"`
  );

  const result = {
    status: 'success',
    reference: payload.reference,
    notion: 'error',
    sheet: 'error',
  };

  const [notionRes, sheetRes] = await Promise.allSettled([
    notionCreateInquiry(env, rawBody),
    sheetsAppendRow(env, payload),
  ]);

  if (notionRes.status === 'fulfilled') {
    result.notion = notionRes.value.notion;
    if (notionRes.value.duplicate) {
      result.status = 'duplicate';
    }
  } else {
    console.error(
      `[webhook] Notion step threw for reference="${payload.reference}": ${notionRes.reason && notionRes.reason.message}`
    );
    result.notion = 'error';
  }

  if (sheetRes.status === 'fulfilled') {
    result.sheet = sheetRes.value.sheet;
  } else {
    console.error(
      `[webhook] Sheets step threw for reference="${payload.reference}": ${sheetRes.reason && sheetRes.reason.message}`
    );
    result.sheet = 'error';
  }

  return json(result);
}

// ---------- entrypoint ----------

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      // Normalize away a trailing slash (e.g. "/webhook/") so it still matches "/webhook".
      const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname;
      console.log(`[router] ${request.method} ${url.pathname}${url.search} (normalized: ${path})`);

      if (path === '/' && request.method === 'GET') {
        return json({ status: 'ok', service: 'dmchamp-notion' });
      }

      if (path === '/oauth/start' && request.method === 'GET') {
        return oauthStart(env);
      }

      if (path === '/oauth/callback' && request.method === 'GET') {
        return await oauthCallback(url, env);
      }

      if (path === '/webhook' && request.method === 'POST') {
        return await handleWebhook(request, env);
      }

      console.error(
        `[router] no route matched ${request.method} ${url.pathname} — falling through to skipped response. ` +
          `If DM Champ is supposed to be hitting /webhook, check its configured URL/method.`
      );
      return json({ status: 'success', reference: '', notion: 'skipped', sheet: 'skipped' });
    } catch (err) {
      console.error('Unhandled worker error:', err);
      return json({ status: 'success', reference: '', notion: 'error', sheet: 'error' });
    }
  },
};
