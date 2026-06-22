import React, { createContext, useContext, useState, useEffect } from 'react';

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
  } catch (_) { /* ignore */ }
  return DEFAULT_DOMAINS;
};

export const DomainProvider = ({ children }) => {
  const [domains, setDomains] = useState(loadDomains);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(domains));
    } catch (_) { /* ignore */ }
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

  // Bulk import: array of { domain_name, buy_now_price, min_offer, tagline }
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
    <DomainContext.Provider value={{ domains, addDomain, bulkImportDomains, updateDomain, deleteDomain, getDomainByName }}>
      {children}
    </DomainContext.Provider>
  );
};
