import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useVisitor } from '../context/VisitorContext';
import { getPurchasingPower, countryFlag } from '../utils/geo';
import AdminLayout from '../components/AdminLayout';

const {
  FiUsers, FiAlertCircle, FiDollarSign, FiSearch, FiTrash2,
  FiTrendingUp, FiChevronDown, FiChevronUp, FiSmartphone, FiMonitor,
} = FiIcons;

// ── Small reusable badges ────────────────────────────────────────────────────

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
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${colors[source] || 'bg-gray-100 text-gray-700'}`}>
      {source || 'Direct'}
    </span>
  );
};

const StatusBadge = ({ session }) => {
  if (session.formSubmitted) return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Submitted</span>;
  if (session.formStarted) return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Abandoned</span>;
  return <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Browsed</span>;
};

const PowerBadge = ({ countryCode }) => {
  if (!countryCode) return <span className="text-xs text-gray-400">—</span>;
  const p = getPurchasingPower(countryCode);
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${p.bg} ${p.color}`}>
      {p.stars} {p.label}
    </span>
  );
};

// ── Expanded row detail ──────────────────────────────────────────────────────

const SessionRow = ({ session }) => {
  const [expanded, setExpanded] = useState(false);
  const flag = countryFlag(session.country);
  const power = session.country ? getPurchasingPower(session.country) : null;
  const timeOnPage = session.endTime
    ? Math.round((new Date(session.endTime) - new Date(session.startTime)) / 1000)
    : null;

  return (
    <>
      <tr
        className="hover:bg-slate-50 cursor-pointer border-b border-gray-100 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Time */}
        <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
          {new Date(session.startTime).toLocaleDateString()}{' '}
          <span className="text-gray-400">
            {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </td>

        {/* Location */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <span className="text-lg leading-none">{flag}</span>
            <div>
              <p className="text-xs font-semibold text-gray-800">
                {session.countryName || session.country || 'Unknown'}
              </p>
              {session.city && <p className="text-xs text-gray-400">{session.city}</p>}
            </div>
          </div>
        </td>

        {/* Purchasing power */}
        <td className="py-3 px-4">
          <PowerBadge countryCode={session.country} />
        </td>

        {/* Domain */}
        <td className="py-3 px-4 text-sm font-medium text-gray-900 max-w-[140px] truncate">
          {session.domainName}
        </td>

        {/* Source */}
        <td className="py-3 px-4"><SourceBadge source={session.referrerSource} /></td>

        {/* Device */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <SafeIcon icon={session.device === 'Mobile' ? FiSmartphone : FiMonitor} className="h-3.5 w-3.5" />
            {session.device}
          </div>
        </td>

        {/* Price entered */}
        <td className="py-3 px-4">
          {session.lastPriceTyped
            ? <span className="text-sm font-bold text-green-700">${Number(session.lastPriceTyped).toLocaleString()}</span>
            : <span className="text-xs text-gray-300">—</span>}
        </td>

        {/* Status */}
        <td className="py-3 px-4"><StatusBadge session={session} /></td>

        {/* Duration */}
        <td className="py-3 px-4 text-xs text-gray-400">
          {timeOnPage != null ? `${timeOnPage}s` : 'active'}
        </td>

        <td className="py-3 px-4 text-gray-400">
          <SafeIcon icon={expanded ? FiChevronUp : FiChevronDown} className="h-4 w-4" />
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-blue-50/50 border-b border-blue-100">
          <td colSpan={10} className="px-6 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 text-sm">
              {[
                ['IP Address', session.ip || '—'],
                ['Country', session.countryName ? `${flag} ${session.countryName}` : '—'],
                ['City / Region', [session.city, session.region].filter(Boolean).join(', ') || '—'],
                ['Timezone', session.timezone || '—'],
                ['Currency', session.currency || '—'],
                ['ISP / Org', session.isp || '—'],
                ['Browser', session.browser || '—'],
                ['Screen', session.screenWidth ? `${session.screenWidth}px` : '—'],
                ['Language', session.language || '—'],
                ['UTM Source', session.utmSource || '—'],
                ['UTM Campaign', session.utmCampaign || '—'],
                ['Referrer URL', session.referrer || 'Direct'],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs text-blue-600 font-semibold mb-0.5">{label}</p>
                  <p className="text-gray-800 text-xs break-all">{val}</p>
                </div>
              ))}

              <div className="col-span-2 md:col-span-4 lg:col-span-5">
                <p className="text-xs text-blue-600 font-semibold mb-0.5">All Prices Typed</p>
                {session.pricesTyped?.length ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {session.pricesTyped.map((p, i) => (
                      <span key={i} className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-full">
                        ${Number(p).toLocaleString()}
                      </span>
                    ))}
                    <span className="text-xs text-gray-400 self-center">
                      → visitor tried {session.pricesTyped.length} price{session.pricesTyped.length > 1 ? 's' : ''} before {session.formSubmitted ? 'submitting' : 'leaving'}
                    </span>
                  </div>
                ) : (
                  <p className="text-gray-400 text-xs">No prices typed</p>
                )}
              </div>

              {power && (
                <div className="col-span-2 md:col-span-4 lg:col-span-5">
                  <p className="text-xs text-blue-600 font-semibold mb-1">Purchasing Power Assessment</p>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${power.bg}`}>
                    <span className="text-lg">{power.stars}</span>
                    <div>
                      <p className={`text-sm font-bold ${power.color}`}>{power.label}</p>
                      <p className={`text-xs ${power.color} opacity-80`}>{power.hint}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// ── Main page ────────────────────────────────────────────────────────────────

const VisitorInsights = () => {
  const { getAllSessions, clearSessions } = useVisitor();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterCountry, setFilterCountry] = useState('all');

  const allSessions = getAllSessions();

  const domains = useMemo(() => {
    const d = new Set(allSessions.map(s => s.domainName).filter(Boolean));
    return ['all', ...d];
  }, [allSessions]);

  const countries = useMemo(() => {
    const c = new Set(allSessions.map(s => s.countryName || s.country).filter(Boolean));
    return ['all', ...c].sort();
  }, [allSessions]);

  const filtered = useMemo(() => {
    return allSessions.filter(s => {
      const matchSearch = !search ||
        s.domainName?.toLowerCase().includes(search.toLowerCase()) ||
        s.referrerSource?.toLowerCase().includes(search.toLowerCase()) ||
        s.countryName?.toLowerCase().includes(search.toLowerCase()) ||
        s.city?.toLowerCase().includes(search.toLowerCase()) ||
        s.ip?.includes(search);
      const matchDomain = filterDomain === 'all' || s.domainName === filterDomain;
      const matchCountry = filterCountry === 'all' ||
        s.countryName === filterCountry || s.country === filterCountry;
      const matchStatus =
        filterStatus === 'all' ? true :
        filterStatus === 'submitted' ? s.formSubmitted :
        filterStatus === 'abandoned' ? (s.formStarted && !s.formSubmitted) :
        filterStatus === 'browsed' ? !s.formStarted : true;
      return matchSearch && matchDomain && matchCountry && matchStatus;
    });
  }, [allSessions, search, filterStatus, filterDomain, filterCountry]);

  // KPI stats
  const stats = useMemo(() => {
    const submitted = allSessions.filter(s => s.formSubmitted).length;
    const abandoned = allSessions.filter(s => s.formStarted && !s.formSubmitted).length;
    const withPrices = allSessions.filter(s => s.lastPriceTyped);
    const avgPrice = withPrices.length
      ? withPrices.reduce((sum, s) => sum + s.lastPriceTyped, 0) / withPrices.length
      : 0;

    const sources = {};
    allSessions.forEach(s => { const src = s.referrerSource || 'Direct'; sources[src] = (sources[src] || 0) + 1; });
    const topSources = Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const countryMap = {};
    allSessions.forEach(s => {
      if (s.country) countryMap[s.country] = (countryMap[s.country] || 0) + 1;
    });
    const topCountries = Object.entries(countryMap).sort((a, b) => b[1] - a[1]).slice(0, 8);

    return { submitted, abandoned, withPrices: withPrices.length, avgPrice, topSources, topCountries };
  }, [allSessions]);

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Visitor Insights</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Real IPs, locations, purchasing power, and every price typed — even before submitting
            </p>
          </div>
          <button onClick={() => { if (window.confirm('Clear all session data?')) clearSessions(); }}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-2 rounded-lg transition-colors">
            <SafeIcon icon={FiTrash2} className="h-4 w-4" />Clear Data
          </button>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Visitors', value: allSessions.length, icon: FiUsers, color: 'blue' },
            { label: 'Offers Submitted', value: stats.submitted, icon: FiTrendingUp, color: 'green' },
            { label: 'Abandoned Forms', value: stats.abandoned, icon: FiAlertCircle, color: 'red' },
            {
              label: 'Avg Price Entered',
              value: stats.avgPrice > 0 ? `$${Math.round(stats.avgPrice).toLocaleString()}` : '—',
              icon: FiDollarSign, color: 'yellow',
            },
          ].map(({ label, value, icon, color }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
                  <p className={`text-2xl font-black mt-1 text-${color}-600`}>{value}</p>
                </div>
                <div className={`bg-${color}-100 p-2 rounded-lg`}>
                  <SafeIcon icon={icon} className={`h-5 w-5 text-${color}-600`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sources + Countries side by side */}
        {(stats.topSources.length > 0 || stats.topCountries.length > 0) && (
          <div className="grid md:grid-cols-2 gap-5">
            {/* Traffic sources */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Traffic Sources</h3>
              <div className="space-y-3">
                {stats.topSources.map(([source, count]) => {
                  const pct = Math.round((count / allSessions.length) * 100);
                  return (
                    <div key={source} className="flex items-center gap-3">
                      <span className="w-20 text-sm text-gray-700 font-medium truncate">{source}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }} className="h-2 bg-blue-500 rounded-full" />
                      </div>
                      <span className="text-xs text-gray-500 w-20 text-right">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top countries */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Visitor Countries</h3>
              <div className="space-y-2.5">
                {stats.topCountries.map(([code, count]) => {
                  const pct = Math.round((count / allSessions.length) * 100);
                  const power = getPurchasingPower(code);
                  return (
                    <div key={code} className="flex items-center gap-3">
                      <span className="text-lg leading-none w-7 text-center">{countryFlag(code)}</span>
                      <span className="w-16 text-sm text-gray-700 font-medium truncate">{code}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6 }} className={`h-2 rounded-full ${power.dot}`} />
                      </div>
                      <span className="text-xs text-gray-500 w-14 text-right">{count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔍</span>
            <input type="text" placeholder="Search IP, country, domain, source…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
          </div>
          <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            {domains.map(d => <option key={d} value={d}>{d === 'all' ? 'All Domains' : d}</option>)}
          </select>
          <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500">
            {countries.map(c => <option key={c} value={c}>{c === 'all' ? 'All Countries' : c}</option>)}
          </select>
          <div className="flex gap-1">
            {['all', 'submitted', 'abandoned', 'browsed'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === s ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Sessions
              <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
            </h3>
            <p className="text-xs text-gray-400">Click any row to expand IP, geo, purchasing power & price history</p>
          </div>
          <div className="overflow-x-auto">
            {filtered.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {['Time', 'Location', 'Buying Power', 'Domain', 'Source', 'Device', 'Price Typed', 'Status', 'Duration', ''].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(session => (
                    <SessionRow key={session.sessionId} session={session} />
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-16">
                <span className="text-5xl">🌍</span>
                <p className="text-gray-500 font-medium mt-4">No visitor sessions yet</p>
                <p className="text-gray-400 text-sm mt-1">Sessions appear when someone visits a domain landing page</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default VisitorInsights;
