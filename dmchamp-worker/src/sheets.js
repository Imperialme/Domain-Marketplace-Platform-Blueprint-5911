import { getAccessToken } from './oauth.js';
import { toISODate, addDays } from './util.js';

export async function appendRow(env, payload) {
  if (!env.GOOGLE_REFRESH_TOKEN) {
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

  const accessToken = await getAccessToken(env);
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
