import { createClient } from '@supabase/supabase-js';

// Configuration is read from build-time environment variables (never hardcoded).
// Only the *publishable* anon key belongs in the client bundle. The service-role
// key must never be exposed to the browser.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Guard against createClient throwing when the app is run without configuration.
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
