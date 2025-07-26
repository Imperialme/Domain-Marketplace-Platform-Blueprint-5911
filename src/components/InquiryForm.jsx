import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useInquiries } from '../context/InquiryContext';

const { FiSend, FiCheck } = FiIcons;

const InquiryForm = ({ domain }) => {
  const { addInquiry } = useInquiries();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    budget: '',
    reseller: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      addInquiry({
        domain_id: domain.id,
        domain_name: domain.domain_name,
        ...formData
      });

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center py-8"
      >
        <SafeIcon icon={FiCheck} className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-600 mb-4">
          Your inquiry for <strong>{domain.domain_name}</strong> has been submitted.
        </p>
        <p className="text-sm text-gray-500">
          We'll respond to your inquiry within 24 hours.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Your full name"
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
          Budget Range
        </label>
        <select
          id="budget"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        >
          <option value="">Select your budget range</option>
          <option value="under-5k">Under $5,000</option>
          <option value="5k-10k">$5,000 - $10,000</option>
          <option value="10k-25k">$10,000 - $25,000</option>
          <option value="25k-50k">$25,000 - $50,000</option>
          <option value="50k-plus">$50,000+</option>
          <option value="asking-price">Asking Price: ${domain.price.toLocaleString()}</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
          placeholder="Tell us about your interest in this domain..."
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="reseller"
          name="reseller"
          checked={formData.reseller}
          onChange={handleChange}
          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label htmlFor="reseller" className="ml-2 block text-sm text-gray-700">
          I am a domain reseller/broker
        </label>
      </div>

      <motion.button
        type="submit"
        disabled={isSubmitting}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Submitting...</span>
          </>
        ) : (
          <>
            <SafeIcon icon={FiSend} className="h-5 w-5" />
            <span>Send Inquiry</span>
          </>
        )}
      </motion.button>

      <p className="text-xs text-gray-500 text-center">
        By submitting this form, you agree to be contacted regarding this domain inquiry.
      </p>
    </form>
  );
};

export default InquiryForm;