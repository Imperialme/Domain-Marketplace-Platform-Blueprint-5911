import { getStore } from '@netlify/blobs';

export default async () => {
  try {
    const store = getStore('netzone');
    const domains = await store.get('domains', { type: 'json' });
    return Response.json(Array.isArray(domains) ? domains : []);
  } catch (err) {
    console.error('get-domains error:', err.message);
    return Response.json([]);
  }
};

export const config = { path: '/api/get-domains' };
