const { google } = require('googleapis');
const { getOAuth2Client } = require('./oauth');

const SHEET_TAB = process.env.GOOGLE_SHEET_TAB || 'Spare Parts';

function toISODate(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function appendRow(payload) {
  if (!process.env.GOOGLE_REFRESH_TOKEN) {
    return { sheet: 'skipped_no_refresh_token' };
  }

  const {
    contact_name = '',
    email = '',
    phone = '',
    brand_vehicle = '',
    parts_list = '',
    destination = '',
    inquiry_type = '',
    reference = '',
    task_title = '',
  } = payload;

  const today = new Date();
  const deadline = addDays(today, 2);

  const row = [
    '',
    toISODate(today),
    toISODate(deadline),
    reference,
    inquiry_type,
    contact_name,
    email,
    phone,
    brand_vehicle,
    '',
    parts_list,
    '',
    destination,
    'No',
    0,
    '',
    '',
    '',
    task_title,
  ];

  const auth = getOAuth2Client();
  const sheets = google.sheets({ version: 'v4', auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: `'${SHEET_TAB}'!A1`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  });

  return { sheet: 'appended' };
}

module.exports = { appendRow };
