/**
 * DM Champ -> Notion + Google Sheets Webhook
 * Imperial MEA / SpareParts.me
 *
 * Single-file Cloudflare Worker — paste this whole file into the
 * dmchamp-notion Worker's dashboard editor (Workers & Pages -> dmchamp-notion
 * -> Edit code), then set the variables/secrets listed below and Deploy.
 *
 * Required Variables (Settings -> Variables and Secrets):
 *   NOTION_TOKEN          (Secret)  Notion internal integration token
 *   NOTION_DATABASE_ID    (Text)    Inquiry Library DATABASE (container) id --
 *                                   NOT the data source id (these differ post
 *                                   Notion's 2025 data-source split; this is
 *                                   the id "Connections" sharing is attached to)
 *                                   -- defaults to bc9fb35f-6c36-4685-a800-b160a9a52eb6 if unset
 *                                   (data source/collection id, for reference: 85057367-cbd2-4e2c-a6c4-1f1da4939079)
 *   GOOGLE_CLIENT_ID      (Secret)
 *   GOOGLE_CLIENT_SECRET  (Secret)
 *   GOOGLE_REDIRECT_URI   (Text)    e.g. https://dmchamp-notion.<subdomain>.workers.dev/oauth/callback
 *   GOOGLE_REFRESH_TOKEN  (Secret)  leave blank until you complete /oauth/start once
 *   GOOGLE_SHEET_ID       (Text)
 *   GOOGLE_SHEET_TAB      (Text)    defaults to "Spare Parts" if unset
 *
 * Routes:
 *   GET  /               health check
 *   GET  /oauth/start    redirects to Google consent screen
 *   GET  /oauth/callback exchanges the auth code, shows the refresh token to copy
 *   POST /webhook        (or /webhook/) DM Champ inquiry payload -> Notion + Google Sheets
 */

const DEFAULT_NOTION_DATABASE_ID = 'bc9fb35f-6c36-4685-a800-b160a9a52eb6';
const NOTION_VERSION = '2022-06-28';
const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/spreadsheets'].join(' ');

// ---------- generic helpers ----------

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
  const match = t.match(/INQ26-[A-Z0-9]+-[A-Z0-9]+/);
  return match ? match[0] : t;
}

