const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/gmail.compose',
].join(' ');

export async function getAccessToken(env) {
  if (!env.GOOGLE_REFRESH_TOKEN) {
    throw new Error('missing_refresh_token');
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  return data.access_token;
}

export function handleOAuthStart(env) {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', env.GOOGLE_CLIENT_ID);
  url.searchParams.set('redirect_uri', env.GOOGLE_REDIRECT_URI);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('scope', SCOPES);

  return Response.redirect(url.toString(), 302);
}

export async function handleOAuthCallback(requestUrl, env) {
  const error = requestUrl.searchParams.get('error');
  const code = requestUrl.searchParams.get('code');

  if (error) {
    return new Response(`OAuth error: ${error}`, { status: 200 });
  }

  if (!code) {
    return new Response('Missing authorization code.', { status: 200 });
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      redirect_uri: env.GOOGLE_REDIRECT_URI,
      code,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    return new Response(`OAuth callback failed: ${await res.text()}`, { status: 200 });
  }

  const tokens = await res.json();

  if (!tokens.refresh_token) {
    return new Response(
      'No refresh token returned. Revoke app access at https://myaccount.google.com/permissions and try /oauth/start again with prompt=consent.',
      { status: 200 }
    );
  }

  return new Response(
    `Copy this value and set it as the GOOGLE_REFRESH_TOKEN secret, then redeploy:\n\n${tokens.refresh_token}`,
    { status: 200, headers: { 'content-type': 'text/plain' } }
  );
}
