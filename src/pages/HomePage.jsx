import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCars, CAR_MAKES, UAE_CITIES } from '../context/CarContext';
import { useAuth } from '../context/AuthContext';
import CarCard from '../components/CarCard';
import LoginModal from '../components/auth/LoginModal';
import UserMenu from '../components/UserMenu';

const {
  FiSearch, FiMapPin, FiPlus, FiArrowRight, FiShield, FiCheckCircle, FiTrendingUp,
  FiUser, FiChevronDown, FiExternalLink
} = FiIcons;

const MAKE_ICONS = {
  Toyota: '🚙', BMW: '🏎️', Nissan: '🚗', Mercedes: '⭐', Lexus: '💎',
  Honda: '🔵', Ford: '🔴', Chevrolet: '⚡', Kia: '🌟', Hyundai: '✨',
  'Range Rover': '🦁', Mitsubishi: '⛰️', Volkswagen: '🐲', Suzuki: '🌈'
};

const POPULAR_MAKES = ['Toyota', 'BMW', 'Nissan', 'Mercedes-Benz', 'Lexus', 'Honda', 'Chevrolet', 'Ford'];

const HomePage = () => {
  const { activeCars } = useCars();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [searchMake, setSearchMake] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchMake) params.set('make', searchMake);
    if (searchLocation) params.set('location', searchLocation);
    if (searchQuery) params.set('q', searchQuery);
    navigate(`/browse?${params.toString()}`);
  };

  const featured = activeCars.slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-1">
              <span className="text-2xl font-black text-primary-600">cars</span>
              <span className="text-2xl font-black text-gray-900">.me</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/browse" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">Browse Cars</Link>
              <Link to="/post" className="text-gray-600 hover:text-primary-600 transition-colors font-medium">Post Free Ad</Link>
              <a href="https://spareparts.me" target="_blank" rel="noopener noreferrer"
                className="text-blue-700 hover:text-blue-800 transition-colors font-medium flex items-center space-x-1">
                <span>Spare Parts</span>
                <SafeIcon icon={FiExternalLink} className="h-3.5 w-3.5" />
              </a>
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                >
                  Admin Login
                </button>
              )}
            </nav>
            <div className="md:hidden flex items-center space-x-3">
              <Link to="/post"
                className="bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                Post Ad
              </Link>
              {isAuthenticated && <UserMenu />}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-primary-900 text-white py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-4xl lg:text-6xl font-black mb-4">
              Buy & Sell Cars<br />
              <span className="text-primary-400">Free in UAE</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Post your car ad for free. {activeCars.length}+ active listings across Dubai, Abu Dhabi, Sharjah and all UAE.
            </p>
          </motion.div>

          {/* Search box */}
          <motion.form
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            onSubmit={handleSearch}
            className="bg-white rounded-2xl p-3 flex flex-col md:flex-row gap-2 shadow-2xl"
          >
            <div className="flex-1 relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search make, model..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-3 text-gray-900 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="relative md:w-40">
              <SafeIcon icon={FiChevronDown} className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={searchMake}
                onChange={e => setSearchMake(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-3 text-gray-700 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">All Makes</option>
                {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="relative md:w-40">
              <SafeIcon icon={FiMapPin} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={searchLocation}
                onChange={e => setSearchLocation(e.target.value)}
                className="w-full appearance-none pl-9 pr-3 py-3 text-gray-700 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="">All UAE</option>
                {UAE_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button
              type="submit"
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
            >
              Search Cars
            </button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 flex flex-wrap justify-center gap-3"
          >
            {['Toyota', 'BMW', 'Nissan', 'Mercedes-Benz', 'Lexus'].map(make => (
              <Link
                key={make}
                to={`/browse?make=${make}`}
                className="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-1.5 rounded-full transition-colors border border-white/20"
              >
                {make}
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-primary-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <span className="font-black text-2xl">{activeCars.length}+</span>
              <p className="text-primary-100 text-sm">Active Listings</p>
            </div>
            <div>
              <span className="font-black text-2xl">100%</span>
              <p className="text-primary-100 text-sm">Free to Post</p>
            </div>
            <div>
              <span className="font-black text-2xl">7</span>
              <p className="text-primary-100 text-sm">Emirates Covered</p>
            </div>
            <div>
              <span className="font-black text-2xl">20+</span>
              <p className="text-primary-100 text-sm">Car Brands</p>
            </div>
          </div>
        </div>
      </div>

      {/* Browse by make */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browse by Brand</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {POPULAR_MAKES.map((make) => {
              const count = activeCars.filter(c => c.make === make).length;
              return (
                <Link
                  key={make}
                  to={`/browse?make=${make}`}
                  className="flex flex-col items-center p-3 bg-gray-50 hover:bg-primary-50 hover:border-primary-200 border border-gray-100 rounded-xl transition-all group"
                >
                  <span className="text-2xl mb-1">{MAKE_ICONS[make] || '🚗'}</span>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-primary-700 text-center leading-tight">{make}</span>
                  {count > 0 && <span className="text-xs text-gray-400 mt-0.5">{count}</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest Listings</h2>
            <Link to="/browse" className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium">
              <span>View All</span>
              <SafeIcon icon={FiArrowRight} className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((car, i) => (
              <CarCard key={car.id} car={car} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Spare Parts Banner */}
      <section className="py-12 bg-gradient-to-r from-blue-900 to-blue-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-wide mb-1">Our Partner</p>
              <h2 className="text-3xl font-black mb-2">Need Car Parts?</h2>
              <p className="text-blue-100 text-lg max-w-md">
                Genuine spare parts for all makes — BMW, Toyota, Honda, Nissan & more. Worldwide shipping from Dubai.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://spareparts.me/store"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-white text-blue-900 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
              >
                <span>Browse Parts</span>
                <SafeIcon icon={FiExternalLink} className="h-4 w-4" />
              </a>
              <a
                href="https://spareparts.me/contact-us"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-500 transition-colors border border-blue-500"
              >
                <span>Contact Spareparts.me</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-14 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">How cars.me Works</h2>
            <p className="text-gray-500">Sell your car in 3 simple steps — completely free</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: FiPlus, title: 'Post Your Car', desc: 'Fill in your car details — make, model, year, price, and photos. Takes 2 minutes.' },
              { step: '2', icon: FiCheckCircle, title: 'We Review & Publish', desc: 'Our team reviews your listing and publishes it live across cars.me.' },
              { step: '3', icon: FiTrendingUp, title: 'Get Buyers Calling', desc: 'Interested buyers contact you directly via WhatsApp or phone. Zero commission.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <SafeIcon icon={icon} className="h-7 w-7 text-primary-600" />
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">{step}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/post"
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors"
            >
              <SafeIcon icon={FiPlus} className="h-5 w-5" />
              <span>Post Your Car — It's Free</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-10 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-8 text-center">
            {[
              { icon: FiShield, text: 'Admin-verified listings' },
              { icon: FiUser, text: 'Direct seller contact' },
              { icon: FiCheckCircle, text: 'No hidden fees' },
              { icon: FiSearch, text: 'Easy search & filter' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center space-x-2 text-gray-600">
                <SafeIcon icon={icon} className="h-5 w-5 text-primary-600" />
                <span className="font-medium text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-1 mb-3">
                <span className="text-xl font-black text-primary-400">cars</span>
                <span className="text-xl font-black">.me</span>
              </div>
              <p className="text-gray-400 text-sm">Free car listings platform for UAE. Buy, sell, and find your perfect car.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-400">Browse</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li><Link to="/browse" className="hover:text-white transition-colors">All Cars</Link></li>
                <li><Link to="/browse?make=Toyota" className="hover:text-white transition-colors">Toyota</Link></li>
                <li><Link to="/browse?make=BMW" className="hover:text-white transition-colors">BMW</Link></li>
                <li><Link to="/browse?make=Nissan" className="hover:text-white transition-colors">Nissan</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-400">Sell</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li><Link to="/post" className="hover:text-white transition-colors">Post Free Ad</Link></li>
                <li><Link to="/browse?location=Dubai" className="hover:text-white transition-colors">Dubai Cars</Link></li>
                <li><Link to="/browse?location=Abu Dhabi" className="hover:text-white transition-colors">Abu Dhabi Cars</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-gray-400">Our Partner</h4>
              <a href="https://spareparts.me" target="_blank" rel="noopener noreferrer"
                className="block text-blue-400 hover:text-blue-300 font-semibold mb-1 transition-colors">
                Spareparts.me ↗
              </a>
              <p className="text-gray-400 text-sm">Genuine auto spare parts — worldwide shipping from Dubai</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
            <p>&copy; {new Date().getFullYear()} cars.me — Free Car Listings in UAE. Powered by <a href="https://spareparts.me" className="text-blue-400 hover:text-blue-300">Spareparts.me</a></p>
          </div>
        </div>
      </footer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default HomePage;
