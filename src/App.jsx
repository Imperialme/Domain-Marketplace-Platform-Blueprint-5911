import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import DomainLanding from './pages/DomainLanding';
import AdminDashboard from './pages/AdminDashboard';
import DomainManager from './pages/DomainManager';
import InquiryManager from './pages/InquiryManager';
import Analytics from './pages/Analytics';
import VisitorInsights from './pages/VisitorInsights';
import { DomainProvider } from './context/DomainContext';
import { InquiryProvider } from './context/InquiryContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { AuthProvider } from './context/AuthContext';
import { VisitorProvider } from './context/VisitorContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <VisitorProvider>
        <DomainProvider>
          <InquiryProvider>
            <AnalyticsProvider>
              <Router>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                  <AnimatePresence mode="wait">
                    <Routes>
                      {/* Root → redirect to admin */}
                      <Route path="/" element={<Navigate to="/admin" replace />} />

                      {/* Public domain landing pages */}
                      <Route path="/domain/:domainName" element={<DomainLanding />} />

                      {/* Admin routes */}
                      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                      <Route path="/admin/domains" element={<ProtectedRoute requireAdmin><DomainManager /></ProtectedRoute>} />
                      <Route path="/admin/inquiries" element={<ProtectedRoute requireAdmin><InquiryManager /></ProtectedRoute>} />
                      <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><Analytics /></ProtectedRoute>} />
                      <Route path="/admin/visitors" element={<ProtectedRoute requireAdmin><VisitorInsights /></ProtectedRoute>} />
                    </Routes>
                  </AnimatePresence>
                </div>
              </Router>
            </AnalyticsProvider>
          </InquiryProvider>
        </DomainProvider>
      </VisitorProvider>
    </AuthProvider>
  );
}

export default App;
