import React, { createContext, useContext, useState, useEffect } from 'react';

const DomainContext = createContext();

export const useDomains = () => {
  const context = useContext(DomainContext);
  if (!context) {
    throw new Error('useDomains must be used within a DomainProvider');
  }
  return context;
};

export const DomainProvider = ({ children }) => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockDomains = [
      {
        id: 1,
        domain_name: 'techstartup.com',
        nameservers: ['ns1.netzone.me', 'ns2.netzone.me'],
        status: 'active',
        price: 15000,
        tagline: 'Perfect for your next tech venture',
        theme_variant: 1,
        verified_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        domain_name: 'digitalagency.net',
        nameservers: ['ns1.netzone.me', 'ns2.netzone.me'],
        status: 'active',
        price: 8500,
        tagline: 'Ideal for digital marketing agencies',
        theme_variant: 2,
        verified_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        domain_name: 'ecommercehub.io',
        nameservers: ['ns1.netzone.me', 'ns2.netzone.me'],
        status: 'pending_verification',
        price: 12000,
        tagline: 'E-commerce ready domain',
        theme_variant: 3,
        created_at: new Date().toISOString()
      }
    ];
    setDomains(mockDomains);
  }, []);

  const addDomain = (domainData) => {
    const newDomain = {
      id: Date.now(),
      ...domainData,
      status: 'pending_verification',
      created_at: new Date().toISOString()
    };
    setDomains(prev => [...prev, newDomain]);
    return newDomain;
  };

  const updateDomain = (id, updates) => {
    setDomains(prev => prev.map(domain => 
      domain.id === id ? { ...domain, ...updates } : domain
    ));
  };

  const deleteDomain = (id) => {
    setDomains(prev => prev.filter(domain => domain.id !== id));
  };

  const getDomainByName = (domainName) => {
    return domains.find(domain => domain.domain_name === domainName);
  };

  const value = {
    domains,
    loading,
    addDomain,
    updateDomain,
    deleteDomain,
    getDomainByName
  };

  return (
    <DomainContext.Provider value={value}>
      {children}
    </DomainContext.Provider>
  );
};