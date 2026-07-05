import { getStore } from '@netlify/blobs';

export default async () => {
  try {
    const store = getStore('netzone');
    const inquiries = await store.get('inquiries', { type: 'json' });
    return Response.json(Array.isArray(inquiries) ? inquiries : []);
  } catch (err) {
    console.error('get-inquiries error:', err.message);
    return Response.json([]);
  }
};

export const config = { path: '/api/get-inquiries' };
