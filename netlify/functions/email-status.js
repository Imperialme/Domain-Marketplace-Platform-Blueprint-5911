export default async () => {
  const key = process.env.MAILGUN_API_KEY || '';
  const domain = process.env.MAILGUN_DOMAIN || '';
  const region = process.env.MAILGUN_REGION || 'us';
  const admin = process.env.VITE_ADMIN_EMAIL || 'ask@netzone.me';

  return Response.json({
    configured: !!(key && domain),
    keySet: !!key,
    keyPrefix: key ? key.slice(0, 6) + '…' : null,
    domainSet: !!domain,
    domain: domain || null,
    region,
    adminEmail: admin,
    apiHost: region === 'eu' ? 'api.eu.mailgun.net' : 'api.mailgun.net',
  });
};

export const config = { path: '/api/email-status' };
