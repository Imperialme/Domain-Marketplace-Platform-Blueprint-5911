import React from 'react';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTool, FiZap, FiSettings, FiShield, FiExternalLink, FiMessageCircle } = FiIcons;

const PART_CATEGORIES = [
  { label: 'Engine Parts', icon: FiSettings, url: 'https://spareparts.me/products' },
  { label: 'Electrical & Sensors', icon: FiZap, url: 'https://spareparts.me/products' },
  { label: 'Brakes & Suspension', icon: FiShield, url: 'https://spareparts.me/products' },
  { label: 'Body Panels', icon: FiTool, url: 'https://spareparts.me/products' },
  { label: 'Gearbox Parts', icon: FiSettings, url: 'https://spareparts.me/categories/truck-parts' },
  { label: 'Filters & Fluids', icon: FiTool, url: 'https://spareparts.me/products' },
];

const SparePartsWidget = ({ make, model, year }) => {
  const whatsappText = encodeURIComponent(`Hi, I need genuine spare parts for my ${year} ${make} ${model}. Please assist.`);

  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-6 py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium uppercase tracking-wide mb-1">Powered by</p>
            <h3 className="text-2xl font-bold">Spareparts.me</h3>
            <p className="text-blue-100 mt-1 text-sm">
              Dubai's trusted genuine auto parts supplier — 20+ years of global experience
            </p>
          </div>
          <a
            href="https://spareparts.me"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/30 rounded-lg p-2 transition-colors"
          >
            <SafeIcon icon={FiExternalLink} className="h-5 w-5 text-white" />
          </a>
        </div>

        <div className="mt-4 bg-white/10 rounded-xl px-4 py-3">
          <p className="font-semibold text-white">
            Need genuine parts for your {year} {make} {model}?
          </p>
          <p className="text-blue-200 text-sm mt-0.5">
            Get OEM-quality parts delivered worldwide from Dubai
          </p>
        </div>
      </div>

      {/* Part categories */}
      <div className="bg-white px-6 py-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Browse parts by category</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PART_CATEGORIES.map((cat) => (
            <a
              key={cat.label}
              href={cat.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 border border-gray-100 rounded-lg px-3 py-2.5 transition-colors group"
            >
              <SafeIcon icon={cat.icon} className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-gray-700 group-hover:text-blue-700 font-medium">{cat.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* CTA row */}
      <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3">
        <a
          href={`https://wa.me/97142529988?text=${whatsappText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center space-x-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl py-3 px-4 transition-colors"
        >
          <SafeIcon icon={FiMessageCircle} className="h-5 w-5" />
          <span>WhatsApp for Parts</span>
        </a>
        <a
          href="https://spareparts.me/store"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-xl py-3 px-4 transition-colors"
        >
          <SafeIcon icon={FiExternalLink} className="h-5 w-5" />
          <span>Browse All Parts</span>
        </a>
      </div>
    </div>
  );
};

export default SparePartsWidget;
