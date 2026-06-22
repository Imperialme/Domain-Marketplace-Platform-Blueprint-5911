import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useInquiries } from '../context/InquiryContext';
import { useVisitor } from '../context/VisitorContext';
import AdminLayout from '../components/AdminLayout';

const {
  FiMail, FiDollarSign, FiCalendar, FiDownload, FiX,
  FiAlertCircle, FiCheck, FiUser, FiSearch, FiGlobe,
  FiPhone, FiMonitor, FiSmartphone, FiExternalLink,
} = FiIcons;

const InquiryManager = () => {
  const { inquiries, updateInquiry, deleteInquiry } = useInquiries();
  const { getAbandonedSessions, getAllSessions } = useVisitor();
  const [activeTab, setActiveTab] = useState('submitted');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  const abandonedSessions = getAbandonedSessions();
  const allSessions = getAllSessions();

  // Enrich inquiries with their session data
  const enrichedInquiries = useMemo(() => {
    return inquiries.map(inq => {
      const session = allSessions.find(s => s.inquiryId === inq.id);
      return { ...inq, session };
    });
  }, [inquiries, allSessions]);

  const filteredInquiries = useMemo(() => {
    return enrichedInquiries.filter(inq => {
      const matchFilter = filter === 'all' || inq.status === filter;
      const matchSearch = !search ||
        inq.name?.toLowerCase().includes(search.toLowerCase()) ||
        inq.email?.toLowerCase().includes(search.toLowerCase()) ||
        inq.domain_name?.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [enrichedInquiries, filter, search]);

  const filteredAbandoned = useMemo(() => {
    return abandonedSessions.filter(s => {
      return !search ||
        s.domainName?.toLowerCase().includes(search.toLowerCase()) ||
        s.referrerSource?.toLowerCase().includes(search.toLowerCase());
    });
  }, [abandonedSessions, search]);

  const exportToCSV = () => {
    const headers = ['Date', 'Domain', 'Name', 'Email', 'Phone', 'Offer ($)', 'Status', 'Source', 'Device', 'Message'];
    const rows = inquiries.map(inq => {
      const session = allSessions.find(s => s.inquiryId === inq.id);
      return [
        new Date(inq.created_at).toLocaleDateString(),
        inq.domain_name || '',
        inq.name || '',
        inq.email || '',
        inq.phone || '',
        inq.offerAmount || '',
        inq.status || '',
        session?.referrerSource || '',
        session?.device || '',
        `"${(inq.message || '').replace(/"/g, '""')}"`,
      ].join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `inquiries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    replied: 'bg-green-100 text-green-800',
    negotiating: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-gray-100 text-gray-700',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
            <p className="text-gray-500 text-sm mt-1">
              {inquiries.length} submitted &bull; {abandonedSessions.length} abandoned (prices typed but not sent)
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <SafeIcon icon={FiDownload} className="h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('submitted')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'submitted' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Submitted ({inquiries.length})
          </button>
          <button
            onClick={() => setActiveTab('abandoned')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'abandoned' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="w-2 h-2 bg-red-500 rounded-full" />
            Abandoned ({abandonedSessions.length})
          </button>
        </div>

        {/* Search + filter row */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-52">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={activeTab === 'submitted' ? 'Search name, email, domain…' : 'Search domain or source…'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          {activeTab === 'submitted' && (
            <div className="flex gap-1 flex-wrap">
              {['all', 'new', 'replied', 'negotiating', 'closed'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    filter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                  <span className="ml-1.5 opacity-75">
                    ({s === 'all' ? inquiries.length : inquiries.filter(i => i.status === s).length})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SUBMITTED INQUIRIES */}
        {activeTab === 'submitted' && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {filteredInquiries.length > 0 ? (
              <AnimatePresence>
                {filteredInquiries.map((inquiry, idx) => (
                  <motion.div
                    key={inquiry.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedInquiry(inquiry)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{inquiry.name}</span>
                          <span className="text-sm text-gray-500">{inquiry.email}</span>
                          {inquiry.phone && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <SafeIcon icon={FiPhone} className="h-3 w-3" />
                              {inquiry.phone}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <SafeIcon icon={FiGlobe} className="h-3.5 w-3.5" />
                            {inquiry.domain_name}
                          </span>
                          {inquiry.offerAmount && (
                            <span className="flex items-center gap-1 font-bold text-green-700">
                              <SafeIcon icon={FiDollarSign} className="h-3.5 w-3.5" />
                              ${Number(inquiry.offerAmount).toLocaleString()}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-gray-400">
                            <SafeIcon icon={FiCalendar} className="h-3.5 w-3.5" />
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </span>
                          {inquiry.session && (
                            <span className="text-xs text-gray-400">
                              via {inquiry.session.referrerSource}
                              {' · '}{inquiry.session.device}
                            </span>
                          )}
                        </div>
                        {inquiry.message && (
                          <p className="text-sm text-gray-600 line-clamp-2">{inquiry.message}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <select
                          value={inquiry.status}
                          onClick={e => e.stopPropagation()}
                          onChange={e => { e.stopPropagation(); updateInquiry(inquiry.id, { status: e.target.value }); }}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[inquiry.status] || 'bg-gray-100 text-gray-700'}`}
                        >
                          <option value="new">New</option>
                          <option value="replied">Replied</option>
                          <option value="negotiating">Negotiating</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            ) : (
              <div className="text-center py-16">
                <SafeIcon icon={FiMail} className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No inquiries yet</p>
                <p className="text-gray-400 text-sm mt-1">They'll appear here when someone submits an offer</p>
              </div>
            )}
          </div>
        )}

        {/* ABANDONED INQUIRIES */}
        {activeTab === 'abandoned' && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <SafeIcon icon={FiAlertCircle} className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">These visitors started filling the form but didn't submit.</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  You can see the prices they typed. Consider reaching out proactively.
                </p>
              </div>
            </div>

            {filteredAbandoned.length > 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {filteredAbandoned.map((session, idx) => (
                  <motion.div
                    key={session.sessionId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="p-5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <span className="font-semibold text-gray-900">{session.domainName}</span>
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            Form Abandoned
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span>Source: <strong className="text-gray-700">{session.referrerSource || 'Direct'}</strong></span>
                          <span>Device: {session.device}</span>
                          <span>{new Date(session.startTime).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {session.lastPriceTyped && (
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-400">Last offer typed</p>
                          <p className="text-xl font-bold text-green-600">
                            ${Number(session.lastPriceTyped).toLocaleString()}
                          </p>
                          {session.pricesTyped?.length > 1 && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Tried: {session.pricesTyped.map(p => `$${Number(p).toLocaleString()}`).join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm text-center py-16">
                <SafeIcon icon={FiCheck} className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No abandoned forms yet</p>
                <p className="text-gray-400 text-sm mt-1">When visitors start but don't finish, they'll appear here</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Inquiry Details</h2>
              <button onClick={() => setSelectedInquiry(null)} className="text-gray-400 hover:text-gray-600">
                <SafeIcon icon={FiX} className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  ['Name', selectedInquiry.name],
                  ['Email', selectedInquiry.email],
                  ['Phone', selectedInquiry.phone || '—'],
                  ['Domain', selectedInquiry.domain_name],
                  ['Offer Amount', selectedInquiry.offerAmount ? `$${Number(selectedInquiry.offerAmount).toLocaleString()}` : '—'],
                  ['Date', new Date(selectedInquiry.created_at).toLocaleString()],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
                    <p className="text-gray-900 font-medium">{val}</p>
                  </div>
                ))}
              </div>

              {selectedInquiry.message && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">Message</p>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-800 whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </div>
                </div>
              )}

              {selectedInquiry.session && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Visitor Info</p>
                  <div className="bg-blue-50 rounded-xl p-4 grid sm:grid-cols-2 gap-3 text-sm">
                    {[
                      ['Source', selectedInquiry.session.referrerSource],
                      ['Device', selectedInquiry.session.device],
                      ['Browser', selectedInquiry.session.browser],
                      ['Language', selectedInquiry.session.language],
                      ['UTM Campaign', selectedInquiry.session.utmCampaign || '—'],
                      ['Referrer URL', selectedInquiry.session.referrer || 'Direct'],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-xs text-blue-600 font-medium">{label}</p>
                        <p className="text-blue-900 text-sm truncate">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.domain_name} — Your Offer`}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium text-center"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Abandoned Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Abandoned Session</h2>
              <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-gray-600">
                <SafeIcon icon={FiX} className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-red-50 rounded-xl p-4 text-center">
                <p className="text-sm text-red-600 font-medium">This visitor started but did not complete the offer form</p>
                {selectedSession.lastPriceTyped && (
                  <p className="text-3xl font-bold text-red-700 mt-2">
                    ${Number(selectedSession.lastPriceTyped).toLocaleString()}
                  </p>
                )}
                {selectedSession.pricesTyped?.length > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    All prices typed: {selectedSession.pricesTyped.map(p => `$${Number(p).toLocaleString()}`).join(' → ')}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Domain', selectedSession.domainName],
                  ['Source', selectedSession.referrerSource],
                  ['Device', selectedSession.device],
                  ['Browser', selectedSession.browser],
                  ['Time', new Date(selectedSession.startTime).toLocaleString()],
                  ['Language', selectedSession.language],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                    <p className="text-gray-800">{val || '—'}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setSelectedSession(null)}
                className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
};

export default InquiryManager;
