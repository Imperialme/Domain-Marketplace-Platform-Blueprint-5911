import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let inquiries;
  try {
    inquiries = await req.json();
    if (!Array.isArray(inquiries)) throw new Error('Expected array');
  } catch {
    return Response.json({ error: 'Invalid JSON — expected array' }, { status: 400 });
  }

  try {
    const store = getStore('netzone');
    await store.setJSON('inquiries', inquiries);
    return Response.json({ ok: true, count: inquiries.length });
  } catch (err) {
    console.error('set-inquiries error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const config = { path: '/api/set-inquiries' };
