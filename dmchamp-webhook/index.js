require('dotenv').config();

const express = require('express');
const { router: oauthRouter } = require('./oauth');
const notion = require('./notion');
const sheets = require('./sheets');
const gmail = require('./gmail');

const app = express();

app.use(express.json());

app.use('/oauth', oauthRouter);

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'dmchamp-webhook' });
});

function normalizePayload(body = {}) {
  return {
    task_title: body.task_title || '',
    contact_name: body.contact_name || '',
    company: body.company || '',
    email: body.email || '',
    phone: body.phone || '',
    brand_vehicle: body.brand_vehicle || '',
    parts_list: body.parts_list || '',
    destination: body.destination || '',
    inquiry_type: body.inquiry_type || '',
    reference: body.reference || '',
  };
}

app.post('/webhook', async (req, res) => {
  const payload = normalizePayload(req.body);
  const result = {
    status: 'success',
    reference: payload.reference,
    notion: 'error',
    sheet: 'error',
    gmail: 'error',
  };

  try {
    const notionResult = await notion.createInquiry(payload);
    result.notion = notionResult.notion;
    if (notionResult.duplicate) {
      result.status = 'duplicate';
    }
  } catch (err) {
    console.error('Notion step failed:', err.message);
    result.notion = 'error';
  }

  try {
    const sheetResult = await sheets.appendRow(payload);
    result.sheet = sheetResult.sheet;
  } catch (err) {
    console.error('Sheets step failed:', err.message);
    result.sheet = 'error';
  }

  try {
    const gmailResult = await gmail.createDraft(payload);
    result.gmail = gmailResult.gmail;
  } catch (err) {
    console.error('Gmail step failed:', err.message);
    result.gmail = 'error';
  }

  res.status(200).json(result);
});

// Catch-all: never let an unmatched route or thrown error break the 200 contract.
app.use((req, res) => {
  res.status(200).json({ status: 'success', reference: '', notion: 'skipped', sheet: 'skipped', gmail: 'skipped' });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(200).json({ status: 'success', reference: '', notion: 'error', sheet: 'error', gmail: 'error' });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`DM Champ webhook server listening on port ${PORT}`);
});
