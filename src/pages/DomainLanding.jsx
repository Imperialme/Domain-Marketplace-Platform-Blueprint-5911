import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDomains } from '../context/DomainContext';
import { useInquiries } from '../context/InquiryContext';
import { useVisitor } from '../context/VisitorContext';

const {
  FiGlobe, FiShield, FiCheck, FiSend, FiClock, FiLock,
  FiMail, FiUser, FiDollarSign, FiAlertCircle, FiStar,
  FiArrowRight, FiPhone,
} = FiIcons;

// Detect if this page is being served from a forwarded/custom domain
const getDetectedDomain = () => {
  const hostname = window.location.hostname;
  // If running locally or on the platform's own domain, don't use hostname detection
  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.includes('vercel.app') ||
    hostname.includes('netlify.app') ||
    hostname.includes('netzone.me') ||
    hostname.includes('shahid.me')
  ) {
    return null;
  }
  return hostname;
};

const TrustBadge = ({ icon, label }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
      <SafeIcon icon={icon} className="h-5 w-5 text-white" />
    </div>
    <span className="text-xs text-blue-100 font-medium text-center leading-tight">{label}</span>
  </div>
);

const InputField = ({ label, id, type = 'text', value, onChange, onFocus, placeholder, required, prefix, hint }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm select-none">
          {prefix}
        </span>
      )}
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder}
        required={required}
        className={`w-full ${prefix ? 'pl-8' : 'pl-4'} pr-4 py-3 border border-gray-300 rounded-xl text-sm
          focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none
          placeholder:text-gray-400`}
      />
    </div>
    {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
  </div>
);

const DomainLanding = () => {
  const { domainName: paramDomainName } = useParams();
  const { getDomainByName, domains } = useDomains();
  const { addInquiry } = useInquiries();
  const { startSession, trackPriceTyped, trackFormStarted, trackFormSubmitted } = useVisitor();

  // Determine which domain to show: forwarded hostname > URL param
  const detectedHostname = getDetectedDomain();
  const domain = detectedHostname
    ? (getDomainByName(detectedHostname) || getDomainByName(paramDomainName))
    : getDomainByName(paramDomainName);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', offerAmount: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const priceDebounceRef = useRef(null);
  const formRef = useRef(null);

  // Start visitor tracking once when page loads
  const startSessionRef = useRef(startSession);
  startSessionRef.current = startSession;
  useEffect(() => {
    const displayDomainName = domain?.domain_name || detectedHostname || paramDomainName;
    if (displayDomainName) {
      startSessionRef.current(displayDomainName);
    }
  }, []); // run once on mount

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'offerAmount') {
      clearTimeout(priceDebounceRef.current);
      priceDebounceRef.current = setTimeout(() => {
        const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
        if (!isNaN(numeric) && numeric > 0) {
          trackPriceTyped(numeric);
        }
      }, 600);
    }
  };

  const handleFocus = () => {
    if (!formTouched) {
      setFormTouched(true);
      trackFormStarted();
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email address';
    if (!formData.offerAmount || parseFloat(formData.offerAmount) <= 0) {
      errs.offerAmount = 'Please enter an offer amount';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));

    const inquiry = addInquiry({
      domain_id: domain?.id,
      domain_name: domain?.domain_name || detectedHostname || paramDomainName,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      offerAmount: parseFloat(formData.offerAmount),
      message: formData.message,
      referrer: document.referrer || 'Direct',
      userAgent: navigator.userAgent,
    });

    trackFormSubmitted(inquiry.id);
    setSubmitting(false);
    setSubmitted(true);
    setShowNotification(true);
  };

  // Domain not found fallback
  if (!domain) {
    const displayName = detectedHostname || paramDomainName || 'this domain';
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiGlobe} className="h-10 w-10 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">{displayName}</h1>
          <p className="text-blue-200 mb-2 text-lg">This domain may be for sale.</p>
          <p className="text-blue-300/70 text-sm mb-8">
            Contact us to inquire about acquiring this domain name.
          </p>
          <a
            href="mailto:mail@shahid.me"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            <SafeIcon icon={FiMail} className="h-4 w-4" />
            Contact Owner
          </a>
        </motion.div>
      </div>
    );
  }

  const askingPrice = domain.price;

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <SafeIcon icon={FiCheck} className="h-10 w-10 text-green-600" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offer Received!</h2>
          <p className="text-gray-600 mb-1">
            Your offer for <strong className="text-blue-600">{domain.domain_name}</strong> has been sent.
          </p>
          <p className="text-gray-500 text-sm mb-6">We'll respond to <strong>{formData.email}</strong> within 24 hours.</p>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Domain</span>
              <span className="font-medium text-gray-900">{domain.domain_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Your Offer</span>
              <span className="font-bold text-green-600">${parseFloat(formData.offerAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Asking Price</span>
              <span className="font-medium text-gray-900">${askingPrice.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top notification bar */}
      <div className="bg-blue-700 text-white text-center py-2 px-4 text-sm font-medium">
        🌐 This domain is for sale — make your offer below
      </div>

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-slate-900 via-blue-950 to-slate-800 text-white pt-12 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-blue-100 font-medium">Premium Domain Available</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-white drop-shadow-md">
              {domain.domain_name}
            </h1>

            {domain.tagline && (
              <p className="text-lg text-blue-200 mb-8 max-w-lg mx-auto">{domain.tagline}</p>
            )}

            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-6 py-3 mb-10">
              <SafeIcon icon={FiDollarSign} className="h-6 w-6 text-yellow-300" />
              <div className="text-left">
                <p className="text-xs text-blue-300 uppercase tracking-wide font-medium">Asking Price</p>
                <p className="text-2xl font-bold text-white">${askingPrice.toLocaleString()}</p>
              </div>
            </div>

            {/* Trust row */}
            <div className="flex items-center justify-center gap-8 mt-4">
              <TrustBadge icon={FiShield} label="Secure Transfer" />
              <TrustBadge icon={FiLock} label="Safe Escrow" />
              <TrustBadge icon={FiClock} label="24h Response" />
              <TrustBadge icon={FiStar} label="Verified Seller" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-5 gap-10">

          {/* Left: Domain info */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Domain Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Domain</span>
                  <span className="text-sm font-semibold text-gray-900">{domain.domain_name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Asking Price</span>
                  <span className="text-sm font-bold text-blue-600">${askingPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Available
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Category</span>
                  <span className="text-sm text-gray-700">Premium</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">What's Included</h3>
              <ul className="space-y-3">
                {[
                  'Full ownership & transfer',
                  'Clean domain history',
                  'Transfer assistance',
                  'SSL ready',
                  'No hidden fees',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <SafeIcon icon={FiCheck} className="h-3 w-3 text-blue-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-2">Need help?</h3>
              <p className="text-blue-100 text-sm mb-4">Our team is available to assist with your domain acquisition.</p>
              <a
                href="mailto:mail@shahid.me"
                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm px-4 py-2 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiMail} className="h-4 w-4" />
                Contact Us
              </a>
            </div>
          </motion.div>

          {/* Right: Offer Form */}
          <motion.div
            ref={formRef}
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Make Your Offer</h2>
                <p className="text-gray-500 text-sm">
                  Fill in your details and your offer for <strong>{domain.domain_name}</strong>.
                  We respond within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        placeholder="John Smith"
                        className={`w-full pl-9 pr-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onFocus={handleFocus}
                        placeholder="john@company.com"
                        className={`w-full pl-9 pr-4 py-3 border rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Phone (Optional)
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiPhone} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Offer Amount - the key tracked field */}
                <div>
                  <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your Offer <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-sm select-none">$</span>
                    <input
                      type="number"
                      id="offerAmount"
                      name="offerAmount"
                      value={formData.offerAmount}
                      onChange={handleChange}
                      onFocus={handleFocus}
                      placeholder={`e.g. ${Math.floor(askingPrice * 0.8).toLocaleString()}`}
                      min="1"
                      step="1"
                      className={`w-full pl-8 pr-4 py-3.5 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg ${errors.offerAmount ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    />
                  </div>
                  {errors.offerAmount
                    ? <p className="mt-1 text-xs text-red-500">{errors.offerAmount}</p>
                    : <p className="mt-1 text-xs text-gray-400">Asking price: ${askingPrice.toLocaleString()}. Counter-offers are welcome.</p>
                  }
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    value={formData.message}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    placeholder="Tell us about your intended use for this domain..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending Offer...
                    </>
                  ) : (
                    <>
                      <SafeIcon icon={FiSend} className="h-5 w-5" />
                      Submit My Offer
                    </>
                  )}
                </motion.button>

                <p className="text-center text-xs text-gray-400">
                  By submitting, you agree to be contacted regarding this domain. No spam — ever.
                </p>
              </form>
            </div>

            {/* Social proof */}
            <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <SafeIcon icon={FiShield} className="h-3.5 w-3.5 text-green-500" />
                SSL Secured
              </div>
              <div className="flex items-center gap-1.5">
                <SafeIcon icon={FiLock} className="h-3.5 w-3.5 text-blue-500" />
                Safe & Confidential
              </div>
              <div className="flex items-center gap-1.5">
                <SafeIcon icon={FiAlertCircle} className="h-3.5 w-3.5 text-yellow-500" />
                No Commitment
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 px-4 mt-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SafeIcon icon={FiGlobe} className="h-5 w-5 text-blue-400" />
            <span className="font-semibold">Domain Marketplace</span>
          </div>
          <div className="text-gray-400 text-sm text-center">
            Interested in {domain.domain_name}? Contact us at{' '}
            <a href="mailto:mail@shahid.me" className="text-blue-400 hover:text-blue-300">mail@shahid.me</a>
          </div>
          <p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default DomainLanding;
