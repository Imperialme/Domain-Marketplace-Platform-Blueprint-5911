const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let domains;
  try {
    domains = JSON.parse(event.body);
    if (!Array.isArray(domains)) throw new Error('Expected array');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON — expected array' }) };
  }

  try {
    const store = getStore('netzone');
    await store.setJSON('domains', domains);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true, count: domains.length }),
    };
  } catch (err) {
    console.error('set-domains:', err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
