import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDomains } from '../context/DomainContext';

const { FiX, FiPlus } = FiIcons;

const AddDomainModal = ({ isOpen, onClose }) => {
  const { addDomain } = useDomains();
  const [formData, setFormData] = useState({
    domain_name: '',
    nameservers: ['', ''],
    price: '',
    tagline: '',
    theme_variant: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('nameserver_')) {
      const index = parseInt(name.split('_')[1]);
      const newNameservers = [...formData.nameservers];
      newNameservers[index] = value;
      setFormData(prev => ({ ...prev, nameservers: newNameservers }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      addDomain({
        ...formData,
        price: parseFloat(formData.price),
        nameservers: formData.nameservers.filter(ns => ns.trim() !== '')
      });

      // Reset form
      setFormData({
        domain_name: '',
        nameservers: ['', ''],
        price: '',
        tagline: '',
        theme_variant: 1
      });

      onClose();
    } catch (error) {
      console.error('Error adding domain:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Add New Domain</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <SafeIcon icon={FiX} className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="domain_name" className="block text-sm font-medium text-gray-700 mb-2">
                Domain Name *
              </label>
              <input
                type="text"
                id="domain_name"
                name="domain_name"
                required
                value={formData.domain_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="example.com"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nameserver_0" className="block text-sm font-medium text-gray-700 mb-2">
                  Nameserver 1
                </label>
                <input
                  type="text"
                  id="nameserver_0"
                  name="nameserver_0"
                  value={formData.nameservers[0]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="ns1.netzone.me"
                />
              </div>
              <div>
                <label htmlFor="nameserver_1" className="block text-sm font-medium text-gray-700 mb-2">
                  Nameserver 2
                </label>
                <input
                  type="text"
                  id="nameserver_1"
                  name="nameserver_1"
                  value={formData.nameservers[1]}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="ns2.netzone.me"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="10000"
                />
              </div>
              <div>
                <label htmlFor="theme_variant" className="block text-sm font-medium text-gray-700 mb-2">
                  Theme Variant
                </label>
                <select
                  id="theme_variant"
                  name="theme_variant"
                  value={formData.theme_variant}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value={1}>Theme 1 (Blue/Purple)</option>
                  <option value={2}>Theme 2 (Green/Teal)</option>
                  <option value={3}>Theme 3 (Orange/Red)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="tagline" className="block text-sm font-medium text-gray-700 mb-2">
                Tagline
              </label>
              <input
                type="text"
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Perfect for your next venture"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <SafeIcon icon={FiPlus} className="h-5 w-5" />
                    <span>Add Domain</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddDomainModal;