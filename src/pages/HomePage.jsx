import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDomains } from '../context/DomainContext';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/auth/LoginModal';
import RegisterModal from '../components/auth/RegisterModal';
import UserMenu from '../components/UserMenu';

const { FiGlobe, FiSearch, FiShield, FiTrendingUp, FiArrowRight, FiStar, FiUser } = FiIcons;

const HomePage = () => {
  const { domains } = useDomains();
  const { isAuthenticated } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const activeDomains = domains.filter(domain => domain.status === 'active');

  const handleSwitchToRegister = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  const handleSwitchToLogin = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiGlobe} className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Netzone</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="#domains" className="text-gray-600 hover:text-primary-600 transition-colors">
                Domains
              </Link>
              <Link to="#about" className="text-gray-600 hover:text-primary-600 transition-colors">
                About
              </Link>
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </nav>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <SafeIcon icon={FiUser} className="h-6 w-6" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6"
            >
              Premium Domain
              <span className="text-primary-600 block">Marketplace</span>
            </motion.h1>
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Discover and acquire premium domains for your next venture. Each domain is carefully curated and verified for authenticity.
            </motion.p>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                to="#domains"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
              >
                <SafeIcon icon={FiSearch} className="h-5 w-5" />
                <span>Browse Domains</span>
              </Link>
              <Link
                to="#about"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Netzone?</h2>
            <p className="text-xl text-gray-600">Professional domain marketplace with verified listings</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="text-center p-6"
            >
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiShield} className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Verified Domains</h3>
              <p className="text-gray-600">All domains are verified and authenticated before listing</p>
            </motion.div>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center p-6"
            >
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiTrendingUp} className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Premium Quality</h3>
              <p className="text-gray-600">Curated selection of high-value domain names</p>
            </motion.div>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center p-6"
            >
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <SafeIcon icon={FiStar} className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-gray-600">Professional assistance throughout the acquisition process</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Domains Section */}
      <section id="domains" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Domains</h2>
            <p className="text-xl text-gray-600">Explore our premium domain collection</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeDomains.slice(0, 6).map((domain, index) => (
              <motion.div
                key={domain.id}
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <SafeIcon icon={FiGlobe} className="h-8 w-8 text-primary-600" />
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Verified
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{domain.domain_name}</h3>
                <p className="text-gray-600 mb-4">{domain.tagline}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary-600">
                    ${domain.price.toLocaleString()}
                  </span>
                  <Link
                    to={`/domain/${domain.domain_name}`}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1"
                  >
                    <span>View</span>
                    <SafeIcon icon={FiArrowRight} className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <SafeIcon icon={FiGlobe} className="h-6 w-6" />
                <span className="text-xl font-bold">Netzone</span>
              </div>
              <p className="text-gray-400">Premium domain marketplace for your next venture.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Marketplace</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#domains" className="hover:text-white transition-colors">Browse Domains</Link></li>
                <li><Link to="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="#verification" className="hover:text-white transition-colors">Verification</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="#contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="#faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="#help" className="hover:text-white transition-colors">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="text-gray-400 space-y-2">
                <p>contact@netzone.me</p>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Netzone. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modals */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </div>
  );
};

export default HomePage;