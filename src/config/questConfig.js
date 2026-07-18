// Quest configuration is loaded from build-time environment variables.
//
// These values (apiKey / entityId / userId) are *publishable* client keys and are
// necessarily visible in the shipped bundle — that is expected for the Quest SDK.
// They are kept out of source control so they can be rotated without a code change.
//
// NOTE: The previously committed `TOKEN` (a signed JWT) has been removed. Any
// long-lived bearer token must never live in client code. Revoke the old one.
export default {
  QUEST_HELP_QUESTID: import.meta.env.VITE_QUEST_HELP_QUESTID || '',
  USER_ID: import.meta.env.VITE_QUEST_USER_ID || '',
  APIKEY: import.meta.env.VITE_QUEST_APIKEY || '',
  ENTITYID: import.meta.env.VITE_QUEST_ENTITYID || '',
  PRIMARY_COLOR: '#2563eb', // Extracted from primary-600 color used throughout the app
};
