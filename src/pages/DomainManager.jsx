import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDomains } from '../context/DomainContext';
import AdminLayout from '../components/AdminLayout';
import AddDomainModal from '../components/AddDomainModal';

const { FiPlus, FiEdit, FiTrash2, FiEye, FiCheck, FiClock, FiX } = FiIcons;

const DomainManager = () => {
  const { domains, updateDomain, deleteDomain } = useDomains();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState('all');

  const filteredDomains = domains.filter(domain => {
    if (filter === 'all') return true;
    return domain.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return FiCheck;
      case 'pending_verification': return FiClock;
      case 'sold': return FiCheck;
      case 'archived': return FiX;
      default: return FiClock;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending_verification': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (domainId, newStatus) => {
    updateDomain(domainId, { status: newStatus });
  };

  const handleDelete = (domainId) => {
    if (window.confirm('Are you sure you want to delete this domain?')) {
      deleteDomain(domainId);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Domain Manager</h1>
            <p className="text-gray-600">Manage your domain portfolio</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiPlus} className="h-5 w-5" />
            <span>Add Domain</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'active', 'pending_verification', 'sold', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Domains' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                <span className="ml-2 text-xs">
                  ({status === 'all' ? domains.length : domains.filter(d => d.status === status).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Domains Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Domain</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Price</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Theme</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Created</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {filteredDomains.map((domain, index) => (
                    <motion.tr
                      key={domain.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900">{domain.domain_name}</div>
                          <div className="text-sm text-gray-500">{domain.tagline}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={domain.status}
                          onChange={(e) => handleStatusChange(domain.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${getStatusColor(domain.status)}`}
                        >
                          <option value="pending_verification">Pending Verification</option>
                          <option value="active">Active</option>
                          <option value="sold">Sold</option>
                          <option value="archived">Archived</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 font-medium text-gray-900">
                        ${domain.price.toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">Theme {domain.theme_variant}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-500">
                        {new Date(domain.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end space-x-2">
                          <a
                            href={`/#/domain/${domain.domain_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600"
                            title="View Domain"
                          >
                            <SafeIcon icon={FiEye} className="h-4 w-4" />
                          </a>
                          <button
                            className="text-gray-400 hover:text-gray-600"
                            title="Edit Domain"
                          >
                            <SafeIcon icon={FiEdit} className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(domain.id)}
                            className="text-gray-400 hover:text-red-600"
                            title="Delete Domain"
                          >
                            <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {filteredDomains.length === 0 && (
            <div className="text-center py-12">
              <SafeIcon icon={FiGlobe} className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No domains found</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Domain Modal */}
      <AddDomainModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </AdminLayout>
  );
};

export default DomainManager;