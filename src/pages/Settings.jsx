import React, { useState } from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import AdminLayout from '../components/AdminLayout';
import { useAuth } from '../context/AuthContext';

const {
  FiLock, FiMail, FiSave, FiCheck, FiAlertCircle,
  FiExternalLink, FiInfo, FiRefreshCw, FiEye, FiEyeOff,
} = FiIcons;

const Section = ({ title, description, children }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
    <div className="px-6 py-5 border-b border-gray-100">
      <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h2>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
    <div className="px-6 py-5 space-y-4">{children}</div>
  </div>
);

const PasswordInput = ({ label, value, onChange, placeholder = '••••••••' }) => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      <div className="relative">
        <SafeIcon icon={FiLock} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type={show ? 'text' : 'password'}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-11 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <button type="button" onClick={() => setShow(s => !s)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
          <SafeIcon icon={show ? FiEyeOff : FiEye} className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const Settings = () => {
  const { user, updateProfile } = useAuth();

  // ── Change password ──────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwStatus, setPwStatus] = useState(null);
  const [pwMsg, setPwMsg] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwStatus(null);
    if (pwForm.next !== pwForm.confirm) {
      setPwStatus('error'); setPwMsg('New passwords do not match.'); return;
    }
    if (pwForm.next.length < 8) {
      setPwStatus('error'); setPwMsg('Password must be at least 8 characters.'); return;
    }
    setPwLoading(true);
    try {
      const res = await fetch('/api/admin-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set', currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      const data = await res.json();
      if (!data.ok) {
        setPwStatus('error'); setPwMsg(data.error || 'Failed to update password.');
      } else {
        localStorage.setItem('dm_admin_password', pwForm.next);
        setPwStatus('ok'); setPwMsg('Password updated — takes effect immediately on all devices.');
        setPwForm({ current: '', next: '', confirm: '' });
      }
    } catch {
      setPwStatus('error'); setPwMsg('Could not reach server. Try again.');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Change admin email ───────────────────────────────────────────────────
  const [emailForm, setEmailForm] = useState({ email: user?.email || '' });
  const [emailStatus, setEmailStatus] = useState(null);

  const handleEmailChange = async (e) => {
    e.preventDefault();
    setEmailStatus(null);
    if (!/\S+@\S+\.\S+/.test(emailForm.email)) { setEmailStatus('error'); return; }
    await updateProfile({ email: emailForm.email });
    localStorage.setItem('dm_admin_email', emailForm.email);
    setEmailStatus('ok');
  };

  // ── Email diagnostic ─────────────────────────────────────────────────────
  const [emailDiag, setEmailDiag] = useState(null);
  const [emailDiagLoading, setEmailDiagLoading] = useState(false);

  const checkEmailConfig = async () => {
    setEmailDiagLoading(true);
    setEmailDiag(null);
    try {
      const res = await fetch('/api/email-status');
      setEmailDiag(await res.json());
    } catch (e) {
      setEmailDiag({ error: 'Could not reach /api/email-status — is the function deployed?' });
    } finally {
      setEmailDiagLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your admin account and integrations</p>
        </div>

        {/* ── Admin Password ── */}
        <Section title="Change Password" description="Password is stored securely on the server — works across all your devices.">
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <PasswordInput label="Current Password" value={pwForm.current}
              onChange={e => setPwForm(p => ({ ...p, current: e.target.value }))} />
            <PasswordInput label="New Password" value={pwForm.next}
              onChange={e => setPwForm(p => ({ ...p, next: e.target.value }))} />
            <PasswordInput label="Confirm New Password" value={pwForm.confirm}
              onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} />
            {pwStatus && (
              <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${
                pwStatus === 'ok'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                <SafeIcon icon={pwStatus === 'ok' ? FiCheck : FiAlertCircle} className="h-4 w-4 flex-shrink-0" />
                {pwMsg}
              </div>
            )}
            <button type="submit" disabled={pwLoading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              {pwLoading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                : <><SafeIcon icon={FiLock} className="h-4 w-4" /> Update Password</>}
            </button>
          </form>
        </Section>

        {/* ── Admin Login Email ── */}
        <Section title="Login Email" description="The email address used to sign into the admin panel.">
          <form onSubmit={handleEmailChange} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <SafeIcon icon={FiMail} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="email" required value={emailForm.email}
                  onChange={e => setEmailForm({ email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@netzone.me"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Inquiry notification email is set separately via the <code className="bg-gray-100 px-1 rounded">VITE_ADMIN_EMAIL</code> env var in Netlify.
              </p>
            </div>
            {emailStatus && (
              <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl border ${emailStatus === 'ok' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                <SafeIcon icon={emailStatus === 'ok' ? FiCheck : FiAlertCircle} className="h-4 w-4" />
                {emailStatus === 'ok' ? 'Login email updated.' : 'Please enter a valid email address.'}
              </div>
            )}
            <button type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <SafeIcon icon={FiSave} className="h-4 w-4" /> Save Email
            </button>
          </form>
        </Section>

        {/* ── Domain forwarding guide ── */}
        <Section title="Domain Forwarding Setup" description="How to point a domain to your NetZone listing page.">
          <div className="space-y-4 text-sm text-gray-600">
            <p>Set a <strong className="text-gray-800">URL forward</strong> at your registrar pointing to:</p>
            <div className="bg-slate-900 rounded-xl px-4 py-3 font-mono text-green-400 text-xs break-all select-all">
              https://premium-me.netlify.app/#/domain/<span className="text-yellow-400">yourdomain.com</span>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
              <p className="font-semibold text-blue-800 text-xs uppercase tracking-wide">Example — fashion.me</p>
              <code className="block bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-900 break-all">
                https://premium-me.netlify.app/#/domain/fashion.me
              </code>
              <p className="text-blue-700 text-xs">Then add <strong>fashion.me</strong> in Domain Manager with your buy-now price and minimum offer.</p>
            </div>
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl p-3">
              <SafeIcon icon={FiInfo} className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                <strong>Better option:</strong> Add a CNAME record <code>yourdomain.com → premium-me.netlify.app</code>, then add it as a custom domain in Netlify. Auto-detects the hostname — no URL path needed. Netlify provides free SSL automatically.
              </p>
            </div>
          </div>
        </Section>

        {/* ── Mailgun / Email ── */}
        <Section title="Email Notifications (Mailgun)" description="Configure in Netlify → Site Settings → Environment Variables.">
          <div className="space-y-3">
            <div className="space-y-2">
              {[
                ['MAILGUN_API_KEY', 'Your Mailgun private API key'],
                ['MAILGUN_DOMAIN', 'Your sending domain (e.g. mg.netzone.me)'],
                ['MAILGUN_REGION', 'us or eu (default: us)'],
                ['VITE_ADMIN_EMAIL', 'Where inquiry emails go (default: ask@netzone.me)'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-start justify-between bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200 gap-3">
                  <code className="text-xs text-gray-700 font-mono">{key}</code>
                  <span className="text-xs text-gray-400 text-right">{desc}</span>
                </div>
              ))}
            </div>

            <button onClick={checkEmailConfig} disabled={emailDiagLoading}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60">
              <SafeIcon icon={FiRefreshCw} className={`h-3.5 w-3.5 ${emailDiagLoading ? 'animate-spin' : ''}`} />
              {emailDiagLoading ? 'Checking…' : 'Check Email Config Live'}
            </button>

            {emailDiag && (
              <div className={`rounded-xl border p-4 space-y-2 text-xs ${
                emailDiag.error ? 'bg-red-50 border-red-200' :
                emailDiag.configured ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
              }`}>
                {emailDiag.error ? (
                  <p className="text-red-700 font-medium">{emailDiag.error}</p>
                ) : (
                  <>
                    <p className={`font-bold ${emailDiag.configured ? 'text-green-700' : 'text-amber-700'}`}>
                      {emailDiag.configured ? '✓ Mailgun is configured' : '✗ Mailgun is NOT configured'}
                    </p>
                    <div className="space-y-1 font-mono text-gray-600">
                      <div>MAILGUN_API_KEY: {emailDiag.keySet ? <span className="text-green-700">{emailDiag.keyPrefix} ✓</span> : <span className="text-red-600 font-bold">NOT SET</span>}</div>
                      <div>MAILGUN_DOMAIN: {emailDiag.domainSet ? <span className="text-green-700">{emailDiag.domain} ✓</span> : <span className="text-red-600 font-bold">NOT SET</span>}</div>
                      <div>API Host: {emailDiag.apiHost}</div>
                      <div>Admin email: {emailDiag.adminEmail}</div>
                    </div>
                    {!emailDiag.configured && (
                      <p className="text-amber-700 mt-1">Set the missing env vars in Netlify and redeploy.</p>
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
