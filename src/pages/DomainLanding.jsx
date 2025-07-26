import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDomains } from '../context/DomainContext';
import { useInquiries } from '../context/InquiryContext';
import InquiryForm from '../components/InquiryForm';

const { FiGlobe, FiCheck, FiDollarSign, FiMail, FiShield } = FiIcons;

const DomainLanding = () => {
  const { domainName } = useParams();
  const { getDomainByName } = useDomains();
  const domain = getDomainByName(domainName);

  const getThemeColors = (variant) => {
    const themes = {
      1: { bg: 'from-blue-600 to-purple-700', accent: 'blue' },
      2: { bg: 'from-green-600 to-teal-700', accent: 'green' },
      3: { bg: 'from-orange-600 to-red-700', accent: 'orange' },
      default: { bg: 'from-primary-600 to-primary-700', accent: 'primary' }
    };
    return themes[variant] || themes.default;
  };

  if (!domain) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <SafeIcon icon={FiGlobe} className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Domain Not Found</h1>
          <p className="text-gray-600 mb-4">The domain you're looking for doesn't exist.</p>
          <Link to="/" className="text-primary-600 hover:text-primary-700">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const theme = getThemeColors(domain.theme_variant);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-md border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <SafeIcon icon={FiGlobe} className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Netzone</span>
            </Link>
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiShield} className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Verified Domain</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className={`bg-gradient-to-r ${theme.bg} text-white py-20`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <SafeIcon icon={FiGlobe} className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              {domain.domain_name}
            </h1>
            <p className="text-xl lg:text-2xl opacity-90 mb-8">
              {domain.tagline}
            </p>
            <div className="flex items-center justify-center space-x-8 text-lg">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiDollarSign} className="h-6 w-6" />
                <span className="font-semibold">${domain.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiCheck} className="h-6 w-6" />
                <span>Verified & Ready</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Domain Info */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Domain Details</h2>
              
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Domain Name</span>
                    <span className="font-semibold text-gray-900">{domain.domain_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price</span>
                    <span className="font-bold text-2xl text-primary-600">
                      ${domain.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status</span>
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      {domain.status === 'active' ? 'Available' : domain.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nameservers</span>
                    <div className="text-right">
                      {domain.nameservers.map((ns, index) => (
                        <div key={index} className="text-sm text-gray-700">{ns}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Included</h3>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <SafeIcon icon={FiCheck} className="h-5 w-5 text-green-600" />
                    <span>Full ownership transfer</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <SafeIcon icon={FiCheck} className="h-5 w-5 text-green-600" />
                    <span>Professional transfer assistance</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <SafeIcon icon={FiCheck} className="h-5 w-5 text-green-600" />
                    <span>SSL certificate ready</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <SafeIcon icon={FiCheck} className="h-5 w-5 text-green-600" />
                    <span>Clean history verification</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Inquiry Form */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-6">
                  <SafeIcon icon={FiMail} className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Interested in this domain?</h3>
                  <p className="text-gray-600">Get in touch and we'll help you acquire it.</p>
                </div>
                
                <InquiryForm domain={domain} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <SafeIcon icon={FiGlobe} className="h-6 w-6" />
              <span className="text-xl font-bold">Netzone</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>contact@netzone.me | +1 (555) 123-4567</p>
              <p className="text-sm mt-1">&copy; 2024 Netzone. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DomainLanding;