import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const DomainContext = createContext();

export const useDomains = () => {
  const context = useContext(DomainContext);
  if (!context) throw new Error('useDomains must be used within a DomainProvider');
  return context;
};

const STORAGE_KEY = 'dm_domains';

const DEFAULT_DOMAINS = [
  {
    id: 1,
    domain_name: 'techstartup.com',
    status: 'active',
    buy_now_price: 15000,
    min_offer: 3000,
    tagline: 'Perfect for your next tech venture',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    domain_name: 'digitalagency.net',
    status: 'active',
    buy_now_price: 8500,
    min_offer: 1500,
    tagline: 'Ideal for digital marketing agencies',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    domain_name: 'ecommercehub.io',
    status: 'active',
    buy_now_price: null,
    min_offer: 2000,
    tagline: 'E-commerce ready domain',
    created_at: new Date().toISOString(),
  },
];

const loadDomains = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (_e) { /* storage unavailable */ }
  return DEFAULT_DOMAINS;
};

const isLocalDev = () =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const DomainProvider = ({ children }) => {
  const [domains, setDomains] = useState(loadDomains);
  // True while we're fetching server domains (only in production)
  const [domainsLoading, setDomainsLoading] = useState(!isLocalDev());

  // Tracks whether server data is currently being applied (prevents sync loop)
  const serverFetchRef = useRef(false);
  // True once server load has completed (or we're in local dev)
  const serverLoadedRef = useRef(isLocalDev());

  // ── Fetch canonical domain list from Netlify Blobs on mount ───────────────
  useEffect(() => {
    if (isLocalDev()) return; // use localStorage in dev

    fetch('/.netlify/functions/get-domains')
      .then(r => r.json())
      .then(serverDomains => {
        if (Array.isArray(serverDomains) && serverDomains.length > 0) {
          serverFetchRef.current = true; // signal: this setDomains came from server
          setDomains(serverDomains);
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(serverDomains)); } catch (_e) { /* storage full */ }
        }
      })
      .catch(() => {})
      .finally(() => {
        serverLoadedRef.current = true;
        setDomainsLoading(false);
      });
  }, []);

  // ── Persist to localStorage + sync to Blobs whenever domains change ────────
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(domains)); } catch (_e) { /* storage full */ }

    // Don't write back to server before we've loaded from it (avoids overwriting with stale data)
    if (!serverLoadedRef.current) return;

    // Don't write back the data we just received FROM the server (prevents loop)
    if (serverFetchRef.current) {
      serverFetchRef.current = false;
      return;
    }

    if (isLocalDev()) return;

    fetch('/.netlify/functions/set-domains', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(domains),
    }).catch(() => {});
  }, [domains]);

  const addDomain = (domainData) => {
    const newDomain = {
      id: Date.now(),
      status: 'active',
      buy_now_price: domainData.buy_now_price || null,
      min_offer: domainData.min_offer || null,
      tagline: domainData.tagline || '',
      ...domainData,
      created_at: new Date().toISOString(),
    };
    setDomains(prev => [...prev, newDomain]);
    return newDomain;
  };

  const bulkImportDomains = (rows) => {
    const now = new Date().toISOString();
    const newDomains = rows.map((row, i) => ({
      id: Date.now() + i,
      status: 'active',
      tagline: '',
      ...row,
      created_at: now,
    }));
    setDomains(prev => {
      const existingNames = new Set(prev.map(d => d.domain_name.toLowerCase()));
      const toAdd = newDomains.filter(d => !existingNames.has(d.domain_name.toLowerCase()));
      return [...prev, ...toAdd];
    });
    return newDomains;
  };

  const updateDomain = (id, updates) => {
    setDomains(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  };

  const deleteDomain = (id) => {
    setDomains(prev => prev.filter(d => d.id !== id));
  };

  const getDomainByName = (domainName) => {
    if (!domainName) return null;
    const lower = domainName.toLowerCase();
    return domains.find(d => d.domain_name.toLowerCase() === lower) || null;
  };

  return (
    <DomainContext.Provider value={{
      domains,
      domainsLoading,
      addDomain,
      bulkImportDomains,
      updateDomain,
      deleteDomain,
      getDomainByName,
    }}>
      {children}
    </DomainContext.Provider>
  );
};
