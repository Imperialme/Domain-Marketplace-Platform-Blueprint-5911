export default async (req) => {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get('domain');
  if (!domain) return Response.json({ error: 'No domain specified' }, { status: 400 });

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(`https://${domain}`, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'NetZone-VerifyBot/1.0' },
    });
    clearTimeout(timer);
    const text = await res.text().catch(() => '');
    const isNetlify = res.url.includes('netlify.app') || res.url.includes('netlify.com');
    const isNetzone = text.includes('NetZone') || text.includes('netzone');
    return Response.json({
      ok: true,
      status: res.status,
      redirected: res.redirected,
      finalUrl: res.url,
      forwarded: isNetlify || isNetzone,
    });
  } catch (err) {
    const timedOut = err.name === 'AbortError';
    return Response.json({ ok: false, error: timedOut ? 'Timed out' : err.message });
  }
};

export const config = { path: '/api/check-domain' };
