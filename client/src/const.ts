export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
// Pass an optional returnPath (e.g. "/vendor" or "/buyer") to redirect the
// user to the correct portal page after OAuth login completes.
export const getLoginUrl = (returnPath?: string) => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  // Encode both the redirectUri and the returnPath so the server can redirect
  // the user to the correct page after login (e.g. /vendor or /buyer)
  const statePayload = JSON.stringify({ redirectUri, returnPath: returnPath || "/" });
  const state = btoa(statePayload);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
