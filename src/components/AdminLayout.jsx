import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDomains } from '../context/DomainContext';
import { useInquiries } from '../context/InquiryContext';
import { useAuth } from '../context/AuthContext';

const {
  FiGlobe, FiHome, FiSettings, FiMail, FiMenu, FiX,
  FiBarChart3, FiUsers, FiLogOut, FiExternalLink, FiChevronRight, FiTarget,
} = FiIcons;

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { domains } = useDomains();
  const { inquiries } = useInquiries();
  const { user, logout } = useAuth();

  const activeDomains = domains.filter(d => d.status !== 'deleted').length;
  const newInquiries = inquiries.filter(i => i.status === 'new').length;
  const previewDomain = domains.find(d => d.status === 'active')?.domain_name || null;

  const nav = [
    { name: 'Dashboard',  href: '/admin',               icon: FiHome },
    { name: 'Domains',    href: '/admin/domains',        icon: FiGlobe,    badge: activeDomains || null },
    { name: 'Inquiries',  href: '/admin/inquiries',      icon: FiMail,     badge: newInquiries || null, badgeColor: 'bg-blue-500' },
    { name: 'Visitors',   href: '/admin/visitors',       icon: FiUsers },
    { name: 'Analytics',  href: '/admin/analytics',      icon: FiBarChart3 },
    { name: 'Drop Catcher', href: '/admin/dropcatcher',  icon: FiTarget },
    { name: 'Settings',   href: '/admin/settings',       icon: FiSettings },
  ];

  const isActive = (href) =>
    href === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(href);

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/8">
        <Link to="/browse" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <svg viewBox="0 0 36 36" width="28" height="28" fill="none">
            <circle cx="18" cy="18" r="16" stroke="#60a5fa" strokeWidth="1.8"/>
            <ellipse cx="18" cy="18" rx="7" ry="16" stroke="#60a5fa" strokeWidth="1.4"/>
            <line x1="2" y1="18" x2="34" y2="18" stroke="#60a5fa" strokeWidth="1.4"/>
          </svg>
          <span className="font-extrabold text-base tracking-tight">
            Net<span className="text-blue-400">Zone</span>
            <span className="text-slate-500 font-normal ml-1.5 text-xs">Admin</span>
          </span>
        </Link>
        <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
          <SafeIcon icon={FiX} className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {nav.map(item => (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all group ${
              isActive(item.href)
                ? 'bg-blue-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-white/8'
            }`}
          >
            <div className="flex items-center gap-3">
              <SafeIcon icon={item.icon} className="h-4.5 w-4.5 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
              <span>{item.name}</span>
            </div>
            {item.badge != null && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isActive(item.href)
                  ? 'bg-white/20 text-white'
                  : (item.badgeColor || 'bg-slate-700 text-slate-300')
              } ${item.badgeColor && !isActive(item.href) ? 'text-white' : ''}`}>
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-5 pt-3 border-t border-white/8 space-y-1">
        {previewDomain && (
          <Link
            to={`/domain/${previewDomain}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/8 transition-all"
          >
            <SafeIcon icon={FiExternalLink} className="h-4 w-4 flex-shrink-0" />
            <span>View Public Site</span>
          </Link>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <SafeIcon icon={FiLogOut} className="h-4 w-4 flex-shrink-0" />
          <span>Sign Out</span>
        </button>
        <div className="px-3 pt-3 mt-1 border-t border-white/8">
          <p className="text-xs text-slate-600 truncate">{user?.email}</p>
          <p className="text-xs text-blue-500 font-semibold uppercase tracking-wider mt-0.5">Admin</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 lg:z-50">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 z-50 flex flex-col lg:hidden transform transition-transform duration-200 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-56 flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-800 p-1 rounded-lg hover:bg-gray-100">
            <SafeIcon icon={FiMenu} className="h-5 w-5" />
          </button>
          <div className="flex-1" />
          {previewDomain && (
            <a
              href={`/#/domain/${previewDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 font-medium transition-colors"
            >
              <SafeIcon icon={FiExternalLink} className="h-3.5 w-3.5" />
              View Landing Page
            </a>
          )}
          <Link to="/browse"
            className="hidden sm:flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors">
            <SafeIcon icon={FiGlobe} className="h-3.5 w-3.5" />
            Public Site
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 xl:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
