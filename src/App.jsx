import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import DomainLanding from './pages/DomainLanding';
import BrowseDomains from './pages/BrowseDomains';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import AdminDashboard from './pages/AdminDashboard';
import DomainManager from './pages/DomainManager';
import InquiryManager from './pages/InquiryManager';
import Analytics from './pages/Analytics';
import VisitorInsights from './pages/VisitorInsights';
import Settings from './pages/Settings';
import DropCatcher from './pages/DropCatcher';
import { DomainProvider } from './context/DomainContext';
import { InquiryProvider } from './context/InquiryContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { AuthProvider } from './context/AuthContext';
import { VisitorProvider } from './context/VisitorContext';
import { BlogAnalyticsProvider } from './context/BlogAnalyticsContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <VisitorProvider>
        <DomainProvider>
          <InquiryProvider>
            <AnalyticsProvider>
              <BlogAnalyticsProvider>
                <Router>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                  <AnimatePresence mode="wait">
                    <Routes>
                      {/* Root → public browse page */}
                      <Route path="/" element={<Navigate to="/browse" replace />} />

                      {/* Public routes */}
                      <Route path="/browse" element={<BrowseDomains />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/domain/:domainName" element={<DomainLanding />} />

                      {/* Admin routes */}
                      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
                      <Route path="/admin/domains" element={<ProtectedRoute requireAdmin><DomainManager /></ProtectedRoute>} />
                      <Route path="/admin/inquiries" element={<ProtectedRoute requireAdmin><InquiryManager /></ProtectedRoute>} />
                      <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><Analytics /></ProtectedRoute>} />
                      <Route path="/admin/visitors" element={<ProtectedRoute requireAdmin><VisitorInsights /></ProtectedRoute>} />
                      <Route path="/admin/dropcatcher" element={<ProtectedRoute requireAdmin><DropCatcher /></ProtectedRoute>} />
                      <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><Settings /></ProtectedRoute>} />
                    </Routes>
                  </AnimatePresence>
                </div>
              </Router>
              </BlogAnalyticsProvider>
            </AnalyticsProvider>
          </InquiryProvider>
        </DomainProvider>
      </VisitorProvider>
    </AuthProvider>
  );
}

export default App;
