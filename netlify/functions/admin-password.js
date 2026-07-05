import { getStore } from '@netlify/blobs';

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const store = getStore('netzone');

  // ── Verify password ─────────────────────────────────────────────────────
  if (body.action === 'verify') {
    const { password } = body;
    if (!password) return Response.json({ ok: false });

    const creds = await store.get('admin_creds', { type: 'json' }).catch(() => null);

    if (!creds?.passwordHash) {
      // No custom password set yet — compare against default
      return Response.json({ ok: password === 'admin123' });
    }

    const hash = await sha256(password);
    return Response.json({ ok: hash === creds.passwordHash });
  }

  // ── Set new password ────────────────────────────────────────────────────
  if (body.action === 'set') {
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return Response.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    }

    const creds = await store.get('admin_creds', { type: 'json' }).catch(() => null);
    const storedHash = creds?.passwordHash;

    let currentValid;
    if (!storedHash) {
      currentValid = currentPassword === 'admin123';
    } else {
      currentValid = (await sha256(currentPassword)) === storedHash;
    }

    if (!currentValid) {
      return Response.json({ ok: false, error: 'Current password is incorrect' }, { status: 401 });
    }

    await store.setJSON('admin_creds', { passwordHash: await sha256(newPassword) });
    return Response.json({ ok: true });
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 });
};

export const config = { path: '/api/admin-password' };
