import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';

const {
  FiLock, FiMail, FiSave, FiCheck, FiAlertCircle,
  FiGlobe, FiExternalLink, FiInfo, FiShield, FiRefreshCw,
} = FiIcons;

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
    <h2 className="text-base font-bold text-gray-900">{title}</h2>
    {children}
  </div>
);

const Settings = () => {
  const { user, login, updateProfile } = useAuth();

  // ── Email status diagnostic ──────────────────────────────────────────────
  const [emailDiag, setEmailDiag] = useState(null);
  const [emailDiagLoading, setEmailDiagLoading] = useState(false);

  const checkEmailConfig = async () => {
    setEmailDiagLoading(true);
    setEmailDiag(null);
    try {
      const res = await fetch('/api/email-status');
      const data = await res.json();
      setEmailDiag(data);
    } catch (e) {
      setEmailDiag({ error: 'Could not reach /api/email-status — is the function deployed?' });
    } finally {
      setEmailDiagLoading(false);
    }
  };

  // ── Change password ──────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwStatus, setPwStatus] = useState(null); // null | 'ok' | 'error'
  const [pwMsg, setPwMsg] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwStatus(null);
    if (pwForm.next !== pwForm.confirm) {
      setPwStatus('error'); setPwMsg('New passwords do not match.'); return;
    }
    if (pwForm.next.length < 8) {
      setPwStatus('error'); setPwMsg('Password must be at least 8 characters.'); return;
    }
    // Verify current password by re-logging in
    const check = await login(user.email, pwForm.current);
    if (!check.success) {
      setPwStatus('error'); setPwMsg('Current password is incorrect.'); return;
    }
    // Store new password override in localStorage (AuthContext reads this first)
    localStorage.setItem('dm_admin_password', pwForm.next);
    setPwStatus('ok'); setPwMsg('Password updated. Use the new password next time you log in.');
    setPwForm({ current: '', next: '', confirm: '' });
  };

  // ── Change admin email ───────────────────────────────────────────────────
  const [emailForm, setEmailForm] = useState({ email: user?.email || '' });
  const [emailStatus, setEmailStatus] = useState(null);

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setEmailStatus(null);
    if (!/\S+@\S+\.\S+/.test(emailForm.email)) {
      setEmailStatus('error'); return;
    }
    await updateProfile({ email: emailForm.email });
    localStorage.setItem('dm_admin_email', emailForm.email);
    setEmailStatus('ok');
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your admin account and integrations</p>
        </div>

        {/* ── Admin credentials ── */}
        <Section title="Admin Password">
          <form onSubmit={handlePasswordChange} className="space-y-3">
            {['current', 'next', 'confirm'].map((field) => (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  {field === 'current' ? 'Current Password' : field === 'next' ? 'New Password' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  required
                  value={pwForm[field]}
                  onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
            ))}
            {pwStatus && (
              <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${pwStatus === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <SafeIcon icon={pwStatus === 'ok' ? FiCheck : FiAlertCircle} className="h-4 w-4 flex-shrink-0" />
                {pwMsg}
              </div>
            )}
            <button type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <SafeIcon icon={FiLock} className="h-4 w-4" />
              Update Password
            </button>
          </form>
        </Section>

        <Section title="Admin Email">
          <form onSubmit={handleEmailChange} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Email Address
              </label>
              <input type="email" required value={emailForm.email}
                onChange={e => setEmailForm({ email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
              <p className="text-xs text-gray-400 mt-1">This is your login email. Inquiry notification email is set via the <code className="bg-gray-100 px-1 rounded">VITE_ADMIN_EMAIL</code> env var in Netlify.</p>
            </div>
            {emailStatus && (
              <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${emailStatus === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <SafeIcon icon={emailStatus === 'ok' ? FiCheck : FiAlertCircle} className="h-4 w-4" />
                {emailStatus === 'ok' ? 'Email updated.' : 'Please enter a valid email.'}
              </div>
            )}
            <button type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <SafeIcon icon={FiSave} className="h-4 w-4" />
              Save Email
            </button>
          </form>
        </Section>

        {/* ── Domain forwarding guide ── */}
        <Section title="How to Forward a Domain">
          <div className="space-y-4 text-sm text-gray-600">
            <p>To show a domain's landing page when someone visits it, set a <strong className="text-gray-800">URL forward</strong> at your registrar pointing to:</p>
            <div className="bg-slate-900 rounded-xl px-4 py-3 font-mono text-green-400 text-xs break-all select-all">
              https://premium-me.netlify.app/#/domain/<span className="text-yellow-400">yourdomain.com</span>
            </div>
            <p className="text-xs text-gray-400">Replace <code className="bg-gray-100 px-1 rounded text-gray-600">yourdomain.com</code> with the actual domain. Make sure the domain is also added in your <strong>Domain Manager</strong> — otherwise it shows a generic "may be for sale" page.</p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-blue-800 text-xs uppercase tracking-wide">Example — fashion.me</p>
              <p className="text-blue-700 text-xs">Forward at registrar →</p>
              <code className="block bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-900 break-all">
                https://premium-me.netlify.app/#/domain/fashion.me
              </code>
              <p className="text-blue-700 text-xs">Then add <strong>fashion.me</strong> in Domain Manager with your buy-now price and minimum offer.</p>
            </div>

            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
              <SafeIcon icon={FiInfo} className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                <strong>DNS pointing (better option):</strong> Add a CNAME record <code>fashion.me → premium-me.netlify.app</code>, then add <code>fashion.me</code> as a custom domain in Netlify. The page auto-detects the domain from the hostname — no URL path needed.
              </p>
            </div>
          </div>
        </Section>

        {/* ── Mailgun status ── */}
        <Section title="Email Notifications (Mailgun)">
          <div className="space-y-3 text-sm">
            <p className="text-gray-500">Mailgun is configured via environment variables in Netlify. Go to <strong className="text-gray-700">Netlify → Site Settings → Environment Variables</strong> to set them.</p>
            <div className="space-y-2">
              {['MAILGUN_API_KEY', 'MAILGUN_DOMAIN', 'MAILGUN_REGION', 'VITE_ADMIN_EMAIL'].map(v => (
                <div key={v} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">
                  <code className="text-xs text-gray-700">{v}</code>
                  <span className="text-xs text-gray-400 italic">set in Netlify</span>
                </div>
              ))}
            </div>

            {/* Live config check */}
            <button onClick={checkEmailConfig} disabled={emailDiagLoading}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60">
              <SafeIcon icon={FiRefreshCw} className={`h-3.5 w-3.5 ${emailDiagLoading ? 'animate-spin' : ''}`} />
              {emailDiagLoading ? 'Checking…' : 'Check Email Config'}
            </button>

            {emailDiag && (
              <div className={`rounded-xl border p-4 space-y-2 text-xs ${emailDiag.error ? 'bg-red-50 border-red-200' : emailDiag.configured ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                {emailDiag.error ? (
                  <p className="text-red-700 font-medium">{emailDiag.error}</p>
                ) : (
                  <>
                    <div className={`font-semibold ${emailDiag.configured ? 'text-green-700' : 'text-amber-700'}`}>
                      {emailDiag.configured ? '✓ Mailgun is configured' : '✗ Mailgun is NOT configured'}
                    </div>
                    <div className="space-y-1 text-gray-600 font-mono">
                      <div><span className="text-gray-400">MAILGUN_API_KEY: </span>{emailDiag.keySet ? <span className="text-green-700">{emailDiag.keyPrefix} ✓</span> : <span className="text-red-600">NOT SET</span>}</div>
                      <div><span className="text-gray-400">MAILGUN_DOMAIN: </span>{emailDiag.domainSet ? <span className="text-green-700">{emailDiag.domain} ✓</span> : <span className="text-red-600">NOT SET</span>}</div>
                      <div><span className="text-gray-400">Region: </span>{emailDiag.region} → {emailDiag.apiHost}</div>
                      <div><span className="text-gray-400">Admin email: </span>{emailDiag.adminEmail}</div>
                    </div>
                    {!emailDiag.configured && (
                      <p className="text-amber-700 mt-2">Add MAILGUN_API_KEY and MAILGUN_DOMAIN in Netlify env vars, then redeploy.</p>
                    )}
                  </>
                )}
              </div>
            )}

            <a href="https://app.netlify.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-xs font-medium">
              Open Netlify Dashboard <SafeIcon icon={FiExternalLink} className="h-3 w-3" />
            </a>
          </div>
        </Section>
      </div>
    </AdminLayout>
  );
};

export default Settings;
