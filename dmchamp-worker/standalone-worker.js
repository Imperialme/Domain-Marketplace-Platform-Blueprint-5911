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

function labelExistsInLines(lines, label) {
  const lower = label.toLowerCase();
  return lines.some((l) => l.toLowerCase().startsWith(lower));
}

function checkUnmapped(label, exists, value) {
  if (exists && !value) {
    console.warn(`[parser] WARN unmapped field: ${label}`);
  }
}

// Numbered lists ("1. Dezire: MA3..." or "1. Headlight assembly (26060-VK925) x1") are
// disambiguated structurally: a VIN entry is "N. Label: Value" (has a colon), a part
// entry is everything else numbered that isn't a VIN line.
function classifyNumberedEntries(description) {
  const lineRegex = /^(\d+)\.\s*(.+)$/gm;
  const vinEntries = [];
  const partEntries = [];
  let m;
  while ((m = lineRegex.exec(description)) !== null) {
    const number = m[1];
    const content = m[2].trim();
    const vinMatch = content.match(/^([^:]+):\s*(\S+)$/);
    if (vinMatch) {
      vinEntries.push(`${vinMatch[1].trim()}: ${vinMatch[2].trim()}`);
    } else {
      partEntries.push({ number, content });
    }
  }
  return { vinEntries, partEntries };
}

function extractVins(description) {
  const { vinEntries } = classifyNumberedEntries(description);
  if (vinEntries.length > 0) return vinEntries;

  const simpleMatches = [];
  const simpleRegex = /VIN:\s*(\S+)/gi;
  let m;
  while ((m = simpleRegex.exec(description)) !== null) {
    simpleMatches.push(m[1].trim());
  }
  if (simpleMatches.length > 0) return simpleMatches;

  // Last resort so we're "never null if any VIN-like token exists": a bare standard-length
  // (17-char) VIN token anywhere in the text, even with no label at all.
  return description.match(/\b[A-HJ-NPR-Z0-9]{17}\b/g) || [];
}

function extractParts(description, lines) {
  const { partEntries } = classifyNumberedEntries(description);
  if (partEntries.length > 0) {
    return {
      partsText: partEntries.map((e) => `${e.number}. ${e.content}`).join(' | '),
      lineItems: partEntries.length,
    };
  }
  // Fallback: old "Part:" line-prefix style, renumbered sequentially to match the same format.
  const partLines = findAllLineValues(lines, 'Part:');
  return {
    partsText: partLines.map((text, i) => `${i + 1}. ${text}`).join(' | '),
    lineItems: partLines.length,
  };
}

function buildNotes(description, vehicle) {
  if (!description) return '';
  const prefix = vehicle ? `Vehicle: ${vehicle}\n\n` : '';
  return `${prefix}${description}`;
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
  const qtyLines = findAllLineValues(lines, 'Qty:');
  const destination = extractDestination(lines);
  const vehicle = findLineValue(lines, 'Brand/Vehicle:') || '';
  const vinList = extractVins(description);
  const parts = extractParts(description, lines);
  const nameRaw = findLineValue(lines, 'Name:');
  const emailRawLine = findLineValue(lines, 'Email:');
  const phoneRawLine = findLineValue(lines, 'Phone:');
  const refRaw = findLineValue(lines, 'Ref:');
  const inquiryTypeRaw = findLineValue(lines, 'Inquiry Type:');

  // Validation: flag any labelled line that exists in the raw text but produced no
  // usable value, so format drift from DM Champ is caught immediately in the logs.
  checkUnmapped('Name:', labelExistsInLines(lines, 'Name:'), nameRaw);
  checkUnmapped('Email:', labelExistsInLines(lines, 'Email:'), emailRawLine);
  checkUnmapped('Phone:', labelExistsInLines(lines, 'Phone:'), phoneRawLine);
  checkUnmapped('Ref:', labelExistsInLines(lines, 'Ref:'), refRaw);
  checkUnmapped('VIN:', description.toLowerCase().includes('vin'), vinList.length > 0 ? 'found' : '');
  checkUnmapped('Part:', description.toLowerCase().includes('part'), parts.lineItems > 0 ? 'found' : '');
  checkUnmapped('Destination:', labelExistsInLines(lines, 'Destination:'), destination);
  checkUnmapped('Brand/Vehicle:', labelExistsInLines(lines, 'Brand/Vehicle:'), vehicle);
  checkUnmapped('Inquiry Type:', labelExistsInLines(lines, 'Inquiry Type:'), inquiryTypeRaw);

  return {
    reference: extractReference(title),
    contactName: nameRaw || contactFullName || '',
    companyName: findLineValue(lines, 'Company:') || '',
    vin: vinList.join(', '),
    destination,
    consigneeCountry: mapConsigneeCountry(destination),
    partsText: parts.partsText,
    inquiryType: mapInquiryType(inquiryTypeRaw),
    notes: buildNotes(description, vehicle),
    lineItems: parts.lineItems,
    totalQuantity: qtyLines.map(parseQtyValue).reduce((sum, q) => sum + q, 0),
    email: contact.email || emailRawLine || '',
    phone: contact.phone_number || phoneRawLine || '',
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
