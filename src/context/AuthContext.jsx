import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

const isLocalDev = () =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('netzone_user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { localStorage.removeItem('netzone_user'); }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const effectiveEmail = localStorage.getItem('dm_admin_email') || 'admin@netzone.me';

      if (email.toLowerCase() !== effectiveEmail.toLowerCase()) {
        throw new Error('Invalid email or password');
      }

      let passwordValid = false;

      if (isLocalDev()) {
        // Local dev: compare against localStorage override or default
        const localPw = localStorage.getItem('dm_admin_password') || 'admin123';
        passwordValid = password === localPw;
      } else {
        // Production: verify against server-side hashed password (cross-browser)
        try {
          const res = await fetch('/api/admin-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify', password }),
          });
          if (res.ok) {
            const data = await res.json();
            passwordValid = data.ok;
          }
        } catch {
          // Server unreachable — fall back to localStorage
          const localPw = localStorage.getItem('dm_admin_password') || 'admin123';
          passwordValid = password === localPw;
        }
      }

      if (!passwordValid) throw new Error('Invalid email or password');

      const userObj = { id: 1, email: effectiveEmail, name: 'Admin', role: 'admin' };
      setUser(userObj);
      localStorage.setItem('netzone_user', JSON.stringify(userObj));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('netzone_user');
  };

  const updateProfile = async (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('netzone_user', JSON.stringify(updatedUser));
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateProfile,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};
