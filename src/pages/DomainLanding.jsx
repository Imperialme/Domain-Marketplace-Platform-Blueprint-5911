import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useDomains } from '../context/DomainContext';
import { useInquiries } from '../context/InquiryContext';
import { useVisitor } from '../context/VisitorContext';
import {
  submitToNetlify,
  sendEmailNotifications,
} from '../services/emailService';

const {
  FiGlobe, FiShield, FiCheck, FiSend, FiClock, FiLock,
  FiMail, FiUser, FiDollarSign, FiAlertCircle, FiStar,
  FiPhone, FiArrowDown, FiZap,
} = FiIcons;

// Detect if being served from a custom/forwarded domain
const getDetectedDomain = () => {
  const h = window.location.hostname;
  if (
    h === 'localhost' || h === '127.0.0.1' ||
    h.includes('vercel.app') || h.includes('netlify.app') ||
    h.includes('netzone.me') || h.includes('shahid.me')
  ) return null;
  return h;
};

// Build Escrow.com checkout link for a domain at a specific price
const buildEscrowLink = (domainName, price) => {
  const params = new URLSearchParams({
    Type: 'domain_name',
    'Initiate[type]': 'domain_name_transfer',
    'Initiate[domain]': domainName,
    'Initiate[price]': price,
    'Initiate[currency]': 'USD',
  });
  return `https://www.escrow.com/checkout/new?${params.toString()}`;
};

const PAYMENT_METHODS = [
  {
    id: 'escrow',
    label: 'Escrow.com',
    icon: '🔐',
    tagline: 'Recommended · Most Secure',
    description: 'Funds held safely by Escrow.com until domain is transferred. Industry standard.',
    badge: 'RECOMMENDED',
    badgeColor: 'bg-green-100 text-green-700',
    border: 'border-green-400',
    bg: 'bg-green-50',
  },
  {
    id: 'paypal',
    label: 'PayPal',
    icon: '🅿️',
    tagline: 'Fast · Buyer Protection',
    description: 'Pay instantly via PayPal. Buyer protection included on eligible purchases.',
    badge: 'FAST',
    badgeColor: 'bg-blue-100 text-blue-700',
    border: 'border-blue-400',
    bg: 'bg-blue-50',
  },
  {
    id: 'crypto',
    label: 'Cryptocurrency',
    icon: '₿',
    tagline: 'BTC · ETH · USDT',
    description: 'Pay with Bitcoin, Ethereum, or USDT. Wallet address provided after agreement.',
    badge: 'CRYPTO',
    badgeColor: 'bg-orange-100 text-orange-700',
    border: 'border-orange-400',
    bg: 'bg-orange-50',
  },
];

const TrustBadge = ({ emoji, label }) => (
  <div className="flex flex-col items-center gap-1.5 min-w-0">
    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-lg">
      {emoji}
    </div>
    <span className="text-xs text-blue-100 font-medium text-center leading-tight">{label}</span>
  </div>
);

