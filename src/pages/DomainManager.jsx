import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDomains } from '../context/DomainContext';
import AdminLayout from '../components/AdminLayout';
import AddDomainModal from '../components/AddDomainModal';

const { FiPlus, FiEdit, FiTrash2, FiEye, FiCheck, FiClock, FiX, FiGlobe, FiCopy, FiRefreshCw, FiSave, FiExternalLink } = FiIcons;

// ── Edit Domain Modal ─────────────────────────────────────────────────────────
const EditDomainModal = ({ domain, onClose, onSave }) => {
  const [form, setForm] = useState({
    domain_name: domain.domain_name || '',
    tagline: domain.tagline || '',
    buy_now_price: domain.buy_now_price ?? '',
    min_offer: domain.min_offer ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    onSave({
      domain_name: form.domain_name.trim().toLowerCase(),
      tagline: form.tagline.trim(),
      buy_now_price: form.buy_now_price !== '' ? Number(form.buy_now_price) : null,
      min_offer: form.min_offer !== '' ? Number(form.min_offer) : null,
    });
    setSaving(false);
    onClose();
  };

  const field = (label, key, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Edit Domain</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiX} className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {field('Domain Name', 'domain_name', 'text', 'example.com')}
          {field('Tagline', 'tagline', 'text', 'Short description…')}
          {field('Buy Now Price ($)', 'buy_now_price', 'number', 'Leave blank if not set')}
          {field('Minimum Offer ($)', 'min_offer', 'number', 'Leave blank if not set')}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving || !form.domain_name.trim()}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
              <SafeIcon icon={FiSave} className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// One-click copy with brief visual feedback
const CopyUrlCell = ({ domainName }) => {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/#/domain/${domainName}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };
  return (
    <button onClick={handleCopy} title={url}
      className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all ${
        copied ? 'bg-green-100 text-green-700' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
      }`}>
      <SafeIcon icon={copied ? FiCheck : FiCopy} className="h-3.5 w-3.5" />
      {copied ? 'Copied!' : 'Copy URL'}
    </button>
  );
};

const DomainManager = () => {
  const { domains, domainsLoading, updateDomain, deleteDomain, syncToServer } = useDomains();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [filter, setFilter] = useState('all');
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | ok | error
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkMinOffer, setBulkMinOffer] = useState('');
  const [verifyStatus, setVerifyStatus] = useState({}); // { [id]: 'checking'|'ok'|'error' }

  // Auto-sync admin's domains to Blobs as soon as server fetch completes.
  // This seeds Blobs with domains that were added before Blobs was deployed.
  useEffect(() => {
    if (domainsLoading) return;
    setSyncStatus('syncing');
    syncToServer()
      .then(r => setSyncStatus(r && !r.ok ? 'error' : 'ok'))
      .catch(() => setSyncStatus('error'))
      .finally(() => setTimeout(() => setSyncStatus('idle'), 3000));
  }, [domainsLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleManualSync = () => {
    setSyncStatus('syncing');
    syncToServer()
      .then(r => setSyncStatus(r && !r.ok ? 'error' : 'ok'))
      .catch(() => setSyncStatus('error'))
      .finally(() => setTimeout(() => setSyncStatus('idle'), 3000));
  };

  const filteredDomains = domains.filter(domain => {
    if (filter === 'all') return domain.status !== 'archived';
    return domain.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return FiCheck;
      case 'pending_verification': return FiClock;
      case 'sold': return FiCheck;
      case 'archived': return FiX;
      default: return FiClock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending_verification': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (domainId, newStatus) => {
    updateDomain(domainId, { status: newStatus });
  };

  const handleDelete = (domainId) => {
    if (window.confirm('Are you sure you want to delete this domain?')) {
      deleteDomain(domainId);
    }
  };

  const handleEdit = (domain) => setEditingDomain(domain);

  const handleEditSave = (updates) => {
    if (editingDomain) updateDomain(editingDomain.id, updates);
  };

  // ── Bulk helpers ────────────────────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    setSelectedIds(prev =>
      prev.size === filteredDomains.length
        ? new Set()
        : new Set(filteredDomains.map(d => d.id))
    );
  };
  const clearSelection = () => setSelectedIds(new Set());

  const bulkSetStatus = (status) => {
    selectedIds.forEach(id => updateDomain(id, { status }));
    clearSelection();
  };
  const bulkSetPrice = () => {
    const price = bulkPrice !== '' ? Number(bulkPrice) : null;
    selectedIds.forEach(id => updateDomain(id, { buy_now_price: price }));
    setBulkPrice('');
    clearSelection();
  };
  const bulkSetMinOffer = () => {
    const min = bulkMinOffer !== '' ? Number(bulkMinOffer) : null;
    selectedIds.forEach(id => updateDomain(id, { min_offer: min }));
    setBulkMinOffer('');
    clearSelection();
  };
  const bulkDelete = () => {
    if (!window.confirm(`Delete ${selectedIds.size} domain${selectedIds.size > 1 ? 's' : ''}? This cannot be undone.`)) return;
    selectedIds.forEach(id => deleteDomain(id));
    clearSelection();
  };

  // ── Domain verification ─────────────────────────────────────────────────────
  const verifyDomain = async (domain) => {
    setVerifyStatus(prev => ({ ...prev, [domain.id]: 'checking' }));
    try {
      const res = await fetch(`/api/check-domain?domain=${encodeURIComponent(domain.domain_name)}`);
      const data = await res.json();
      setVerifyStatus(prev => ({ ...prev, [domain.id]: data.forwarded ? 'ok' : 'error' }));
    } catch {
      setVerifyStatus(prev => ({ ...prev, [domain.id]: 'error' }));
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Domain Manager</h1>
            <p className="text-gray-600">Manage your domain portfolio</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Sync status indicator */}
            <button onClick={handleManualSync} disabled={syncStatus === 'syncing'}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all ${
                syncStatus === 'ok'
                  ? 'bg-green-50 border-green-300 text-green-700'
                  : syncStatus === 'error'
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : syncStatus === 'syncing'
                  ? 'bg-blue-50 border-blue-200 text-blue-600 opacity-70'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}>
              <SafeIcon icon={syncStatus === 'ok' ? FiCheck : FiRefreshCw}
                className={`h-3.5 w-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              {syncStatus === 'ok' ? 'Synced to server' :
               syncStatus === 'error' ? 'Sync failed — retry' :
               syncStatus === 'syncing' ? 'Syncing…' : 'Sync to server'}
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <SafeIcon icon={FiPlus} className="h-5 w-5" />
              <span>Add Domain</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'active', 'pending_verification', 'sold', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Domains' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                <span className="ml-2 text-xs">
                  ({status === 'all' ? domains.filter(d => d.status !== 'archived').length : domains.filter(d => d.status === status).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedIds.size > 0 && (
          <div className="bg-blue-600 text-white rounded-xl px-5 py-3 flex flex-wrap items-center gap-3">
            <span className="font-semibold text-sm">{selectedIds.size} selected</span>
            <div className="h-4 w-px bg-blue-400" />
            <select onChange={e => { if (e.target.value) bulkSetStatus(e.target.value); e.target.value = ''; }}
              defaultValue=""
              className="bg-blue-700 text-white text-xs rounded-lg px-2 py-1.5 border border-blue-500 cursor-pointer">
              <option value="" disabled>Set status…</option>
              <option value="active">Active</option>
              <option value="pending_verification">Pending</option>
              <option value="sold">Sold</option>
              <option value="archived">Archived</option>
            </select>
            <div className="flex items-center gap-1">
              <input type="number" placeholder="Buy Now USD" value={bulkPrice}
                onChange={e => setBulkPrice(e.target.value)}
                className="bg-blue-700 text-white text-xs rounded-lg px-2 py-1.5 border border-blue-500 w-32 placeholder-blue-300 outline-none" />
              <button onClick={bulkSetPrice} disabled={bulkPrice === ''}
                className="text-xs bg-white text-blue-700 px-2.5 py-1.5 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-40 transition-colors">
                Apply
              </button>
            </div>
            <div className="flex items-center gap-1">
              <input type="number" placeholder="Min Offer USD" value={bulkMinOffer}
                onChange={e => setBulkMinOffer(e.target.value)}
                className="bg-blue-700 text-white text-xs rounded-lg px-2 py-1.5 border border-blue-500 w-32 placeholder-blue-300 outline-none" />
              <button onClick={bulkSetMinOffer} disabled={bulkMinOffer === ''}
                className="text-xs bg-white text-blue-700 px-2.5 py-1.5 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-40 transition-colors">
                Apply
              </button>
            </div>
            <button onClick={bulkDelete}
              className="text-xs bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded-lg font-medium transition-colors ml-auto">
              Delete {selectedIds.size}
            </button>
            <button onClick={clearSelection}
              className="text-xs text-blue-200 hover:text-white transition-colors">
              Clear
            </button>
          </div>
        )}

        {/* Domains Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-4 pl-4 pr-2 w-10">
                    <input type="checkbox" className="rounded"
                      checked={selectedIds.size === filteredDomains.length && filteredDomains.length > 0}
                      onChange={toggleSelectAll} />
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Domain</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Buy Now</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Min Offer</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Added</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredDomains.map((domain, index) => (
                    <motion.tr
                      key={domain.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`hover:bg-gray-50 ${selectedIds.has(domain.id) ? 'bg-blue-50' : ''}`}
                    >
                      <td className="py-4 pl-4 pr-2 w-10">
                        <input type="checkbox" className="rounded"
                          checked={selectedIds.has(domain.id)}
                          onChange={() => toggleSelect(domain.id)} />
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {domain.domain_name}
                            {verifyStatus[domain.id] === 'ok' && (
                              <span className="text-xs text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">✓ Forwarded</span>
                            )}
                            {verifyStatus[domain.id] === 'error' && (
                              <span className="text-xs text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">✗ Not forwarding</span>
                            )}
                            {verifyStatus[domain.id] === 'checking' && (
                              <span className="text-xs text-blue-500">checking…</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{domain.tagline}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={domain.status}
                          onChange={(e) => handleStatusChange(domain.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${getStatusColor(domain.status)}`}
                        >
                          <option value="pending_verification">Pending Verification</option>
                          <option value="active">Active</option>
                          <option value="sold">Sold</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">
                        {domain.buy_now_price
                          ? <span className="text-green-700">USD {Number(domain.buy_now_price).toLocaleString()}</span>
                          : <span className="text-gray-400 text-sm">—</span>}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {domain.min_offer
                          ? <span>USD {Number(domain.min_offer).toLocaleString()}</span>
                          : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {new Date(domain.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-1">
                          <CopyUrlCell domainName={domain.domain_name} />
                          <button
                            onClick={() => verifyDomain(domain)}
                            disabled={verifyStatus[domain.id] === 'checking'}
                            title="Check if domain is forwarding correctly"
                            className="text-gray-400 hover:text-purple-600 p-1 disabled:opacity-40"
                          >
                            <SafeIcon icon={FiExternalLink} className="h-4 w-4" />
                          </button>
                          <a
                            href={`/#/domain/${domain.domain_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Preview landing page"
                          >
                            <SafeIcon icon={FiEye} className="h-4 w-4" />
                          </a>
                          <button
                            onClick={() => handleEdit(domain)}
                            className="text-gray-400 hover:text-blue-600 p-1"
                            title="Edit Domain"
                          >
                            <SafeIcon icon={FiEdit} className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(domain.id)}
                            className="text-gray-400 hover:text-red-600 p-1"
                            title="Delete Domain"
                          >
                            <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredDomains.length === 0 && (
            <div className="text-center py-12">
              <SafeIcon icon={FiGlobe} className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No domains found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Domain Modal */}
      <AddDomainModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Domain Modal */}
      {editingDomain && (
        <EditDomainModal
          domain={editingDomain}
          onClose={() => setEditingDomain(null)}
          onSave={handleEditSave}
        />
      )}
    </AdminLayout>
  );
};

export default DomainManager;