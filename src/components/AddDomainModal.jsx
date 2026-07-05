import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDomains } from '../context/DomainContext';

const { FiX, FiPlus, FiUpload, FiAlertCircle, FiCheck, FiCopy, FiExternalLink, FiArrowLeft } = FiIcons;

const BULK_PLACEHOLDER = `sender.me, 8000, 1500
generous.me, 12000, 2000
fragrant.me, 5000, 500`;

const parseBulkText = (text) => {
  const rows = [];
  const errors = [];

  text.split('\n').forEach((line, idx) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const parts = trimmed.split(',').map(p => p.trim());
    const domain = parts[0]?.toLowerCase();
    const buyNow = parseFloat(parts[1]);
    const minOffer = parseFloat(parts[2]);

    if (!domain || !domain.includes('.')) {
      errors.push(`Line ${idx + 1}: "${trimmed}" — invalid domain name`);
      return;
    }

    rows.push({
      domain_name: domain,
      buy_now_price: !isNaN(buyNow) && buyNow > 0 ? buyNow : null,
      min_offer: !isNaN(minOffer) && minOffer > 0 ? minOffer : null,
    });
  });

  return { rows, errors };
};

// ── Copy button with transient "Copied!" feedback ─────────────────────────────
const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <button onClick={handleCopy}
      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
        copied
          ? 'bg-green-100 text-green-700'
          : 'bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-600'
      }`}>
      <SafeIcon icon={copied ? FiCheck : FiCopy} className="h-3 w-3" />
      {copied ? 'Copied!' : label}
    </button>
  );
};

// ── Forwarding URL helper ─────────────────────────────────────────────────────
const forwardingUrl = (domainName) =>
  `${window.location.origin}/#/domain/${domainName}`;

