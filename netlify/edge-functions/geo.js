// Netlify Edge Function — returns visitor geo data from Netlify's built-in context.
// No external API call needed. Free with any Netlify plan.
// Deployed automatically at /api/geo when the site is on Netlify.
export default async (request, context) => {
  const geo = context.geo || {};

  // Netlify injects the real client IP
  const ip =
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    null;

  const payload = {
    ip,
    country: geo.country?.code || null,
    countryName: geo.country?.name || null,
    city: geo.city || null,
    latitude: geo.latitude || null,
    longitude: geo.longitude || null,
    timezone: geo.timezone?.name || null,
    subdivision: geo.subdivision?.code || null,
  };

  return Response.json(payload, {
    headers: {
      'Cache-Control': 'no-store, no-cache',
      'Access-Control-Allow-Origin': '*',
    },
  });
};

export const config = { path: '/api/geo' };
