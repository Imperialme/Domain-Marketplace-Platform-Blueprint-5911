import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDomains } from '../context/DomainContext';

const BrowseDomains = () => {
  const { domains, domainsLoading } = useDomains();
  const [search, setSearch] = useState('');
  const [tldFilter, setTldFilter] = useState('');

  const active = domains.filter(d => d.status === 'active');

  // Extract unique TLDs from active domains
  const tlds = [...new Set(
    active.map(d => '.' + d.domain_name.split('.').slice(1).join('.'))
  )].sort();

  const displayed = active.filter(d => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      d.domain_name.toLowerCase().includes(q) ||
      (d.tagline || '').toLowerCase().includes(q);
    const matchTld = !tldFilter || d.domain_name.endsWith(tldFilter);
    return matchSearch && matchTld;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <header className="border-b border-white/8 px-6 py-5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 36 36" width="32" height="32" fill="none">
              <circle cx="18" cy="18" r="16" stroke="#60a5fa" strokeWidth="1.8"/>
              <ellipse cx="18" cy="18" rx="7" ry="16" stroke="#60a5fa" strokeWidth="1.4"/>
              <line x1="2" y1="18" x2="34" y2="18" stroke="#60a5fa" strokeWidth="1.4"/>
            </svg>
            <span className="font-extrabold text-lg">Net<span className="text-blue-400">Zone</span></span>
          </div>
          <span className="text-slate-400 text-sm">
            {domainsLoading ? 'Loading…' : `${active.length} domain${active.length !== 1 ? 's' : ''} available`}
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-blue-300 font-medium">Premium Portfolio · Available Now</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Premium Domains for Sale</h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Hand-picked domains ready for immediate transfer. Secure purchase via Escrow.com, PayPal, or Crypto.
            </p>
          </motion.div>
        </div>

        {/* Search + TLD filters */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search domains…"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all text-sm"
          />
          {tlds.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTldFilter('')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  !tldFilter ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                }`}
              >
                All
              </button>
              {tlds.map(tld => (
                <button
                  key={tld}
                  onClick={() => setTldFilter(tldFilter === tld ? '' : tld)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    tldFilter === tld ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {tld}
                </button>
              ))}
            </div>
          )}
        </div>

        {domainsLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg">{active.length === 0 ? 'No domains listed yet.' : 'No domains match your search.'}</p>
            {search || tldFilter ? (
              <button onClick={() => { setSearch(''); setTldFilter(''); }}
                className="mt-3 text-sm text-blue-400 hover:text-blue-300 underline">
                Clear filters
              </button>
            ) : (
              <p className="text-sm mt-2">Check back soon.</p>
            )}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayed.map((domain, i) => (
              <motion.div key={domain.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-blue-500/30 transition-all group">
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                    {domain.domain_name}
                  </h2>
                  {domain.tagline && (
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2 leading-relaxed">{domain.tagline}</p>
                  )}
                </div>

                <div className="flex items-end justify-between mb-5">
                  {domain.buy_now_price ? (
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Buy Now</p>
                      <p className="text-xl font-bold text-green-400">USD {Number(domain.buy_now_price).toLocaleString()}</p>
                    </div>
                  ) : domain.min_offer ? (
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Offers from</p>
                      <p className="text-xl font-bold text-blue-400">USD {Number(domain.min_offer).toLocaleString()}</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-slate-500 mb-0.5">Price</p>
                      <p className="text-sm text-slate-300 font-medium">Make an offer</p>
                    </div>
                  )}
                  <span className="text-xs bg-green-500/20 text-green-400 px-2.5 py-1 rounded-full font-semibold">
                    Available
                  </span>
                </div>

                <Link to={`/domain/${domain.domain_name}`}
                  className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  View & Make Offer
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-white/8 py-8 px-6 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <svg viewBox="0 0 36 36" width="20" height="20" fill="none">
              <circle cx="18" cy="18" r="16" stroke="#60a5fa" strokeWidth="1.8"/>
              <ellipse cx="18" cy="18" rx="7" ry="16" stroke="#60a5fa" strokeWidth="1.4"/>
              <line x1="2" y1="18" x2="34" y2="18" stroke="#60a5fa" strokeWidth="1.4"/>
            </svg>
            <span className="font-extrabold text-sm text-white">Net<span className="text-blue-400">Zone</span></span>
          </div>
          <p className="text-slate-600 text-sm">
            Questions? <a href="mailto:ask@netzone.me" className="text-blue-400 hover:text-blue-300 font-medium">ask@netzone.me</a>
          </p>
          <p className="text-slate-700 text-xs">&copy; {new Date().getFullYear()} · Secure Domain Transfer</p>
        </div>
      </footer>
    </div>
  );
};

export default BrowseDomains;