// Reference is primarily the code embedded in message.title; if the title
// doesn't contain a proper INQ26 code, also look for one anywhere in the
// description (e.g. a "Ref:" line) before falling back to the raw title.
function deriveReference(title, description) {
  const fromTitle = extractReference(title);
  if (/INQ26-[A-Z0-9]+-[A-Z0-9]+/.test(fromTitle)) return fromTitle;
  const descMatch = (description || '').match(/INQ26-[A-Z0-9]+-[A-Z0-9]+/);
  if (descMatch) return descMatch[0];
  return fromTitle;
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
    reference: deriveReference(message.title, message.description) || b.reference || '',
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

function labelExistsInLines(lines, label) {
  const lower = label.toLowerCase();
  return lines.some((l) => l.toLowerCase().startsWith(lower));
}

function checkUnmapped(label, exists, value) {
  if (exists && !value) {
    console.warn(`[parser] WARN unmapped field: ${label}`);
  }
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
  const uaeCities = ['abu dhabi', 'dubai', 'sharjah', 'ajman', 'fujairah', 'ras al khaimah', 'umm al quwain', 'al ain'];
  if (d.includes('uae') || d.includes('united arab emirates') || uaeCities.some((c) => d.includes(c))) return 'UAE';
  if (d.includes('saudi') || d.includes('riyadh') || d.includes('jeddah') || d.includes('dammam')) return 'Saudi Arabia';
  if (d.includes('kenya') || d.includes('nairobi') || d.includes('mombasa')) return 'Kenya';
  if (d.includes('nigeria') || d.includes('lagos') || d.includes('abuja')) return 'Nigeria';
  if (d.includes('egypt') || d.includes('cairo') || d.includes('alexandria')) return 'Egypt';
  if (d.includes('angola') || d.includes('luanda')) return 'Angola';
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

// Extracts a quantity embedded directly within a part entry's own text, e.g.
// "... (26060-VK925) Qty: 1" or "... Air Filter x2". Returns null if no
// quantity marker is present in this particular entry's text at all.
function extractQtyFromText(text) {
  const qtyLabelMatch = text.match(/Qty:\s*(\S+)/i);
  if (qtyLabelMatch) return parseQtyValue(qtyLabelMatch[1]);
  const xMatch = text.match(/x\s*(\d+)\s*$/i);
  if (xMatch) return parseInt(xMatch[1], 10);
  return null;
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

function looksLikeVin(value) {
  return /^[A-Za-z0-9]{8,20}$/.test(value) && !/^\d+$/.test(value);
}

// Numbered lists ("1. Dezire: MA3..." or "1. Headlight assembly (26060-VK925) Qty: 1")
// are disambiguated structurally: a VIN entry is "N. Label: Value" where Value
// actually looks VIN-shaped (alphanumeric, not pure digits, 8-20 chars) -- NOT
// just "has a colon", since part lines can also contain a colon (e.g. "Qty: 1").
// Everything numbered that isn't a VIN match is treated as a part entry.
function classifyNumberedEntries(description) {
  const lineRegex = /^(\d+)\.\s*(.+)$/gm;
  const vinEntries = [];
  const partEntries = [];
  let m;
  while ((m = lineRegex.exec(description)) !== null) {
    const number = m[1];
    const content = m[2].trim();
    const vinMatch = content.match(/^(.+):\s*(\S+)$/);
    if (vinMatch && looksLikeVin(vinMatch[2])) {
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
      entries: partEntries,
    };
  }
  // Fallback: old "Part:" line-prefix style, renumbered sequentially to match the same format.
  // A bare "Part:" header line with nothing after it (its items are on separate lines,
  // handled by the numbered-entry path above) contributes no entry here.
  const partLines = findAllLineValues(lines, 'Part:').filter((text) => text.length > 0);
  const entries = partLines.map((text, i) => ({ number: String(i + 1), content: text }));
  return {
    partsText: entries.map((e) => `${e.number}. ${e.content}`).join(' | '),
    lineItems: entries.length,
    entries,
  };
}

// Total Quantity: if standalone "Qty:" lines exist anywhere (older DM Champ
// format where quantity is a fully separate line from the part description),
// use those exclusively. Otherwise derive quantity per part entry from an
// embedded "Qty: N" or trailing "xN" marker, defaulting missing entries to 1
// ("Bulk orders with no numeric qty = 1 per line").
function computeTotalQuantity(lines, partEntries) {
  const standaloneQtyLines = findAllLineValues(lines, 'Qty:');
  if (standaloneQtyLines.length > 0) {
    return standaloneQtyLines.map(parseQtyValue).reduce((sum, q) => sum + q, 0);
  }
  return partEntries.reduce((sum, e) => {
    const embedded = extractQtyFromText(e.content);
    return sum + (embedded !== null ? embedded : 1);
  }, 0);
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
  // Regex-based extraction (numbered-list VIN/part disambiguation) relies on "^" matching
  // the start of each line; indented sub-items in the raw text (e.g. "  1. Headlight...")
  // would otherwise fail to match. Use the already-trimmed lines rejoined for extraction,
  // while `description` (the true raw text) is preserved untouched for Notes/Updated Notes.
  const normalizedDescription = lines.join('\n');

  const contactFullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ');
  const destination = extractDestination(lines);
  const vehicle = findLineValue(lines, 'Brand/Vehicle:') || '';
  const vinList = extractVins(normalizedDescription);
  const parts = extractParts(normalizedDescription, lines);
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
    reference: deriveReference(title, description),
    contactName: nameRaw || contactFullName || '',
    companyName: findLineValue(lines, 'Company:') || '',
    vin: vinList.join(', '),
    vehicle,
    destination,
    consigneeCountry: mapConsigneeCountry(destination),
    partsText: parts.partsText,
    partEntries: parts.entries,
    inquiryType: mapInquiryType(inquiryTypeRaw),
    description,
    lineItems: parts.lineItems,
    totalQuantity: computeTotalQuantity(lines, parts.entries),
    email: contact.email || emailRawLine || '',
    phone: contact.phone_number || phoneRawLine || '',
  };
}

// Builds the permanent, create-time-only Notes summary block. Never touched again.
function buildInquirySummary(parsed, todayISO) {
  const partsListText =
    parsed.partEntries.length > 0
      ? parsed.partEntries.map((e) => `${e.number}. ${e.content}`).join('\n')
      : '(none)';

  return [
    'INQUIRY SUMMARY',
    '===============',
    `Reference     : ${parsed.reference}`,
    `Date          : ${todayISO}`,
    `Customer Name : ${parsed.contactName}`,
    `Email         : ${parsed.email}`,
    `Phone         : ${parsed.phone}`,
    `Country       : ${parsed.consigneeCountry}`,
    `Vehicle       : ${parsed.vehicle}`,
    `VIN           : ${parsed.vin}`,
    `Inquiry Type  : ${parsed.inquiryType}`,
    '',
    'PARTS REQUIRED',
    '==============',
    partsListText,
    '',
    'RAW MESSAGE',
    '===========',
    parsed.description,
  ].join('\n');
}

function plainTextFromRichText(richTextArray) {
  if (!Array.isArray(richTextArray)) return '';
  return richTextArray.map((t) => t.plain_text || (t.text && t.text.content) || '').join('');
}

function nextUpdateNumber(existingUpdatedNotesText) {
  const matches = existingUpdatedNotesText.match(/^\[\d+\]\s\[\d{4}-\d{2}-\d{2}\]\s\[.+\]$/gm) || [];
  return matches.length + 1;
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
  return data.results.length > 0 ? data.results[0] : null;
}

async function notionWriteRequest(method, url, env, body) {
  let res;
  try {
    res = await fetch(url, { method, headers: notionHeaders(env), body: JSON.stringify(body) });
  } catch (networkErr) {
    console.error(`[notion] ${method} ${url} THREW a network/fetch exception: ${networkErr.stack || networkErr.message}`);
    throw new Error(`Notion ${method} network error: ${networkErr.message}`);
  }

  if (!res.ok) {
    let bodyText;
    try {
      bodyText = await res.text();
    } catch (readErr) {
      bodyText = `<could not read response body: ${readErr.message}>`;
    }
    console.error(`[notion] ${method} ${url} FAILED — status ${res.status}. Response body: ${bodyText}`);
    throw new Error(`Notion ${method} failed: ${res.status} ${bodyText}`);
  }

  try {
    return await res.json();
  } catch (parseErr) {
    console.error(`[notion] ${method} ${url} returned ok but body wasn't valid JSON: ${parseErr.message}`);
    throw new Error(`Notion ${method} response parse error: ${parseErr.message}`);
  }
}

function richText(content) {
  return { rich_text: [{ text: { content } }] };
}

async function notionCreateInquiry(env, rawBody) {
  try {
    if (!env.NOTION_TOKEN) {
      console.error('[notion] NOTION_TOKEN is not set — skipping Notion write entirely.');
      return { notion: 'skipped_no_token' };
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
        `partsText="${parsed.partsText}" lineItems=${parsed.lineItems} totalQuantity=${parsed.totalQuantity}`
    );

    const today = new Date();
    const todayISO = toISODate(today);
    const existingPage = await notionFindByReference(env, databaseId, parsed.reference);

    if (existingPage) {
      console.log(`[notion] reference "${parsed.reference}" exists — updating existing page ${existingPage.id}`);

      const existingPipelineStage =
        (existingPage.properties['Pipeline Stage'] && existingPage.properties['Pipeline Stage'].select
          ? existingPage.properties['Pipeline Stage'].select.name
          : '') || '';
      const existingUpdatedNotesText = plainTextFromRichText(
        existingPage.properties['Updated Notes'] && existingPage.properties['Updated Notes'].rich_text
      );

      const updateNumber = nextUpdateNumber(existingUpdatedNotesText);
      const newBlock = `[${updateNumber}] [${todayISO}] [${parsed.reference}]\n---\n${parsed.description}`;
      const updatedNotesValue = existingUpdatedNotesText
        ? `${existingUpdatedNotesText}\n\n${newBlock}`
        : newBlock;

      const updateProps = {};
      const updatedFieldNames = [];

      function maybeSet(name, value, propBuilder) {
        const nonEmpty = typeof value === 'number' ? value > 0 : !!value;
        if (nonEmpty) {
          updateProps[name] = propBuilder(value);
          updatedFieldNames.push(name);
        }
      }

      maybeSet('Customer Name', parsed.contactName, richText);
      maybeSet('Customer Email', parsed.email, (v) => ({ email: v }));
      maybeSet('Customer Phone', parsed.phone, (v) => ({ phone_number: v }));
      maybeSet('Parts Requested', parsed.partsText, richText);
      maybeSet('VIN', parsed.vin, richText);
      maybeSet('Destination', parsed.destination, richText);
      maybeSet('Line Items', parsed.lineItems, (v) => ({ number: v }));
      maybeSet('Total Quantity', parsed.totalQuantity, (v) => ({ number: v }));
      maybeSet('Inquiry Type', parsed.inquiryType, (v) => ({ select: { name: v } }));
      maybeSet('Consignee Country', parsed.consigneeCountry, (v) => ({ select: { name: v } }));
      maybeSet('Company Name', parsed.companyName, richText);

      // Updated Notes is cumulative history -- always appended, regardless of
      // whether anything else on this update was non-empty.
      updateProps['Updated Notes'] = richText(updatedNotesValue);

      if (existingPipelineStage === 'Pending RFQ' || existingPipelineStage === 'Incomplete') {
        updateProps['Response Deadline'] = { date: { start: toISODate(addDays(today, 3)) } };
        updatedFieldNames.push('Response Deadline');
      }

      await notionWriteRequest('PATCH', `https://api.notion.com/v1/pages/${existingPage.id}`, env, {
        properties: updateProps,
      });

      console.log(`[notion] updated fields: ${updatedFieldNames.join(', ') || '(none -- only Updated Notes appended)'}`);
      console.log('[notion] preserved workflow fields on update');

      return { notion: 'updated' };
    }

    console.log(`[notion] creating new page for reference "${parsed.reference}"`);
    const deadline = addDays(today, 3);
    const summaryNotes = buildInquirySummary(parsed, todayISO);

    const properties = {
      Reference: { title: [{ text: { content: parsed.reference } }] },
      'Customer Name': richText(parsed.contactName),
      'Customer Email': { email: parsed.email || null },
      'Customer Phone': { phone_number: parsed.phone || null },
      VIN: richText(parsed.vin),
      Destination: richText(parsed.destination),
      'Consignee Country': { select: { name: parsed.consigneeCountry } },
      'Parts Requested': richText(parsed.partsText),
      'Inquiry Type': { select: { name: parsed.inquiryType } },
      'Pipeline Stage': { select: { name: 'Pending RFQ' } },
      Status: { select: { name: 'New' } },
      'Duplicate Flag': { select: { name: 'Clean' } },
      'Ack Sent': { checkbox: false },
      'Supplier Quote Received': { checkbox: false },
      'Inquiry Date': { date: { start: todayISO } },
      'Response Deadline': { date: { start: toISODate(deadline) } },
      Notes: richText(summaryNotes),
      'Updated Notes': { rich_text: [] },
      'Line Items': { number: parsed.lineItems },
      'Total Quantity': { number: parsed.totalQuantity },
    };

    if (parsed.companyName) {
      properties['Company Name'] = richText(parsed.companyName);
    }

    const created = await notionWriteRequest('POST', 'https://api.notion.com/v1/pages', env, {
      parent: { database_id: databaseId },
      properties,
    });

    console.log(`[notion] page created ok — id=${created.id}`);
    return { notion: 'created' };
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
  const deadline = addDays(today, 3);

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
  const parsedForLog = parseDmChampFields(rawBody);
  console.log(
    `[webhook] mapped payload: reference=${parsedForLog.reference} email=${parsedForLog.email} ` +
      `name=${parsedForLog.contactName} parts=${parsedForLog.partsText} qty=${parsedForLog.totalQuantity} ` +
      `lineitems=${parsedForLog.lineItems}`
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
      console.log(`[router] ${request.method} ${path}${url.search}`);

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
