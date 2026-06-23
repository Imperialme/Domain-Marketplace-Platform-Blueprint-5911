import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useInquiries } from '../context/InquiryContext';
import { useVisitor } from '../context/VisitorContext';
import { getPurchasingPower, countryFlag } from '../utils/geo';
import AdminLayout from '../components/AdminLayout';

const {
  FiMail, FiDollarSign, FiCalendar, FiDownload, FiX,
  FiAlertCircle, FiCheck, FiUser, FiSearch, FiGlobe,
  FiPhone, FiFileText, FiSave, FiCornerDownLeft,
} = FiIcons;

// ── Helpers ──────────────────────────────────────────────────────────────────
const buildReplyHref = (inquiry) => {
  const subj = encodeURIComponent(
    `Re: ${inquiry.domain_name} — Your Offer${inquiry.ref ? ` [${inquiry.ref}]` : ''}`
  );
  const body = encodeURIComponent(
    `Hi ${inquiry.name},\n\nThank you for your offer of USD ${Number(inquiry.offerAmount || 0).toLocaleString()} for ${inquiry.domain_name}.\n\nWe will be in touch with you shortly to finalize the details and see how we can move forward with the negotiation.\n\nBest regards,\nNetZone`
  );
  return `mailto:${inquiry.email}?subject=${subj}&body=${body}`;
};

