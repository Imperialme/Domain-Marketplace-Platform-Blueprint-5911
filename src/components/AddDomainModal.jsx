import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDomains } from '../context/DomainContext';

const { FiX, FiPlus, FiUpload, FiAlertCircle, FiCheck } = FiIcons;

const BULK_PLACEHOLDER = `techstartup.com, 15000, 3000
digitalagency.net, 8500, 1500
coolbrand.io, 5000, 500`;

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

const AddDomainModal = ({ isOpen, onClose }) => {
  const { addDomain, bulkImportDomains } = useDomains();
  const [tab, setTab] = useState('single');

  // Single form state
  const [formData, setFormData] = useState({
    domain_name: '',
    buy_now_price: '',
    min_offer: '',
    tagline: '',
  });
  const [singleError, setSingleError] = useState('');

  // Bulk state
  const [bulkText, setBulkText] = useState('');
  const [bulkResult, setBulkResult] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (singleError) setSingleError('');
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.domain_name.trim() || !formData.domain_name.includes('.')) {
      setSingleError('Please enter a valid domain name (e.g. example.com)');
      return;
    }
    setSubmitting(true);
    addDomain({
      domain_name: formData.domain_name.trim().toLowerCase(),
      buy_now_price: formData.buy_now_price ? parseFloat(formData.buy_now_price) : null,
      min_offer: formData.min_offer ? parseFloat(formData.min_offer) : null,
      tagline: formData.tagline.trim(),
    });
    setFormData({ domain_name: '', buy_now_price: '', min_offer: '', tagline: '' });
    setSubmitting(false);
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 1200);
  };

  const handleBulkPreview = () => {
    const result = parseBulkText(bulkText);
    setBulkResult(result);
  };

  const handleBulkImport = () => {
    if (!bulkResult?.rows?.length) return;
    setSubmitting(true);
    bulkImportDomains(bulkResult.rows);
    setSubmitting(false);
    setBulkText('');
    setBulkResult(null);
    setDone(true);
    setTimeout(() => { setDone(false); onClose(); }, 1200);
  };

  const handleClose = () => {
    setFormData({ domain_name: '', buy_now_price: '', min_offer: '', tagline: '' });
    setBulkText('');
    setBulkResult(null);
    setSingleError('');
    setDone(false);
    onClose();
  };

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
            <h2 className="text-xl font-bold text-gray-900">Add Domains</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <SafeIcon icon={FiX} className="h-5 w-5" />
            </button>
          </div>

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
            {done && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm font-medium">
                <SafeIcon icon={FiCheck} className="h-4 w-4" />
                Domains added successfully!
              </motion.div>
            )}

            {/* ── SINGLE ── */}
            {tab === 'single' && (
              <form onSubmit={handleSingleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                    Domain Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" name="domain_name" value={formData.domain_name}
                    onChange={handleChange} placeholder="example.com"
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
                  Add Domain
                </button>
              </form>
            )}

            {/* ── BULK ── */}
            {tab === 'bulk' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 leading-relaxed">
                  <strong>Format:</strong> one domain per line<br />
                  <code className="font-mono">domain.com, buy_now_price, min_offer</code><br />
                  Prices are optional — leave blank if unknown.
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
                        Import {bulkResult.rows.length} Domain{bulkResult.rows.length !== 1 ? 's' : ''}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddDomainModal;
