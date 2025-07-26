import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon, 
  suffix = '', 
  prefix = '',
  trend = null 
}) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return change >= 0 ? 'text-green-600' : 'text-red-600';
    if (changeType === 'negative') return change <= 0 ? 'text-green-600' : 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return change >= 0 ? '↗' : '↘';
    if (changeType === 'negative') return change <= 0 ? '↗' : '↘';
    return '→';
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          {change !== undefined && (
            <div className={`flex items-center mt-2 text-sm ${getChangeColor()}`}>
              <span className="mr-1">{getChangeIcon()}</span>
              <span>{Math.abs(change)}% vs last period</span>
            </div>
          )}
        </div>
        <div className="ml-4">
          {icon && (
            <div className="bg-primary-100 p-3 rounded-lg">
              <SafeIcon icon={icon} className="h-6 w-6 text-primary-600" />
            </div>
          )}
        </div>
      </div>
      
      {trend && (
        <div className="mt-4">
          <div className="flex items-center space-x-1 h-8">
            {trend.map((point, index) => (
              <div
                key={index}
                className="bg-primary-200 rounded-full flex-1"
                style={{ 
                  height: `${Math.max(2, (point / Math.max(...trend)) * 100)}%`,
                  opacity: 0.7 + (point / Math.max(...trend)) * 0.3
                }}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default MetricCard;