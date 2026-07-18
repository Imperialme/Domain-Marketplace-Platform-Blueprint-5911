# Security

This document describes the security model of the SpareParts.me marketplace
frontend, what the code now enforces, and — importantly — what you **must still do
on the server** for the app to be genuinely secure.

## The one rule that matters

**A frontend cannot secure itself.** Anything running in the browser can be read,
modified, and replayed by the user. The React app can *hide* admin buttons, but it
can never *stop* a determined attacker from calling your backend. Real security is
enforced by the server (Supabase Auth + Row Level Security), not by this code.

So: "can my site be hacked?" has no absolute "no." What we can do — and have done —
is remove the easy wins and make the remaining surface small and standard.

## What this codebase now does

- **Real authentication via Supabase** (`src/lib/supabase.js`, `src/context/AuthContext.jsx`).
  The old mock login with in-code users was removed. Passwords are handled and
  hashed by Supabase, sessions are real JWTs, and tokens auto-refresh.
- **No hardcoded credentials.** The demo admin/user accounts and the "Admin Login"
  button were deleted. Passwords are never stored in the bundle.
- **No secrets in source.** Quest keys and Supabase config are read from
  `VITE_*` environment variables (see `.env.example`). The previously committed
  Quest **JWT was removed** — it must be revoked (see below).
- **Privilege comes from the server, not the client.** `isAdmin` is derived from
  `app_metadata.role`, which is set server-side and signed into the JWT. The
  client cannot edit it (unlike `user_metadata` / `localStorage`, which it can).
- **Input validation & sanitization** (`src/utils/validation.js`) on the inquiry
  and registration forms: email format, strong-password policy, length caps, and
  stripping of angle brackets / control characters. This is defense-in-depth only.
- **HTTP security headers** for production hosts: a Content-Security-Policy, HSTS,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, a strict
  Referrer-Policy, and a locked-down Permissions-Policy. See `vercel.json`
  (Vercel) and `public/_headers` (Netlify/Cloudflare Pages).

## What YOU must still do (required)

1. **Rotate every previously committed secret.** The old Quest JWT and API key
   were public in git history — revoke them in the Quest dashboard and issue new
   ones. Consider purging them from history with `git filter-repo` / BFG.
2. **Create a Supabase project** and set `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` in your host's environment variables.
3. **Move data to the database and turn on Row Level Security.** Domains,
   inquiries, and analytics currently live in client state. Put them in Supabase
   tables with RLS policies so the *server* decides who can read/write each row.
   Without RLS, the anon key lets anyone read/write everything.
4. **Enforce admin server-side.** Set `role: 'admin'` in a user's `app_metadata`
   (via the Supabase admin API / SQL) and gate admin-only tables/functions on it
   in RLS. The React `requireAdmin` guard is cosmetic — never the only check.
5. **Verify the CSP against your real third-party domains.** The `connect-src` /
   `frame-src` values assume Supabase and `*.questlabs.ai`. Open the site, watch
   the browser console for CSP violations, and adjust. Tighten `img-src` from
   `https:` to specific hosts once you know them.
6. **Turn on Supabase protections:** email confirmation, leaked-password
   protection, and auth rate-limiting (mitigates brute force and credential
   stuffing).

## Reporting

Found a vulnerability? Email mail@shahid.me. Please do not open a public issue for
security reports.
