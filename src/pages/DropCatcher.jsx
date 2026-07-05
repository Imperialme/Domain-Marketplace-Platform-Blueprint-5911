import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '../components/AdminLayout';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTarget, FiExternalLink, FiSave, FiAlertTriangle, FiCheckCircle, FiServer } = FiIcons;

const STORAGE_KEY = 'netzone_dropcatcher_url';

const DropCatcher = () => {
  const [engineUrl, setEngineUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) || '';
    setEngineUrl(stored);
    setSavedUrl(stored);
  }, []);

  const saveUrl = () => {
    let url = engineUrl.trim().replace(/\/+$/, '');
    if (url && !/^https?:\/\//i.test(url)) url = `http://${url}`;
    localStorage.setItem(STORAGE_KEY, url);
    setEngineUrl(url);
    setSavedUrl(url);
  };

  // Browsers block an http:// iframe inside an https:// page (mixed content),
  // so in that case we show a launch button instead of a broken embed.
  const mixedContent =
    typeof window !== 'undefined' &&
    window.location.protocol === 'https:' &&
    savedUrl.startsWith('http://');

  return (
    <AdminLayout>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center space-x-3 mb-6">
          <SafeIcon icon={FiTarget} className="h-7 w-7 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Drop Catcher</h1>
            <p className="text-gray-600 text-sm">
              Watch expiring domains (.me, .tel, .africa and any other TLD) and register them
              automatically the moment they drop.
            </p>
          </div>
        </div>

        {/* Connect card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-1 flex items-center space-x-2">
            <SafeIcon icon={FiServer} className="h-5 w-5 text-primary-600" />
            <span>Connect to your catching engine</span>
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            The engine runs on your VPS so it can hold your Dynadot API key securely and keep
            hunting 24/7 even with your browser closed. One-time setup: run{' '}
            <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">sudo bash dropcatcher/install.sh</code>{' '}
            on the VPS, then paste the address it prints below.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={engineUrl}
              onChange={(e) => setEngineUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveUrl()}
              placeholder="http://your-vps-ip:8053"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              onClick={saveUrl}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              <SafeIcon icon={FiSave} className="h-4 w-4" />
              <span>Connect</span>
            </button>
          </div>
          {savedUrl && (
            <div className="mt-3 flex items-center space-x-2 text-sm text-green-700">
              <SafeIcon icon={FiCheckCircle} className="h-4 w-4" />
              <span>Connected to {savedUrl}</span>
              <a
                href={savedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium"
              >
                <span>open in new tab</span>
                <SafeIcon icon={FiExternalLink} className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Dashboard embed / launch */}
        {savedUrl ? (
          mixedContent ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <SafeIcon icon={FiAlertTriangle} className="h-8 w-8 text-amber-500 mx-auto mb-3" />
              <p className="text-amber-800 font-medium mb-1">
                Your browser won't embed an http:// panel inside this https:// site.
              </p>
              <p className="text-amber-700 text-sm mb-4">
                No problem — use the button below. Everything works the same in its own tab.
              </p>
              <a
                href={savedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
              >
                <SafeIcon icon={FiTarget} className="h-5 w-5" />
                <span>Open Drop Catcher panel</span>
                <SafeIcon icon={FiExternalLink} className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <iframe
                src={savedUrl}
                title="Drop Catcher control panel"
                className="w-full border-0"
                style={{ height: 'calc(100vh - 380px)', minHeight: 560 }}
              />
            </div>
          )
        ) : (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
            <SafeIcon icon={FiTarget} className="h-10 w-10 mx-auto mb-3 text-gray-400" />
            <p className="font-medium text-gray-700 mb-1">No engine connected yet</p>
            <p className="text-sm max-w-md mx-auto">
              Run the installer on your VPS (instructions above), then paste the address it prints
              here. After that you manage everything — API key, domains, alerts — right on this page.
            </p>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
};

export default DropCatcher;