const DomainLanding = () => {
  const { domainName: paramDomainName } = useParams();
  const { getDomainByName } = useDomains();
  const { addInquiry } = useInquiries();
  const { startSession, trackPriceTyped, trackFormStarted, trackFormSubmitted, currentSession } = useVisitor();

  const detectedHostname = getDetectedDomain();
  const domain = detectedHostname
    ? (getDomainByName(detectedHostname) || getDomainByName(paramDomainName))
    : getDomainByName(paramDomainName);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', offerAmount: '', message: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('escrow');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [formTouched, setFormTouched] = useState(false);
  const priceDebounceRef = useRef(null);
  const formSectionRef = useRef(null);

  // One-time session start on mount
  const startSessionRef = useRef(startSession);
  startSessionRef.current = startSession;
  useEffect(() => {
    const name = domain?.domain_name || detectedHostname || paramDomainName;
    if (name) startSessionRef.current(name);
  }, []); // intentionally runs once

  const scrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));

    if (name === 'offerAmount') {
      clearTimeout(priceDebounceRef.current);
      priceDebounceRef.current = setTimeout(() => {
        const n = parseFloat(value);
        if (!isNaN(n) && n > 0) trackPriceTyped(n);
      }, 500);
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
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email';
    if (!formData.offerAmount || parseFloat(formData.offerAmount) <= 0)
      errs.offerAmount = 'Please enter your offer amount';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);

    const displayDomain = domain?.domain_name || detectedHostname || paramDomainName;
    const session = currentSession;

    const emailData = {
      domainName:     displayDomain,
      buyerName:      formData.name,
      buyerEmail:     formData.email,
      buyerPhone:     formData.phone,
      offerAmount:    parseFloat(formData.offerAmount),
      message:        formData.message,
      paymentMethod,
      country:        session?.countryName || session?.country,
      city:           session?.city,
      ip:             session?.ip,
      referrerSource: session?.referrerSource,
    };

    // Fire both channels in parallel — neither blocks the UI
    await Promise.allSettled([
      // 1. Netlify Forms: zero-config capture + email from Netlify
      submitToNetlify({
        domain_name:      displayDomain,
        buyer_name:       formData.name,
        buyer_email:      formData.email,
        buyer_phone:      formData.phone || '',
        offer_amount:     String(parseFloat(formData.offerAmount)),
        payment_method:   paymentMethod,
        message:          formData.message || '',
        visitor_country:  session?.countryName || '',
        visitor_city:     session?.city || '',
        visitor_ip:       session?.ip || '',
        visitor_source:   session?.referrerSource || 'Direct',
        visitor_device:   session?.device || '',
      }),
      // 2. Mailgun (via Netlify Function): admin notification + buyer confirmation
      sendEmailNotifications(emailData),
    ]);

    // Save to local admin panel regardless of email status
    const inquiry = addInquiry({
      domain_id:    domain?.id,
      domain_name:  displayDomain,
      name:         formData.name,
      email:        formData.email,
      phone:        formData.phone,
      offerAmount:  parseFloat(formData.offerAmount),
      message:      formData.message,
      paymentMethod,
      referrer:     document.referrer || 'Direct',
      userAgent:    navigator.userAgent,
    });

    trackFormSubmitted(inquiry.id);
    setSubmitting(false);
    setSubmitted(true);
  };

  // ─── Domain not in system (forwarded but not added yet) ───────────────────
  if (!domain) {
    const displayName = detectedHostname || paramDomainName || 'this domain';
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md w-full">
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🌐</div>
          <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">{displayName}</h1>
          <p className="text-slate-300 text-lg mb-2">This domain may be for sale.</p>
          <p className="text-slate-400 text-sm mb-8">Contact the owner to inquire about acquiring this domain.</p>
          <a href="mailto:mail@shahid.me"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-2xl font-semibold transition-colors text-sm shadow-lg shadow-blue-900/40">
            <SafeIcon icon={FiMail} className="h-4 w-4" />
            Contact the Owner
          </a>
        </motion.div>
      </div>
    );
  }

  const askingPrice = domain.price;
  const domainName = domain.domain_name;
  const escrowLink = buildEscrowLink(domainName, askingPrice);

  // ─── Success screen ────────────────────────────────────────────────────────
  if (submitted) {
    const pm = PAYMENT_METHODS.find(m => m.id === paymentMethod);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
            ✅
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Offer Received!</h2>
          <p className="text-gray-500 text-sm mb-6">
            We'll respond to <strong className="text-gray-800">{formData.email}</strong> within 24 hours.
          </p>

          <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Domain</span>
              <span className="font-semibold text-gray-900">{domainName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Your Offer</span>
              <span className="font-bold text-green-600 text-lg">${parseFloat(formData.offerAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Asking Price</span>
              <span className="text-gray-700">${askingPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment via</span>
              <span className="text-gray-700">{pm?.icon} {pm?.label}</span>
            </div>
          </div>

          {paymentMethod === 'escrow' && (
            <a href={escrowLink} target="_blank" rel="noopener noreferrer"
              className="block w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-2xl font-semibold text-sm transition-colors shadow-lg shadow-green-200 mb-3">
              🔐 Proceed to Escrow.com to Complete Purchase
            </a>
          )}
          <p className="text-xs text-gray-400">The seller will be in touch shortly to finalize details.</p>
        </motion.div>
      </div>
    );
  }

  // ─── Main landing page ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white text-center py-2.5 px-4 text-sm font-medium tracking-wide">
        🌐 <span className="font-bold">{domainName}</span> is available for purchase
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pt-16 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>

            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur border border-white/15 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-slate-200 font-medium">Premium Domain · Available Now</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-8xl font-black tracking-tight text-white mb-5 leading-none">
              {domainName}
            </h1>

            {domain.tagline && (
              <p className="text-slate-300 text-lg md:text-xl mb-10 max-w-xl mx-auto">{domain.tagline}</p>
            )}

            {/* Price + CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {/* Buy Now */}
              <a
                href={escrowLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 bg-white text-slate-900 hover:bg-slate-100 px-7 py-4 rounded-2xl font-bold text-base transition-all shadow-xl shadow-black/30"
              >
                <span className="text-xl">🔐</span>
                <div className="text-left">
                  <div className="text-xs text-slate-500 font-medium leading-none mb-0.5">BUY NOW via Escrow</div>
                  <div className="text-green-700 font-black text-lg leading-none">${askingPrice.toLocaleString()}</div>
                </div>
                <SafeIcon icon={FiArrowDown} className="h-4 w-4 text-slate-400 group-hover:translate-y-0.5 transition-transform rotate-[-90deg]" />
              </a>

              {/* Make Offer */}
              <button
                onClick={scrollToForm}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-4 rounded-2xl font-bold text-base transition-colors shadow-lg shadow-blue-900/40"
              >
                <SafeIcon icon={FiDollarSign} className="h-5 w-5" />
                Make an Offer
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
              <TrustBadge emoji="🔐" label="Escrow Protected" />
              <TrustBadge emoji="⚡" label="Fast Transfer" />
              <TrustBadge emoji="🕐" label="24h Response" />
              <TrustBadge emoji="✅" label="Verified Seller" />
              <TrustBadge emoji="🌍" label="Worldwide" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── PAYMENT OPTIONS ROW ──────────────────────────────────────────── */}
      <div className="bg-slate-50 border-y border-slate-200 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs text-slate-400 uppercase tracking-widest font-semibold mb-6">
            Accepted Payment Methods
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {PAYMENT_METHODS.map(pm => (
              <div key={pm.id} className={`bg-white rounded-2xl border-2 p-5 ${pm.border} shadow-sm`}>
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{pm.icon}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${pm.badgeColor}`}>{pm.badge}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{pm.label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{pm.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid lg:grid-cols-5 gap-10">

          {/* Left panel: domain details */}
          <motion.div className="lg:col-span-2 space-y-5"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Domain Details</h3>
              <dl className="space-y-3">
                {[
                  ['Domain Name', domainName],
                  ['Extension', '.' + domainName.split('.').slice(1).join('.')],
                  ['Asking Price', `$${askingPrice.toLocaleString()}`],
                  ['Availability', null],
                  ['Transfer', 'Full ownership'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                    <dt className="text-sm text-slate-500">{label}</dt>
                    {value === null
                      ? <dd className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />Available
                        </dd>
                      : <dd className="text-sm font-semibold text-slate-900">{value}</dd>
                    }
                  </div>
                ))}
              </dl>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">What's Included</h3>
              <ul className="space-y-2.5">
                {[
                  'Full ownership transfer',
                  'Clean domain history',
                  'Transfer support & guidance',
                  'Works with all registrars',
                  'SSL certificate ready',
                  'No hidden fees',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <SafeIcon icon={FiCheck} className="h-3 w-3 text-blue-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Direct Escrow CTA */}
            <a href={escrowLink} target="_blank" rel="noopener noreferrer"
              className="block bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white hover:from-green-700 hover:to-emerald-800 transition-all shadow-lg shadow-green-900/20">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🔐</span>
                <div>
                  <p className="font-bold text-sm">Buy via Escrow.com</p>
                  <p className="text-green-200 text-xs">Safest way to buy a domain</p>
                </div>
              </div>
              <p className="text-green-100 text-xs leading-relaxed">
                Escrow.com holds your payment securely until the domain is in your account.
                Industry-trusted for 25+ years.
              </p>
              <div className="mt-3 flex items-center gap-1 text-white text-xs font-semibold">
                Start Escrow Transaction →
              </div>
            </a>
          </motion.div>

          {/* Right panel: offer form */}
          <motion.div ref={formSectionRef} className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>

            <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
              {/* Form header */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
                <h2 className="text-xl font-bold text-white">Make Your Offer</h2>
                <p className="text-slate-300 text-sm mt-1">
                  Submit your offer for <span className="text-white font-semibold">{domainName}</span> — we'll respond within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {/* Name + Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <SafeIcon icon={FiUser} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input type="text" name="name" value={formData.name}
                        onChange={handleChange} onFocus={handleFocus}
                        placeholder="John Smith"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${errors.name ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50 focus:bg-white'}`} />
                    </div>
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <SafeIcon icon={FiMail} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input type="email" name="email" value={formData.email}
                        onChange={handleChange} onFocus={handleFocus}
                        placeholder="you@company.com"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all
                          focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${errors.email ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-slate-50 focus:bg-white'}`} />
                    </div>
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                    Phone <span className="text-slate-400 font-normal normal-case">(optional)</span>
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiPhone} className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="tel" name="phone" value={formData.phone}
                      onChange={handleChange} onFocus={handleFocus}
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 bg-slate-50 focus:bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
                  </div>
                </div>

                {/* Offer Amount ← this is the tracked field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                    Your Offer Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg select-none">$</span>
                    <input type="number" name="offerAmount" value={formData.offerAmount}
                      onChange={handleChange} onFocus={handleFocus}
                      min="1" step="1"
                      placeholder={Math.floor(askingPrice * 0.8).toLocaleString()}
                      className={`w-full pl-9 pr-4 py-4 border rounded-xl text-2xl font-bold outline-none transition-all
                        focus:ring-2 focus:ring-blue-500 focus:border-transparent
                        ${errors.offerAmount ? 'border-red-400 bg-red-50 text-red-900' : 'border-slate-300 bg-slate-50 focus:bg-white text-slate-900'}`} />
                  </div>
                  {errors.offerAmount
                    ? <p className="mt-1 text-xs text-red-500">{errors.offerAmount}</p>
                    : <p className="mt-1 text-xs text-slate-400">
                        Listed at <span className="font-semibold text-slate-600">${askingPrice.toLocaleString()}</span>.
                        Counter-offers are welcome.
                      </p>
                  }
                </div>

                {/* Payment Method Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                    Preferred Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PAYMENT_METHODS.map(pm => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center
                          ${paymentMethod === pm.id
                            ? `${pm.border} ${pm.bg} shadow-sm`
                            : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                      >
                        {paymentMethod === pm.id && (
                          <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <SafeIcon icon={FiCheck} className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <span className="text-xl">{pm.icon}</span>
                        <span className="text-xs font-semibold text-slate-800 leading-tight">{pm.label}</span>
                        <span className="text-xs text-slate-400 leading-tight">{pm.tagline}</span>
                      </button>
                    ))}
                  </div>
                  {paymentMethod === 'escrow' && (
                    <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs text-green-700">
                      <span>🔐</span>
                      Escrow.com holds funds safely until domain is in your account. Zero risk.
                    </div>
                  )}
                  {paymentMethod === 'paypal' && (
                    <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
                      <span>🅿️</span>
                      PayPal payment link will be sent to your email after offer is accepted.
                    </div>
                  )}
                  {paymentMethod === 'crypto' && (
                    <div className="mt-2 flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-700">
                      <span>₿</span>
                      Wallet address (BTC / ETH / USDT) provided after offer acceptance.
                    </div>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                    Message <span className="text-slate-400 font-normal normal-case">(optional)</span>
                  </label>
                  <textarea name="message" rows={3} value={formData.message}
                    onChange={handleChange} onFocus={handleFocus}
                    placeholder="What do you plan to use this domain for?"
                    className="w-full px-4 py-3 border border-slate-300 bg-slate-50 focus:bg-white rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none" />
                </div>

                {/* Submit */}
                <motion.button type="submit" disabled={submitting}
                  whileHover={{ scale: submitting ? 1 : 1.01 }}
                  whileTap={{ scale: submitting ? 1 : 0.99 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
                    text-white py-4 px-6 rounded-2xl font-bold text-base transition-all
                    disabled:opacity-60 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending Offer…
                    </>
                  ) : (
                    <>
                      <SafeIcon icon={FiSend} className="h-5 w-5" />
                      Submit My Offer for {domainName}
                    </>
                  )}
                </motion.button>

                <div className="flex items-center justify-center gap-5 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1"><SafeIcon icon={FiLock} className="h-3 w-3" /> SSL Encrypted</span>
                  <span className="flex items-center gap-1"><SafeIcon icon={FiShield} className="h-3 w-3" /> No Spam</span>
                  <span className="flex items-center gap-1"><SafeIcon icon={FiAlertCircle} className="h-3 w-3" /> No Obligation</span>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── FAQ / WHY SECTION ────────────────────────────────────────────── */}
      <div className="bg-slate-50 border-t border-slate-200 py-14 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Submit Your Offer', desc: 'Enter your name, email, and offer amount. Choose your preferred payment method.', icon: '📝' },
              { step: '2', title: 'We Review & Respond', desc: 'The seller reviews your offer and responds within 24 hours via email.', icon: '💬' },
              { step: '3', title: 'Secure Transfer', desc: 'Payment via Escrow.com, PayPal, or Crypto. Domain transferred immediately after confirmation.', icon: '🔐' },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="bg-white rounded-2xl p-6 border border-slate-200 text-center shadow-sm">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">{icon}</div>
                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">Step {step}</div>
                <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-white py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🌐</span>
            <span className="font-bold text-slate-200">{domainName}</span>
            <span className="text-slate-500 text-sm">is for sale</span>
          </div>
          <div className="text-slate-400 text-sm">
            Questions? <a href="mailto:mail@shahid.me" className="text-blue-400 hover:text-blue-300 font-medium">mail@shahid.me</a>
          </div>
          <p className="text-slate-600 text-xs">&copy; {new Date().getFullYear()} · Secure Domain Transfer</p>
        </div>
      </footer>
    </div>
  );
};

export default DomainLanding;
