import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useInquiries } from '../context/InquiryContext';
import { useDomains } from '../context/DomainContext';
import AdminLayout from '../components/AdminLayout';

const { FiMail, FiUser, FiDollarSign, FiCalendar, FiDownload } = FiIcons;

const InquiryManager = () => {
  const { inquiries, updateInquiry } = useInquiries();
  const { domains } = useDomains();
  const [filter, setFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const filteredInquiries = inquiries.filter(inquiry => {
    if (filter === 'all') return true;
    return inquiry.status === filter;
  });

  const getDomainName = (domainId) => {
    const domain = domains.find(d => d.id === domainId);
    return domain ? domain.domain_name : 'Unknown Domain';
  };

  const handleStatusChange = (inquiryId, newStatus) => {
    updateInquiry(inquiryId, { status: newStatus });
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Domain', 'Name', 'Email', 'Budget', 'Reseller', 'Status', 'Message'];
    const csvContent = [
      headers.join(','),
      ...inquiries.map(inquiry => [
        new Date(inquiry.created_at).toLocaleDateString(),
        getDomainName(inquiry.domain_id),
        inquiry.name,
        inquiry.email,
        inquiry.budget || 'Not specified',
        inquiry.reseller ? 'Yes' : 'No',
        inquiry.status,
        `"${inquiry.message.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inquiries.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inquiry Manager</h1>
            <p className="text-gray-600">Manage domain inquiries and leads</p>
          </div>
          <button
            onClick={exportToCSV}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <SafeIcon icon={FiDownload} className="h-5 w-5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'new', 'replied', 'negotiating', 'closed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All Inquiries' : status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-2 text-xs">
                  ({status === 'all' ? inquiries.length : inquiries.filter(i => i.status === status).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Inquiries List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {filteredInquiries.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredInquiries.map((inquiry, index) => (
                <motion.div
                  key={inquiry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedInquiry(inquiry)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{inquiry.name}</h3>
                        <span className="text-sm text-gray-500">{inquiry.email}</span>
                        {inquiry.reseller && (
                          <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                            Reseller
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center space-x-1">
                          <SafeIcon icon={FiMail} className="h-4 w-4" />
                          <span>{getDomainName(inquiry.domain_id)}</span>
                        </div>
                        {inquiry.budget && (
                          <div className="flex items-center space-x-1">
                            <SafeIcon icon={FiDollarSign} className="h-4 w-4" />
                            <span>{inquiry.budget}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <SafeIcon icon={FiCalendar} className="h-4 w-4" />
                          <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 line-clamp-2">{inquiry.message}</p>
                    </div>
                    
                    <div className="ml-4">
                      <select
                        value={inquiry.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(inquiry.id, e.target.value);
                        }}
                        className={`px-3 py-1 rounded-full text-sm font-medium border-0 ${
                          inquiry.status === 'new' ? 'bg-blue-100 text-blue-800' :
                          inquiry.status === 'replied' ? 'bg-green-100 text-green-800' :
                          inquiry.status === 'negotiating' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="replied">Replied</option>
                        <option value="negotiating">Negotiating</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiMail} className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No inquiries found</p>
            </div>
          )}
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Inquiry Details</h2>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-gray-900">{selectedInquiry.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedInquiry.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                  <p className="text-gray-900">{getDomainName(selectedInquiry.domain_id)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                  <p className="text-gray-900">{selectedInquiry.budget || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <p className="text-gray-900">{new Date(selectedInquiry.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-gray-900">{selectedInquiry.reseller ? 'Reseller' : 'End User'}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedInquiry.message}</p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedInquiry.email}?subject=Re: ${getDomainName(selectedInquiry.domain_id)} Inquiry`}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Reply via Email
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AdminLayout>
  );
};

export default InquiryManager;