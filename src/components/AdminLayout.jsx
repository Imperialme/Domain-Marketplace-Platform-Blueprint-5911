import React from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDomains } from '../context/DomainContext';
import { useAuth } from '../context/AuthContext';

const { FiGlobe, FiHome, FiSettings, FiMail, FiMenu, FiX, FiBarChart3, FiUsers, FiLogOut } = FiIcons;

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { domains } = useDomains();
  const { logout } = useAuth();
  const previewDomain = domains.find(d => d.status === 'active')?.domain_name || 'preview';

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: FiHome },
    { name: 'Domains', href: '/admin/domains', icon: FiGlobe },
    { name: 'Inquiries', href: '/admin/inquiries', icon: FiMail },
    { name: 'Visitors', href: '/admin/visitors', icon: FiUsers },
    { name: 'Analytics', href: '/admin/analytics', icon: FiBarChart3 },
    { name: 'Settings', href: '/admin/settings', icon: FiSettings },
  ];

  const isActive = (href) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link to="/browse" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <SafeIcon icon={FiGlobe} className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">Netzone Admin</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <SafeIcon icon={FiX} className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <SafeIcon icon={item.icon} className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <SafeIcon icon={FiMenu} className="h-6 w-6" />
            </button>
            <div className="flex items-center space-x-3">
              <Link
                to={`/domain/${previewDomain}`}
                className="text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Preview Landing
              </Link>
              <button onClick={logout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                title="Sign out">
                <SafeIcon icon={FiLogOut} className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;