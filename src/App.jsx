import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestProvider } from '@questlabs/react-sdk';
import '@questlabs/react-sdk/dist/style.css';

import HomePage from './pages/HomePage';
import DomainLanding from './pages/DomainLanding';
import AdminDashboard from './pages/AdminDashboard';
import DomainManager from './pages/DomainManager';
import InquiryManager from './pages/InquiryManager';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import { DomainProvider } from './context/DomainContext';
import { InquiryProvider } from './context/InquiryContext';
import { AnalyticsProvider } from './context/AnalyticsContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import HelpHub from './components/HelpHub';
import questConfig from './config/questConfig';

function App() {
  return (
    <QuestProvider
      apiKey={questConfig.APIKEY}
      entityId={questConfig.ENTITYID}
      apiType="PRODUCTION"
    >
      <AuthProvider>
        <DomainProvider>
          <InquiryProvider>
            <AnalyticsProvider>
              <Router>
                <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/domain/:domainName" element={<DomainLanding />} />
                      <Route 
                        path="/profile" 
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin" 
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminDashboard />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/domains" 
                        element={
                          <ProtectedRoute requireAdmin>
                            <DomainManager />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/inquiries" 
                        element={
                          <ProtectedRoute requireAdmin>
                            <InquiryManager />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/analytics" 
                        element={
                          <ProtectedRoute requireAdmin>
                            <Analytics />
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                  </AnimatePresence>
                  <HelpHub />
                </div>
              </Router>
            </AnalyticsProvider>
          </InquiryProvider>
        </DomainProvider>
      </AuthProvider>
    </QuestProvider>
  );
}

export default App;