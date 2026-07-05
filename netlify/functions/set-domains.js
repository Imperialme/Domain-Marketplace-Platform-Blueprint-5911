import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let domains;
  try {
    domains = await req.json();
    if (!Array.isArray(domains)) throw new Error('Expected array');
  } catch {
    return Response.json({ error: 'Invalid JSON — expected array' }, { status: 400 });
  }

  try {
    const store = getStore('netzone');
    await store.setJSON('domains', domains);
    return Response.json({ ok: true, count: domains.length });
  } catch (err) {
    console.error('set-domains error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const config = { path: '/api/set-domains' };
