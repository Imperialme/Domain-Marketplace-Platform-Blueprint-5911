import { toISODate, addDays } from './util.js';

const NOTION_VERSION = '2022-06-28';

function notionHeaders(env) {
  return {
    Authorization: `Bearer ${env.NOTION_TOKEN}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };
}

async function findByReference(env, reference) {
  const res = await fetch(`https://api.notion.com/v1/databases/${env.NOTION_DATABASE_ID}/query`, {
    method: 'POST',
    headers: notionHeaders(env),
    body: JSON.stringify({
      filter: { property: 'Reference', title: { equals: reference } },
      page_size: 1,
    }),
  });

  if (!res.ok) {
    throw new Error(`Notion query failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.results.length > 0;
}

export async function createInquiry(env, payload) {
  if (!env.NOTION_TOKEN) {
    return { notion: 'skipped_no_token', duplicate: false };
  }

  const {
    contact_name = '',
    company = '',
    email = '',
    phone = '',
    brand_vehicle = '',
    parts_list = '',
    destination = '',
    inquiry_type = '',
    reference = '',
  } = payload;

  const isDuplicate = await findByReference(env, reference);
  if (isDuplicate) {
    return { notion: 'duplicate', duplicate: true };
  }

  const today = new Date();
  const deadline = addDays(today, 2);

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: notionHeaders(env),
    body: JSON.stringify({
      parent: { database_id: env.NOTION_DATABASE_ID },
      properties: {
        Reference: { title: [{ text: { content: reference } }] },
        'Customer Name': { rich_text: [{ text: { content: contact_name } }] },
        'Company Name': { rich_text: [{ text: { content: company } }] },
        'Customer Email': { email: email || null },
        'Customer Phone': { phone_number: phone || null },
        'Parts Requested': {
          rich_text: [{ text: { content: `Vehicle: ${brand_vehicle} | Parts: ${parts_list}` } }],
        },
        Destination: { rich_text: [{ text: { content: destination } }] },
        'Inquiry Type': {
          select: { name: ['B2B', 'B2C'].includes(inquiry_type) ? inquiry_type : 'B2C' },
        },
        'Pipeline Stage': { select: { name: 'Pending RFQ' } },
        Status: { select: { name: 'New' } },
        'Ack Sent': { checkbox: false },
        'Duplicate Flag': { select: { name: 'Clean' } },
        'Inquiry Date': { date: { start: toISODate(today) } },
        'Response Deadline': { date: { start: toISODate(deadline) } },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Notion page create failed: ${res.status} ${await res.text()}`);
  }

  return { notion: 'created', duplicate: false };
}
