import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMapPin, FiCalendar, FiActivity, FiArrowRight } = FiIcons;

const COLOR_MAP = {
  White: '#f5f5f5', Black: '#1a1a1a', Silver: '#c0c0c0', Grey: '#808080',
  Red: '#dc2626', Blue: '#2563eb', Green: '#16a34a', Gold: '#d97706',
  Brown: '#92400e', Orange: '#ea580c', Beige: '#d4c5a9', Yellow: '#eab308'
};

const CarCard = ({ car, index = 0 }) => {
  const colorHex = COLOR_MAP[car.color] || '#9ca3af';

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Image placeholder */}
      <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="text-5xl mb-2">🚗</div>
          <p className="text-gray-400 text-sm">{car.make} {car.model}</p>
        </div>
        {/* Color dot */}
        <div
          className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 border-white shadow"
          style={{ backgroundColor: colorHex }}
          title={car.color}
        />
        {/* Condition badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            car.condition === 'New'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {car.condition}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
          {car.title}
        </h3>

        <p className="text-2xl font-bold text-primary-600 mb-3">
          AED {car.price.toLocaleString()}
        </p>

        <div className="grid grid-cols-3 gap-1.5 mb-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <SafeIcon icon={FiCalendar} className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center space-x-1">
            <SafeIcon icon={FiActivity} className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{(car.mileage / 1000).toFixed(0)}k km</span>
          </div>
          <div className="flex items-center space-x-1">
            <SafeIcon icon={FiMapPin} className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{car.location}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <span className="bg-gray-100 px-2 py-0.5 rounded-md">{car.transmission}</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded-md">{car.fuel}</span>
          <span className="bg-gray-100 px-2 py-0.5 rounded-md">{car.body_type}</span>
        </div>

        <Link
          to={`/car/${car.id}`}
          className="flex items-center justify-center space-x-1 w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl py-2.5 transition-colors text-sm"
        >
          <span>View Details</span>
          <SafeIcon icon={FiArrowRight} className="h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default CarCard;
