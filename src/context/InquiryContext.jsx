import React, { createContext, useContext, useState } from 'react';

const InquiryContext = createContext();

export const useInquiries = () => {
  const context = useContext(InquiryContext);
  if (!context) {
    throw new Error('useInquiries must be used within an InquiryProvider');
  }
  return context;
};

export const InquiryProvider = ({ children }) => {
  const [inquiries, setInquiries] = useState([]);

  const addInquiry = (inquiryData) => {
    const newInquiry = {
      id: Date.now(),
      ...inquiryData,
      status: 'new',
      created_at: new Date().toISOString()
    };
    setInquiries(prev => [...prev, newInquiry]);
    
    // Mock email notification
    console.log('New inquiry submitted:', newInquiry);
    
    return newInquiry;
  };

  const updateInquiry = (id, updates) => {
    setInquiries(prev => prev.map(inquiry => 
      inquiry.id === id ? { ...inquiry, ...updates } : inquiry
    ));
  };

  const getInquiriesForDomain = (domainId) => {
    return inquiries.filter(inquiry => inquiry.domain_id === domainId);
  };

  const value = {
    inquiries,
    addInquiry,
    updateInquiry,
    getInquiriesForDomain
  };

  return (
    <InquiryContext.Provider value={value}>
      {children}
    </InquiryContext.Provider>
  );
};