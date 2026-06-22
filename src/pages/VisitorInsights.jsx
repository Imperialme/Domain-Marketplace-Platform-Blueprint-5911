import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useVisitor } from '../context/VisitorContext';
import AdminLayout from '../components/AdminLayout';

const {
  FiUsers, FiEye, FiAlertCircle, FiDollarSign, FiGlobe,
  FiSmartphone, FiMonitor, FiSearch, FiFilter, FiTrash2,
  FiClock, FiTrendingUp, FiChevronDown, FiChevronUp,
} = FiIcons;

const SourceBadge = ({ source }) => {
  const colors = {
    Google: 'bg-blue-100 text-blue-800',
    Bing: 'bg-teal-100 text-teal-800',
    Facebook: 'bg-indigo-100 text-indigo-800',
    'Twitter/X': 'bg-sky-100 text-sky-800',
    LinkedIn: 'bg-blue-100 text-blue-800',
    Direct: 'bg-gray-100 text-gray-700',
    Instagram: 'bg-pink-100 text-pink-800',
    Reddit: 'bg-orange-100 text-orange-800',
    YouTube: 'bg-red-100 text-red-800',
  };
  const cls = colors[source] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {source || 'Direct'}
    </span>
  );
};

const StatusBadge = ({ session }) => {
  if (session.formSubmitted) {
    return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Submitted</span>;
  }
  if (session.formAbandoned || (session.formStarted && !session.formSubmitted)) {
    return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Abandoned</span>;
  }
  return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Browsed</span>;
};

