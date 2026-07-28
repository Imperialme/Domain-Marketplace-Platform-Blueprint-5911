const { Client } = require('@notionhq/client');

const DATABASE_ID = process.env.NOTION_DATABASE_ID || '85057367-cbd2-4e2c-a6c4-1f1da4939079';

function getClient() {
  if (!process.env.NOTION_TOKEN) return null;
  return new Client({ auth: process.env.NOTION_TOKEN });
}

async function findByReference(notion, reference) {
  const response = await notion.databases.query({
    database_id: DATABASE_ID,
    filter: {
      property: 'Reference',
      title: { equals: reference },
    },
    page_size: 1,
  });
  return response.results.length > 0;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

async function createInquiry(payload) {
  const notion = getClient();
  if (!notion) {
    return { notion: 'skipped_no_token' };
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

  const isDuplicate = await findByReference(notion, reference);
  if (isDuplicate) {
    return { notion: 'duplicate', duplicate: true };
  }

  const today = new Date();
  const deadline = addDays(today, 2);

  await notion.pages.create({
    parent: { database_id: DATABASE_ID },
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
  });

  return { notion: 'created', duplicate: false };
}

module.exports = { createInquiry };
