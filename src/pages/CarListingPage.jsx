import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCars } from '../context/CarContext';
import SparePartsWidget from '../components/SparePartsWidget';
import CarCard from '../components/CarCard';

const {
  FiArrowLeft, FiMapPin, FiCalendar, FiActivity, FiPhone,
  FiMessageCircle, FiCheck, FiShare2, FiFlag, FiChevronRight
} = FiIcons;

const SPEC_ICONS = {
  Year: FiCalendar, Mileage: FiActivity, Location: FiMapPin,
};

const CarListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCarById, activeCars } = useCars();
  const car = getCarById(id);
  const [contactRevealed, setContactRevealed] = useState(false);

  if (!car || car.status !== 'active') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h1>
          <p className="text-gray-500 mb-6">This car may have been sold or removed.</p>
          <Link to="/browse" className="bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-colors">
            Browse Other Cars
          </Link>
        </div>
      </div>
    );
  }

  const similar = activeCars.filter(c => c.id !== car.id && (c.make === car.make || c.body_type === car.body_type)).slice(0, 4);

  const whatsappMsg = encodeURIComponent(`Hi, I'm interested in your ${car.title} listed on cars.me. Is it still available?`);
  const whatsappNum = (car.seller_whatsapp || car.seller_phone).replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate(-1)} className="flex items-center space-x-1.5 text-gray-600 hover:text-gray-900">
              <SafeIcon icon={FiArrowLeft} className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:block">Back</span>
            </button>
            <div className="hidden md:flex items-center space-x-1 text-sm text-gray-400">
              <Link to="/" className="hover:text-primary-600">cars.me</Link>
              <SafeIcon icon={FiChevronRight} className="h-3.5 w-3.5" />
              <Link to="/browse" className="hover:text-primary-600">Browse</Link>
              <SafeIcon icon={FiChevronRight} className="h-3.5 w-3.5" />
              <span className="text-gray-600 truncate max-w-xs">{car.title}</span>
            </div>
          </div>
          <Link to="/" className="flex items-center space-x-1">
            <span className="text-xl font-black text-primary-600">cars</span>
            <span className="text-xl font-black text-gray-900">.me</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image */}
            <div className="bg-gradient-to-br from-gray-200 to-gray-100 rounded-2xl h-64 sm:h-80 flex items-center justify-center">
              <div className="text-center">
                <p className="text-7xl mb-2">🚗</p>
                <p className="text-gray-500 font-medium">{car.make} {car.model}</p>
              </div>
            </div>

            {/* Title and price */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900 mb-1">{car.title}</h1>
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiMapPin} className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500 text-sm">{car.location}, UAE</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-3xl font-black text-primary-600">AED {car.price.toLocaleString()}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${car.condition === 'New' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {car.condition}
                  </span>
                </div>
              </div>
            </div>

            {/* Specs grid */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Specifications</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  ['Year', car.year],
                  ['Mileage', `${car.mileage.toLocaleString()} km`],
                  ['Transmission', car.transmission],
                  ['Fuel Type', car.fuel],
                  ['Body Type', car.body_type],
                  ['Color', car.color],
                ].map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                    <p className="text-gray-900 font-semibold mt-0.5">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{car.description}</p>
            </div>

            {/* Features */}
            {car.features && car.features.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 mb-3">Features & Extras</h2>
                <div className="flex flex-wrap gap-2">
                  {car.features.map(f => (
                    <div key={f} className="flex items-center space-x-1.5 bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-lg">
                      <SafeIcon icon={FiCheck} className="h-3.5 w-3.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SPARE PARTS WIDGET — key monetization */}
            <SparePartsWidget make={car.make} model={car.model} year={car.year} />

            {/* Safety tips */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <div className="flex items-start space-x-3">
                <SafeIcon icon={FiFlag} className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-amber-800 mb-1">Safety Tips</h3>
                  <ul className="text-sm text-amber-700 space-y-0.5 list-disc list-inside">
                    <li>Meet in a public place for test drives</li>
                    <li>Verify ownership documents (Mulkiya) before paying</li>
                    <li>Never transfer money without seeing the car in person</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Contact card */}
            <div className="bg-white rounded-2xl shadow-sm p-5 sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Seller</h2>
              <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-gray-100">
                <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                  {car.seller_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{car.seller_name}</p>
                  <p className="text-xs text-gray-500">Private Seller</p>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={`https://wa.me/${whatsappNum}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-xl transition-colors"
                >
                  <SafeIcon icon={FiMessageCircle} className="h-5 w-5" />
                  <span>WhatsApp Seller</span>
                </a>

                {contactRevealed ? (
                  <a
                    href={`tel:${car.seller_phone}`}
                    className="flex items-center justify-center space-x-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-3.5 rounded-xl transition-colors"
                  >
                    <SafeIcon icon={FiPhone} className="h-5 w-5" />
                    <span>{car.seller_phone}</span>
                  </a>
                ) : (
                  <button
                    onClick={() => setContactRevealed(true)}
                    className="flex items-center justify-center space-x-2 w-full border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl transition-colors"
                  >
                    <SafeIcon icon={FiPhone} className="h-5 w-5" />
                    <span>Show Phone Number</span>
                  </button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                <span>Posted {new Date(car.created_at).toLocaleDateString('en-GB')}</span>
                <button className="flex items-center space-x-1 hover:text-gray-600">
                  <SafeIcon icon={FiShare2} className="h-3.5 w-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Mini spare parts CTA */}
            <a
              href="https://spareparts.me"
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-blue-900 text-white rounded-2xl p-4 hover:bg-blue-800 transition-colors"
            >
              <p className="text-xs text-blue-300 font-semibold uppercase tracking-wide mb-1">Genuine Parts</p>
              <p className="font-bold text-sm">Need {car.make} parts?</p>
              <p className="text-blue-200 text-xs mt-0.5">Spareparts.me → Shop Now</p>
            </a>
          </div>
        </div>

        {/* Similar listings */}
        {similar.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-5">Similar Cars You May Like</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {similar.map((c, i) => <CarCard key={c.id} car={c} index={i} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default CarListingPage;