const SessionRow = ({ session, index }) => {
  const [expanded, setExpanded] = useState(false);

  const timeOnPage = session.endTime
    ? Math.round((new Date(session.endTime) - new Date(session.startTime)) / 1000)
    : null;

  return (
    <>
      <tr
        className="hover:bg-gray-50 cursor-pointer border-b border-gray-100"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-3 px-4 text-sm text-gray-500">
          {new Date(session.startTime).toLocaleDateString()}{' '}
          <span className="text-gray-400 text-xs">
            {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </td>
        <td className="py-3 px-4 text-sm font-medium text-gray-900">{session.domainName}</td>
        <td className="py-3 px-4">
          <SourceBadge source={session.referrerSource} />
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <SafeIcon icon={session.device === 'Mobile' ? FiSmartphone : FiMonitor} className="h-3.5 w-3.5" />
            {session.device}
          </div>
        </td>
        <td className="py-3 px-4">
          {session.lastPriceTyped ? (
            <span className="text-sm font-semibold text-green-700">
              ${Number(session.lastPriceTyped).toLocaleString()}
            </span>
          ) : (
            <span className="text-xs text-gray-400">—</span>
          )}
        </td>
        <td className="py-3 px-4"><StatusBadge session={session} /></td>
        <td className="py-3 px-4 text-xs text-gray-400">
          {timeOnPage != null ? `${timeOnPage}s` : 'Active'}
        </td>
        <td className="py-3 px-4 text-gray-400">
          <SafeIcon icon={expanded ? FiChevronUp : FiChevronDown} className="h-4 w-4" />
        </td>
      </tr>
      {expanded && (
        <tr className="bg-blue-50/40">
          <td colSpan={8} className="px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Browser</p>
                <p className="text-gray-800">{session.browser || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Language</p>
                <p className="text-gray-800">{session.language || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Screen</p>
                <p className="text-gray-800">{session.screenWidth ? `${session.screenWidth}px` : '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">UTM Source</p>
                <p className="text-gray-800">{session.utmSource || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">UTM Campaign</p>
                <p className="text-gray-800">{session.utmCampaign || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">All Prices Typed</p>
                <p className="text-gray-800">
                  {session.pricesTyped?.length
                    ? session.pricesTyped.map(p => `$${Number(p).toLocaleString()}`).join(' → ')
                    : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Referrer URL</p>
                <p className="text-gray-800 truncate max-w-xs">{session.referrer || 'Direct'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium mb-1">Form Interaction</p>
                <p className="text-gray-800">
                  {session.formSubmitted ? '✅ Submitted' : session.formStarted ? '⚠️ Started, abandoned' : '👁️ Viewed only'}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const VisitorInsights = () => {
  const { getAllSessions, clearSessions } = useVisitor();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDomain, setFilterDomain] = useState('all');

  const allSessions = getAllSessions();

  const domains = useMemo(() => {
    const d = new Set(allSessions.map(s => s.domainName));
    return ['all', ...d];
  }, [allSessions]);

  const filtered = useMemo(() => {
    return allSessions.filter(s => {
      const matchesSearch = !search ||
        s.domainName?.toLowerCase().includes(search.toLowerCase()) ||
        s.referrerSource?.toLowerCase().includes(search.toLowerCase());
      const matchesDomain = filterDomain === 'all' || s.domainName === filterDomain;
      const matchesStatus =
        filterStatus === 'all' ? true :
        filterStatus === 'submitted' ? s.formSubmitted :
        filterStatus === 'abandoned' ? (s.formStarted && !s.formSubmitted) :
        filterStatus === 'browsed' ? (!s.formStarted) :
        true;
      return matchesSearch && matchesDomain && matchesStatus;
    });
  }, [allSessions, search, filterStatus, filterDomain]);

  // Aggregate stats
  const stats = useMemo(() => {
    const totalSessions = allSessions.length;
    const submitted = allSessions.filter(s => s.formSubmitted).length;
    const abandoned = allSessions.filter(s => s.formStarted && !s.formSubmitted).length;
    const withPrices = allSessions.filter(s => s.lastPriceTyped).length;
    const avgPrice = withPrices > 0
      ? allSessions.reduce((sum, s) => sum + (s.lastPriceTyped || 0), 0) / withPrices
      : 0;

    // Source breakdown
    const sources = {};
    allSessions.forEach(s => {
      const src = s.referrerSource || 'Direct';
      sources[src] = (sources[src] || 0) + 1;
    });
    const topSources = Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return { totalSessions, submitted, abandoned, withPrices, avgPrice, topSources };
  }, [allSessions]);

  const handleClear = () => {
    if (window.confirm('Clear all visitor session data? This cannot be undone.')) {
      clearSessions();
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visitor Insights</h1>
            <p className="text-gray-500 text-sm mt-1">
              Every visitor tracked — including what they typed but never sent
            </p>
          </div>
          <button
            onClick={handleClear}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-2 rounded-lg transition-colors"
          >
            <SafeIcon icon={FiTrash2} className="h-4 w-4" />
            Clear Data
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Visitors', value: stats.totalSessions, icon: FiUsers, color: 'blue' },
            { label: 'Offers Submitted', value: stats.submitted, icon: FiTrendingUp, color: 'green' },
            { label: 'Abandoned Forms', value: stats.abandoned, icon: FiAlertCircle, color: 'red' },
            {
              label: 'Avg Price Entered',
              value: stats.avgPrice > 0 ? `$${Math.round(stats.avgPrice).toLocaleString()}` : '—',
              icon: FiDollarSign,
              color: 'yellow',
            },
          ].map(({ label, value, icon, color }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className={`text-2xl font-bold mt-1 text-${color}-600`}>{value}</p>
                </div>
                <div className={`bg-${color}-100 p-2 rounded-lg`}>
                  <SafeIcon icon={icon} className={`h-5 w-5 text-${color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Traffic Sources */}
        {stats.topSources.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Traffic Sources</h3>
            <div className="space-y-3">
              {stats.topSources.map(([source, count]) => {
                const pct = Math.round((count / stats.totalSessions) * 100);
                return (
                  <div key={source} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-gray-700 font-medium truncate">{source}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-2 bg-blue-500 rounded-full"
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search domain or source..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={filterDomain}
            onChange={e => setFilterDomain(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {domains.map(d => <option key={d} value={d}>{d === 'all' ? 'All Domains' : d}</option>)}
          </select>
          <div className="flex gap-1">
            {['all', 'submitted', 'abandoned', 'browsed'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Visitor Sessions
              <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
            </h3>
            <p className="text-xs text-gray-400">Click a row to expand details</p>
          </div>
          <div className="overflow-x-auto">
            {filtered.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Time', 'Domain', 'Source', 'Device', 'Price Entered', 'Status', 'Duration', ''].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((session, i) => (
                    <SessionRow key={session.sessionId} session={session} index={i} />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16">
                <SafeIcon icon={FiUsers} className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No visitor sessions yet</p>
                <p className="text-gray-400 text-sm mt-1">
                  Sessions appear when visitors land on your domain pages
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default VisitorInsights;
