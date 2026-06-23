import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

const InquiryContext = createContext();

export const useInquiries = () => {
  const context = useContext(InquiryContext);
  if (!context) throw new Error('useInquiries must be used within InquiryProvider');
  return context;
};

const INQUIRIES_KEY = 'dm_inquiries';

const isLocalDev = () =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

const loadInquiries = () => {
  try {
    return JSON.parse(localStorage.getItem(INQUIRIES_KEY) || '[]');
  } catch {
    return [];
  }
};

const persistLocal = (inquiries) => {
  try { localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries)); } catch (_e) { /* storage full */ }
};

export const InquiryProvider = ({ children }) => {
  const [inquiries, setInquiries] = useState(loadInquiries);
  const serverLoadedRef = useRef(isLocalDev());
  const serverFetchRef = useRef(false);

  // ── Fetch from Blobs on mount (production only) ──────────────────────────
  useEffect(() => {
    if (isLocalDev()) return;

    fetch('/api/get-inquiries')
      .then(r => r.json())
      .then(serverInquiries => {
        if (Array.isArray(serverInquiries) && serverInquiries.length > 0) {
          serverFetchRef.current = true;
          setInquiries(serverInquiries);
          persistLocal(serverInquiries);
        }
      })
      .catch(() => {})
      .finally(() => { serverLoadedRef.current = true; });
  }, []);

  // ── Sync full list to Blobs whenever inquiries change (admin mutations) ──
  useEffect(() => {
    persistLocal(inquiries);
    if (!serverLoadedRef.current) return;
    if (serverFetchRef.current) { serverFetchRef.current = false; return; }
    if (isLocalDev()) return;

    fetch('/api/set-inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inquiries),
    }).catch(() => {});
  }, [inquiries]);

  const addInquiry = useCallback((inquiryData) => {
    const newInquiry = {
      id: Date.now(),
      ...inquiryData,
      status: 'new',
      created_at: new Date().toISOString(),
    };

    setInquiries(prev => {
      const updated = [...prev, newInquiry];
      persistLocal(updated);
      return updated;
    });

    // Push directly to Blobs from the landing page (visitor's browser)
    if (!isLocalDev()) {
      fetch('/api/add-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInquiry),
      }).catch(() => {});
    }

    return newInquiry;
  }, []);

  const updateInquiry = useCallback((id, updates) => {
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  }, []);

  const deleteInquiry = useCallback((id) => {
    setInquiries(prev => prev.filter(i => i.id !== id));
  }, []);

  const getInquiriesForDomain = useCallback((domainId) =>
    inquiries.filter(i => i.domain_id === domainId),
  [inquiries]);

  return (
    <InquiryContext.Provider value={{
      inquiries,
      addInquiry,
      updateInquiry,
      deleteInquiry,
      getInquiriesForDomain,
    }}>
      {children}
    </InquiryContext.Provider>
  );
};
