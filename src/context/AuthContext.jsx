import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const NOT_CONFIGURED =
  'Authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.';

// Map a Supabase auth user onto the shape the app expects.
//
// SECURITY: the privilege level (`role`) is read from `app_metadata`, which is
// controlled exclusively by the server (Supabase / your admin API) and is signed
// into the JWT. It can NOT be edited by the client, unlike `user_metadata`.
// Never grant admin based on anything the browser can write.
const mapUser = (sessionUser) => {
  if (!sessionUser) return null;
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.user_metadata?.name || sessionUser.email,
    role: sessionUser.app_metadata?.role || 'user',
    avatar: sessionUser.user_metadata?.avatar_url || null,
    created_at: sessionUser.created_at,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    // Restore any existing session (tokens are managed and refreshed by the SDK).
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(mapUser(data.session?.user));
      setLoading(false);
    });

    // Keep local state in sync with sign-in / sign-out / token-refresh events.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapUser(session?.user));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: NOT_CONFIGURED };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const register = async ({ name, email, password }) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: NOT_CONFIGURED };
    }
    // Only non-privileged profile data is passed from the client. Roles are never
    // set here — new accounts are always ordinary users until promoted server-side.
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const updateProfile = async (updates) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: NOT_CONFIGURED };
    }
    // Guard against privilege escalation: never let a profile update carry a role.
    const { role: _ignoredRole, ...safeUpdates } = updates || {};
    const { data, error } = await supabase.auth.updateUser({ data: safeUpdates });
    if (error) {
      return { success: false, error: error.message };
    }
    setUser(mapUser(data.user));
    return { success: true };
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isConfigured: isSupabaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
