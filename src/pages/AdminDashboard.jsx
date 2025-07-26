import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDomains } from '../context/DomainContext';
import { useInquiries } from '../context/InquiryContext';
import AdminLayout from '../components/AdminLayout';

const { FiGlobe, FiMail, FiDollarSign, FiTrendingUp, FiPlus, FiEye } = FiIcons;

const AdminDashboard = () => {
  const { domains } = useDomains();
  const { inquiries } = useInquiries();

  const stats = {
    totalDomains: domains.length,
    activeDomains: domains.filter(d => d.status === 'active').length,
    soldDomains: domains.filter(d => d.status === 'sold').length,
    totalInquiries: inquiries.length,
    newInquiries: inquiries.filter(i => i.status === 'new').length,
    totalValue: domains.reduce((sum, d) => sum + d.price, 0)
  };

  const recentInquiries = inquiries.slice(-5).reverse();

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Overview of your domain marketplace</p>
          </div>
          <Link
            to="/admin/domains"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="h-5 w-5" />
            <span>Add Domain</span>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Domains</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDomains}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <SafeIcon icon={FiGlobe} className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Domains</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeDomains}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <SafeIcon icon={FiTrendingUp} className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Inquiries</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalInquiries}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <SafeIcon icon={FiMail} className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${stats.totalValue.toLocaleString()}
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <SafeIcon icon={FiDollarSign} className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Inquiries */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Recent Inquiries</h3>
                <Link
                  to="/admin/inquiries"
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>
            </div>
            <div className="p-6">
              {recentInquiries.length > 0 ? (
                <div className="space-y-4">
                  {recentInquiries.map((inquiry) => (
                    <div key={inquiry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{inquiry.name}</p>
                        <p className="text-sm text-gray-600">{inquiry.domain_name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(inquiry.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          inquiry.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          inquiry.status === 'replied' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {inquiry.status}
                        </span>
                        <Link
                          to="/admin/inquiries"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <SafeIcon icon={FiEye} className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <SafeIcon icon={FiMail} className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No inquiries yet</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Domain Status Overview */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Domain Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active</span>
                  <span className="font-semibold text-green-600">{stats.activeDomains}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Pending Verification</span>
                  <span className="font-semibold text-yellow-600">
                    {domains.filter(d => d.status === 'pending_verification').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sold</span>
                  <span className="font-semibold text-blue-600">{stats.soldDomains}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Archived</span>
                  <span className="font-semibold text-gray-600">
                    {domains.filter(d => d.status === 'archived').length}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;