const { getStore } = require('@netlify/blobs');

exports.handler = async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  };

  try {
    const store = getStore('netzone');
    const domains = await store.get('domains', { type: 'json' });
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(Array.isArray(domains) ? domains : []),
    };
  } catch (err) {
    console.error('get-domains:', err.message);
    return { statusCode: 200, headers, body: '[]' };
  }
};
