import { getStore } from '@netlify/blobs';

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let inquiry;
  try {
    inquiry = await req.json();
    if (!inquiry || typeof inquiry !== 'object') throw new Error('Expected object');
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const store = getStore('netzone');
    const existing = await store.get('inquiries', { type: 'json' });
    const list = Array.isArray(existing) ? existing : [];
    list.push(inquiry);
    await store.setJSON('inquiries', list);
    return Response.json({ ok: true, id: inquiry.id });
  } catch (err) {
    console.error('add-inquiry error:', err.message);
    return Response.json({ error: err.message }, { status: 500 });
  }
};

export const config = { path: '/api/add-inquiry' };