// ── URL Success Screen (shown after adding domains) ───────────────────────────
const UrlsScreen = ({ addedDomains, onAddMore, onClose }) => {
  const allUrls = addedDomains
    .map(d => `${d}  →  ${forwardingUrl(d)}`)
    .join('\n');

  const [copiedAll, setCopiedAll] = useState(false);

  const copyAll = () => {
    navigator.clipboard.writeText(allUrls).then(() => {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    });
  };

  return (
    <div className="p-6 space-y-5">
      {/* Success header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
          <SafeIcon icon={FiCheck} className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="font-bold text-gray-900">
            {addedDomains.length === 1
              ? `${addedDomains[0]} added!`
              : `${addedDomains.length} domains added!`}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            Copy the forwarding URL{addedDomains.length > 1 ? 's' : ''} and paste {addedDomains.length > 1 ? 'each one' : 'it'} at your registrar.
          </p>
        </div>
      </div>

      {/* Instruction callout */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
        <strong>At your registrar</strong> → DNS / Forwarding → URL Redirect<br />
        Set destination to the forwarding URL below. Use <strong>301 redirect</strong> (permanent).
      </div>

      {/* Domain → URL list */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {addedDomains.map(domainName => {
          const url = forwardingUrl(domainName);
          return (
            <div key={domainName} className="bg-gray-50 border border-gray-200 rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900 text-sm">{domainName}</span>
                <div className="flex items-center gap-2">
                  <CopyButton text={url} label="Copy URL" />
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Preview">
                    <SafeIcon icon={FiExternalLink} className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
              <div className="bg-slate-800 rounded-lg px-3 py-2 font-mono text-xs text-green-400 break-all select-all">
                {url}
              </div>
            </div>
          );
        })}
      </div>

      {/* Copy all button (for multiple) */}
      {addedDomains.length > 1 && (
        <button onClick={copyAll}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
            copiedAll
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}>
          <SafeIcon icon={copiedAll ? FiCheck : FiCopy} className="h-4 w-4" />
          {copiedAll ? 'All URLs Copied!' : `Copy All ${addedDomains.length} Forwarding URLs`}
        </button>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onAddMore}
          className="flex-1 flex items-center justify-center gap-1.5 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
          <SafeIcon icon={FiArrowLeft} className="h-4 w-4" />
          Add More
        </button>
        <button onClick={onClose}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
          Done
        </button>
      </div>
    </div>
  );
};

// ── Main modal ─────────────────────────────────────────────────────────────────
const AddDomainModal = ({ isOpen, onClose }) => {
  const { addDomain, bulkImportDomains } = useDomains();
  const [tab, setTab] = useState('single');
  const [addedDomains, setAddedDomains] = useState(null); // null = form, array = success screen

  // Single form state
  const [formData, setFormData] = useState({
    domain_name: '', buy_now_price: '', min_offer: '', tagline: '',
  });
  const [singleError, setSingleError] = useState('');

  // Bulk state
  const [bulkText, setBulkText] = useState('');
  const [bulkResult, setBulkResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (singleError) setSingleError('');
  };

  const handleSingleSubmit = (e) => {
    e.preventDefault();
    const name = formData.domain_name.trim().toLowerCase();
    if (!name || !name.includes('.')) {
      setSingleError('Please enter a valid domain name (e.g. sender.me)');
      return;
    }
    addDomain({
      domain_name: name,
      buy_now_price: formData.buy_now_price ? parseFloat(formData.buy_now_price) : null,
      min_offer: formData.min_offer ? parseFloat(formData.min_offer) : null,
      tagline: formData.tagline.trim(),
    });
    setFormData({ domain_name: '', buy_now_price: '', min_offer: '', tagline: '' });
    setAddedDomains([name]);
  };

  const handleBulkPreview = () => {
    setBulkResult(parseBulkText(bulkText));
  };

  const handleBulkImport = () => {
    if (!bulkResult?.rows?.length) return;
    setSubmitting(true);
    bulkImportDomains(bulkResult.rows);
    const names = bulkResult.rows.map(r => r.domain_name);
    setBulkText('');
    setBulkResult(null);
    setSubmitting(false);
    setAddedDomains(names);
  };

  const handleAddMore = () => {
    setAddedDomains(null);
  };

  const handleClose = useCallback(() => {
    setFormData({ domain_name: '', buy_now_price: '', min_offer: '', tagline: '' });
    setBulkText('');
    setBulkResult(null);
    setSingleError('');
    setAddedDomains(null);
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.94, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">
              {addedDomains ? 'Forwarding URLs Ready' : 'Add Domains'}
            </h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <SafeIcon icon={FiX} className="h-5 w-5" />
            </button>
          </div>

          {/* Success / URL screen */}
          {addedDomains && (
            <UrlsScreen
              addedDomains={addedDomains}
              onAddMore={handleAddMore}
              onClose={handleClose}
            />
          )}

          {/* Form */}
          {!addedDomains && (
            <>
              {/* Tabs */}
              <div className="flex border-b border-gray-100">
                {[
                  { id: 'single', label: 'Single Domain' },
                  { id: 'bulk', label: 'Bulk Import' },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                      tab === t.id
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* ── SINGLE ── */}
                {tab === 'single' && (
                  <form onSubmit={handleSingleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                        Domain Name <span className="text-red-500">*</span>
                      </label>
                      <input type="text" name="domain_name" value={formData.domain_name}
                        onChange={handleChange} placeholder="sender.me"
                        className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                          singleError ? 'border-red-400 bg-red-50' : 'border-gray-300'
                        }`} />
                      {singleError && (
                        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                          <SafeIcon icon={FiAlertCircle} className="h-3 w-3" />{singleError}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                          Buy Now Price ($)
                        </label>
                        <input type="number" name="buy_now_price" value={formData.buy_now_price}
                          onChange={handleChange} placeholder="15000" min="0"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        <p className="text-xs text-gray-400 mt-1">Instant purchase price</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                          Minimum Offer ($)
                        </label>
                        <input type="number" name="min_offer" value={formData.min_offer}
                          onChange={handleChange} placeholder="3000" min="0"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                        <p className="text-xs text-gray-400 mt-1">Lowest offer you'll consider</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                        Tagline <span className="text-gray-400 font-normal normal-case">(optional)</span>
                      </label>
                      <input type="text" name="tagline" value={formData.tagline}
                        onChange={handleChange} placeholder="Perfect for your next venture"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <button type="submit" disabled={submitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      <SafeIcon icon={FiPlus} className="h-4 w-4" />
                      Add Domain & Get Forwarding URL
                    </button>
                  </form>
                )}

                {/* ── BULK ── */}
                {tab === 'bulk' && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
                      <strong>Format:</strong> one domain per line<br />
                      <code className="font-mono">domain.com, buy_now_price, min_offer</code><br />
                      Prices are optional. After import you'll get all forwarding URLs at once.
                    </div>

                    <textarea
                      value={bulkText}
                      onChange={e => { setBulkText(e.target.value); setBulkResult(null); }}
                      placeholder={BULK_PLACEHOLDER}
                      rows={8}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />

                    {!bulkResult ? (
                      <button onClick={handleBulkPreview} disabled={!bulkText.trim()}
                        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm transition-colors">
                        Preview Import
                      </button>
                    ) : (
                      <div className="space-y-3">
                        {bulkResult.errors.length > 0 && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
                            {bulkResult.errors.map((e, i) => (
                              <p key={i} className="text-xs text-red-600 flex items-center gap-1">
                                <SafeIcon icon={FiAlertCircle} className="h-3 w-3 flex-shrink-0" />{e}
                              </p>
                            ))}
                          </div>
                        )}

                        {bulkResult.rows.length > 0 && (
                          <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                            <div className="px-4 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                              {bulkResult.rows.length} domain{bulkResult.rows.length !== 1 ? 's' : ''} ready to import
                            </div>
                            <div className="divide-y divide-gray-200 max-h-48 overflow-y-auto">
                              {bulkResult.rows.map((row, i) => (
                                <div key={i} className="px-4 py-2.5 flex items-center justify-between text-sm">
                                  <span className="font-medium text-gray-900">{row.domain_name}</span>
                                  <div className="flex gap-3 text-xs text-gray-500">
                                    {row.buy_now_price && <span className="text-green-600 font-semibold">${row.buy_now_price.toLocaleString()}</span>}
                                    {row.min_offer && <span>min ${row.min_offer.toLocaleString()}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button onClick={() => setBulkResult(null)}
                            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                            Edit
                          </button>
                          <button onClick={handleBulkImport} disabled={!bulkResult.rows.length || submitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                            <SafeIcon icon={FiUpload} className="h-4 w-4" />
                            Import & Get URLs
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddDomainModal;
