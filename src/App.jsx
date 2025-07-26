import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import HomePage from './pages/HomePage';
import DomainLanding from './pages/DomainLanding';
import AdminDashboard from './pages/AdminDashboard';
import DomainManager from './pages/DomainManager';
import InquiryManager from './pages/InquiryManager';
import { DomainProvider } from './context/DomainContext';
import { InquiryProvider } from './context/InquiryContext';

function App() {
  return (
    <DomainProvider>
      <InquiryProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/domain/:domainName" element={<DomainLanding />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/domains" element={<DomainManager />} />
                <Route path="/admin/inquiries" element={<InquiryManager />} />
              </Routes>
            </AnimatePresence>
          </div>
        </Router>
      </InquiryProvider>
    </DomainProvider>
  );
}

export default App;