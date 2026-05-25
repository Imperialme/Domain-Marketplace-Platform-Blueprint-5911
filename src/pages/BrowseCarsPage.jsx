import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCars, CAR_MAKES, UAE_CITIES } from '../context/CarContext';
import CarCard from '../components/CarCard';

const { FiSearch, FiFilter, FiX, FiChevronDown, FiMapPin, FiSliders } = FiIcons;

const PRICE_RANGES = [
  { label: 'Under AED 50k', min: 0, max: 50000 },
  { label: 'AED 50k – 100k', min: 50000, max: 100000 },
  { label: 'AED 100k – 200k', min: 100000, max: 200000 },
  { label: 'AED 200k – 400k', min: 200000, max: 400000 },
  { label: 'AED 400k+', min: 400000, max: Infinity },
];

const BODY_TYPES = ['Sedan', 'SUV', 'Pickup', 'Hatchback', 'Coupe', 'Van'];

const BrowseCarsPage = () => {
  const { activeCars } = useCars();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    make: searchParams.get('make') || '',
    location: searchParams.get('location') || '',
    priceRange: '',
    bodyType: '',
    yearMin: '',
    yearMax: '',
    sortBy: 'newest',
  });

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ q: '', make: '', location: '', priceRange: '', bodyType: '', yearMin: '', yearMax: '', sortBy: 'newest' });
    setSearchParams({});
  };

  const filtered = useMemo(() => {
    let result = [...activeCars];

    if (filters.q) {
      const q = filters.q.toLowerCase();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.make.toLowerCase().includes(q) ||
        c.model.toLowerCase().includes(q)
      );
    }
    if (filters.make) result = result.filter(c => c.make === filters.make);
    if (filters.location) result = result.filter(c => c.location === filters.location);
    if (filters.bodyType) result = result.filter(c => c.body_type === filters.bodyType);
    if (filters.yearMin) result = result.filter(c => c.year >= Number(filters.yearMin));
    if (filters.yearMax) result = result.filter(c => c.year <= Number(filters.yearMax));

    if (filters.priceRange) {
      const range = PRICE_RANGES.find(r => r.label === filters.priceRange);
      if (range) result = result.filter(c => c.price >= range.min && c.price <= range.max);
    }

    if (filters.sortBy === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    if (filters.sortBy === 'price_asc') result.sort((a, b) => a.price - b.price);
    if (filters.sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);
    if (filters.sortBy === 'mileage') result.sort((a, b) => a.mileage - b.mileage);

    return result;
  }, [activeCars, filters]);

  const activeFilterCount = ['make', 'location', 'priceRange', 'bodyType', 'yearMin', 'yearMax']
    .filter(k => filters[k]).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-1">
            <span className="text-xl font-black text-primary-600">cars</span>
            <span className="text-xl font-black text-gray-900">.me</span>
          </Link>
          <div className="flex items-center space-x-3">
            <Link to="/post" className="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary-700 transition-colors">
              + Post Free Ad
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search bar */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search make, model, or keyword..."
              value={filters.q}
              onChange={e => updateFilter('q', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-900"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-colors ${showFilters ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            <SafeIcon icon={FiSliders} className="h-4 w-4" />
            <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
          </button>
          <div className="relative">
            <select
              value={filters.sortBy}
              onChange={e => updateFilter('sortBy', e.target.value)}
              className="appearance-none pl-3 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="mileage">Lowest Mileage</option>
            </select>
            <SafeIcon icon={FiChevronDown} className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Make</label>
              <select value={filters.make} onChange={e => updateFilter('make', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">All Makes</option>
                {CAR_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Location</label>
              <select value={filters.location} onChange={e => updateFilter('location', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">All UAE</option>
                {UAE_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Price Range</label>
              <select value={filters.priceRange} onChange={e => updateFilter('priceRange', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Any Price</option>
                {PRICE_RANGES.map(r => <option key={r.label} value={r.label}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Body Type</label>
              <select value={filters.bodyType} onChange={e => updateFilter('bodyType', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500">
                <option value="">Any Type</option>
                {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Year From</label>
              <input type="number" placeholder="2015" min="2000" max="2025"
                value={filters.yearMin} onChange={e => updateFilter('yearMin', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Year To</label>
              <input type="number" placeholder="2024" min="2000" max="2025"
                value={filters.yearMax} onChange={e => updateFilter('yearMax', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            {activeFilterCount > 0 && (
              <div className="col-span-full flex justify-end">
                <button onClick={clearFilters}
                  className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700 font-medium">
                  <SafeIcon icon={FiX} className="h-4 w-4" />
                  <span>Clear Filters</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600 text-sm">
            <span className="font-bold text-gray-900">{filtered.length}</span> cars found
            {filters.make && <span> · {filters.make}</span>}
            {filters.location && <span> in {filters.location}</span>}
          </p>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((car, i) => (
              <CarCard key={car.id} car={car} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No cars found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your filters</p>
            <button onClick={clearFilters} className="text-primary-600 font-semibold hover:text-primary-700">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseCarsPage;
