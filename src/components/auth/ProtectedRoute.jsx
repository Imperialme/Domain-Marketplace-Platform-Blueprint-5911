import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLock, FiMail, FiEye, FiEyeOff, FiGlobe } = FiIcons;

const AdminLoginScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (!result.success) setError(result.error || 'Invalid credentials');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <svg viewBox="0 0 36 36" width="36" height="36" fill="none">
            <circle cx="18" cy="18" r="16" stroke="#60a5fa" strokeWidth="1.8"/>
            <ellipse cx="18" cy="18" rx="7" ry="16" stroke="#60a5fa" strokeWidth="1.4"/>
            <line x1="2" y1="18" x2="34" y2="18" stroke="#60a5fa" strokeWidth="1.4"/>
          </svg>
          <span className="font-extrabold text-2xl text-white tracking-tight">
            Net<span className="text-blue-400">Zone</span>
          </span>
        </div>

        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h1 className="text-xl font-bold text-white mb-1">Admin Access</h1>
          <p className="text-slate-400 text-sm mb-7">Sign in to manage your domain portfolio</p>

          {error && (
            <div className="bg-red-500/15 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Email
              </label>
              <div className="relative">
                <SafeIcon icon={FiMail} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@netzone.me"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-600 text-white placeholder-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                Password
              </label>
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-slate-900/60 border border-slate-600 text-white placeholder-slate-600 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="h-4 w-4" />
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 mt-2">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
              ) : (
                <><SafeIcon icon={FiLock} className="h-4 w-4" /> Sign In</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          NetZone Domain Management · Admin Only
        </p>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return <AdminLoginScreen />;
  }

  return children;
};

export default ProtectedRoute;