// ── Inline note editor ────────────────────────────────────────────────────────
const InlineNote = ({ inquiry, onSave }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(inquiry.notes || '');

  React.useEffect(() => { setText(inquiry.notes || ''); }, [inquiry.notes]);

  const save = () => { onSave(text.trim()); setOpen(false); };
  const clear = () => { setText(''); onSave(''); setOpen(false); };

  return (
    <div className="mt-2">
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        className={`flex items-center gap-1 text-xs transition-colors ${
          inquiry.notes
            ? 'text-amber-600 hover:text-amber-700 font-medium'
            : 'text-gray-400 hover:text-blue-600'
        }`}
      >
        <SafeIcon icon={FiFileText} className="h-3 w-3" />
        {open ? 'Collapse' : inquiry.notes ? 'Edit note' : 'Add note'}
      </button>

      {open && (
        <div onClick={e => e.stopPropagation()} className="mt-1.5">
          <textarea
            autoFocus
            rows={2}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Internal note — only visible to you (e.g. 'Negotiating USD 8k', 'Sent counter-offer')…"
            className="w-full text-xs border border-blue-200 bg-blue-50/60 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400 resize-none text-gray-700 placeholder-gray-400"
          />
          <div className="flex items-center gap-2 mt-1.5">
            <button onClick={save}
              className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-medium transition-colors">
              <SafeIcon icon={FiSave} className="h-3 w-3" />
              Save
            </button>
            <button onClick={clear}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors">
              Clear
            </button>
            <button onClick={() => { setText(inquiry.notes || ''); setOpen(false); }}
              className="text-xs text-gray-400 hover:text-gray-600 ml-auto transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

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

  // Enrich inquiries: merge session data as fallback for older entries
  const enrichedInquiries = useMemo(() => {
    return inquiries.map(inq => {
      const session = allSessions.find(s => s.inquiryId === inq.id);
      // Geo fields are now embedded in the inquiry at submission time.
      // Fall back to session lookup for inquiries created before this change.
      return {
        ...inq,
        session,
        _country: inq.country || session?.country,
        _countryName: inq.countryName || session?.countryName,
        _city: inq.city || session?.city,
        _ip: inq.ip || session?.ip,
        _device: inq.device || session?.device,
        _browser: inq.browser || session?.browser,
        _referrerSource: inq.referrerSource || session?.referrerSource,
        _timezone: inq.timezone || session?.timezone,
        _currency: inq.currency || session?.currency,
      };
    });
  }, [inquiries, allSessions]);

  const filteredInquiries = useMemo(() => {
    return enrichedInquiries.filter(inq => {
      const matchFilter = filter === 'all' || inq.status === filter;
      const matchSearch = !search ||
        inq.name?.toLowerCase().includes(search.toLowerCase()) ||
        inq.email?.toLowerCase().includes(search.toLowerCase()) ||
        inq.domain_name?.toLowerCase().includes(search.toLowerCase()) ||
        inq.ref?.toLowerCase().includes(search.toLowerCase());
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
    const headers = ['Ref', 'Date', 'Domain', 'Name', 'Email', 'Phone', 'Offer (USD)', 'Payment', 'Status', 'Country', 'City', 'IP', 'Source', 'Device', 'Message', 'Internal Notes'];
    const rows = enrichedInquiries.map(inq => [
      inq.ref || '',
      new Date(inq.created_at).toLocaleDateString(),
      inq.domain_name || '',
      inq.name || '',
      inq.email || '',
      inq.phone || '',
      inq.offerAmount || '',
      inq.paymentMethod || '',
      inq.status || '',
      inq._countryName || '',
      inq._city || '',
      inq._ip || '',
      inq._referrerSource || '',
      inq._device || '',
      `"${(inq.message || '').replace(/"/g, '""')}"`,
      `"${(inq.notes || '').replace(/"/g, '""')}"`,
    ].join(','));
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
              placeholder={activeTab === 'submitted' ? 'Search name, email, domain, ref…' : 'Search domain or source…'}
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
                {filteredInquiries.map((inquiry, idx) => {
                  const repeatCount = inquiries.filter(i => i.email === inquiry.email).length;
                  const geoStr = [
                    inquiry._country ? countryFlag(inquiry._country) : null,
                    inquiry._countryName,
                    inquiry._city,
                  ].filter(Boolean).join(' ');

                  return (
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
                          {/* Top row: ref + name + email + badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            {inquiry.ref && (
                              <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                {inquiry.ref}
                              </span>
                            )}
                            <span className="font-semibold text-gray-900">{inquiry.name}</span>
                            <span className="text-sm text-gray-500">{inquiry.email}</span>
                            {inquiry.phone && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <SafeIcon icon={FiPhone} className="h-3 w-3" />
                                {inquiry.phone}
                              </span>
                            )}
                            {repeatCount > 1 && (
                              <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium border border-purple-100">
                                {repeatCount}× inquiries
                              </span>
                            )}
                            {inquiry.notes && (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                <SafeIcon icon={FiFileText} className="h-3 w-3" /> note
                              </span>
                            )}
                          </div>

                          {/* Second row: domain + offer + date + geo + source */}
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                            <span className="flex items-center gap-1">
                              <SafeIcon icon={FiGlobe} className="h-3.5 w-3.5" />
                              {inquiry.domain_name}
                            </span>
                            {inquiry.offerAmount && (
                              <span className="font-bold text-green-700">
                                USD {Number(inquiry.offerAmount).toLocaleString()}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-gray-400">
                              <SafeIcon icon={FiCalendar} className="h-3.5 w-3.5" />
                              {new Date(inquiry.created_at).toLocaleDateString()}
                            </span>
                            {geoStr && (
                              <span className="text-xs text-gray-400">{geoStr}</span>
                            )}
                            {inquiry._referrerSource && inquiry._referrerSource !== 'Direct' && (
                              <span className="text-xs text-gray-400">via {inquiry._referrerSource}</span>
                            )}
                          </div>

                          {inquiry.message && (
                            <p className="text-sm text-gray-600 line-clamp-1 mb-1">{inquiry.message}</p>
                          )}

                          <InlineNote
                            inquiry={inquiry}
                            onSave={text => updateInquiry(inquiry.id, { notes: text })}
                          />
                        </div>

                        {/* Right: reply + status */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a
                            href={buildReplyHref(inquiry)}
                            onClick={e => e.stopPropagation()}
                            title={`Reply to ${inquiry.email}`}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-all border border-transparent hover:border-blue-200"
                          >
                            <SafeIcon icon={FiCornerDownLeft} className="h-3.5 w-3.5" />
                            Reply
                          </a>
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
                  );
                })}
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
                            USD {Number(session.lastPriceTyped).toLocaleString()}
                          </p>
                          {session.pricesTyped?.length > 1 && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Tried: {session.pricesTyped.map(p => `USD ${Number(p).toLocaleString()}`).join(', ')}
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

      {/* ── Inquiry Detail Modal ── */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Inquiry Details</h2>
                {selectedInquiry.ref && (
                  <p className="text-xs text-gray-400 font-mono mt-0.5">Ref: {selectedInquiry.ref}</p>
                )}
              </div>
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
                  ['Offer Amount', selectedInquiry.offerAmount ? `USD ${Number(selectedInquiry.offerAmount).toLocaleString()}` : '—'],
                  ['Payment', selectedInquiry.paymentMethod || '—'],
                  ['Date', new Date(selectedInquiry.created_at).toLocaleString()],
                  ['Status', selectedInquiry.status],
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

              {/* Visitor / Geo Info — reads from inquiry fields directly */}
              {(selectedInquiry._ip || selectedInquiry._country || selectedInquiry._referrerSource) && (
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Visitor Info</p>
                  <div className="bg-blue-50 rounded-xl p-4 grid sm:grid-cols-2 gap-3 text-sm">
                    {[
                      ['IP Address', selectedInquiry._ip || '—'],
                      ['Location', [
                        selectedInquiry._country ? `${countryFlag(selectedInquiry._country)} ${selectedInquiry._countryName || selectedInquiry._country}` : null,
                        selectedInquiry._city,
                      ].filter(Boolean).join(', ') || '—'],
                      ['Source', selectedInquiry._referrerSource || 'Direct'],
                      ['Device', selectedInquiry._device || '—'],
                      ['Browser', selectedInquiry._browser || '—'],
                      ['Timezone', selectedInquiry._timezone || '—'],
                      ['Currency', selectedInquiry._currency || '—'],
                      ['Referrer URL', selectedInquiry.referrer || 'Direct'],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-xs text-blue-600 font-medium">{label}</p>
                        <p className="text-blue-900 text-sm">{val}</p>
                      </div>
                    ))}
                    {selectedInquiry._country && (() => {
                      const p = getPurchasingPower(selectedInquiry._country);
                      return (
                        <div className="col-span-2">
                          <p className="text-xs text-blue-600 font-medium mb-1">Purchasing Power</p>
                          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${p.bg}`}>
                            <span>{p.stars}</span>
                            <div>
                              <span className={`text-sm font-bold ${p.color}`}>{p.label}</span>
                              <span className={`text-xs ${p.color} opacity-75 ml-2`}>— {p.hint}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Repeat buyer indicator */}
              {(() => {
                const count = inquiries.filter(i => i.email === selectedInquiry.email).length;
                if (count <= 1) return null;
                return (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 flex items-center gap-2">
                    <span className="text-purple-500 text-lg">🔁</span>
                    <p className="text-sm text-purple-800 font-medium">
                      This buyer has submitted {count} inquiries total from the same email address.
                    </p>
                  </div>
                );
              })()}

              {/* Internal notes in modal */}
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1 uppercase tracking-wide flex items-center gap-1">
                  <SafeIcon icon={FiFileText} className="h-3.5 w-3.5" /> Internal Note
                </p>
                <InlineNote
                  inquiry={selectedInquiry}
                  onSave={text => {
                    updateInquiry(selectedInquiry.id, { notes: text });
                    setSelectedInquiry(prev => ({ ...prev, notes: text }));
                  }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Close
                </button>
                <a
                  href={buildReplyHref(selectedInquiry)}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium text-center flex items-center justify-center gap-1.5"
                >
                  <SafeIcon icon={FiCornerDownLeft} className="h-4 w-4" />
                  Reply via Email
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Abandoned Session Detail Modal ── */}
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
                    USD {Number(selectedSession.lastPriceTyped).toLocaleString()}
                  </p>
                )}
                {selectedSession.pricesTyped?.length > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    All prices typed: {selectedSession.pricesTyped.map(p => `USD ${Number(p).toLocaleString()}`).join(' → ')}
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
