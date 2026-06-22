import React, { createContext, useContext, useState, useCallback } from 'react';

const InquiryContext = createContext();

export const useInquiries = () => {
  const context = useContext(InquiryContext);
  if (!context) throw new Error('useInquiries must be used within InquiryProvider');
  return context;
};

const INQUIRIES_KEY = 'dm_inquiries';

const loadInquiries = () => {
  try {
    return JSON.parse(localStorage.getItem(INQUIRIES_KEY) || '[]');
  } catch {
    return [];
  }
};

const persistInquiries = (inquiries) => {
  localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
};

export const InquiryProvider = ({ children }) => {
  const [inquiries, setInquiries] = useState(loadInquiries);

  const addInquiry = useCallback((inquiryData) => {
    const newInquiry = {
      id: Date.now(),
      ...inquiryData,
      status: 'new',
      created_at: new Date().toISOString(),
    };

    setInquiries(prev => {
      const updated = [...prev, newInquiry];
      persistInquiries(updated);
      return updated;
    });

    return newInquiry;
  }, []);

  const updateInquiry = useCallback((id, updates) => {
    setInquiries(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, ...updates } : i);
      persistInquiries(updated);
      return updated;
    });
  }, []);

  const deleteInquiry = useCallback((id) => {
    setInquiries(prev => {
      const updated = prev.filter(i => i.id !== id);
      persistInquiries(updated);
      return updated;
    });
  }, []);

  const getInquiriesForDomain = useCallback((domainId) =>
    inquiries.filter(i => i.domain_id === domainId),
  [inquiries]);

  const value = {
    inquiries,
    addInquiry,
    updateInquiry,
    deleteInquiry,
    getInquiriesForDomain,
  };

  return (
    <InquiryContext.Provider value={value}>
      {children}
    </InquiryContext.Provider>
  );
};
