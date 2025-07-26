import React from 'react';
import { motion } from 'framer-motion';

const BarChart = ({ data, xKey, yKey, title, color = '#2563eb', height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d[yKey]));

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="flex items-end justify-between space-x-1" style={{ height: `${height}px` }}>
        {data.map((item, index) => {
          const barHeight = (item[yKey] / maxValue) * height;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="relative w-full flex items-end justify-center">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: barHeight }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                  className="w-full rounded-t-sm relative group cursor-pointer"
                  style={{ 
                    backgroundColor: color,
                    minHeight: item[yKey] > 0 ? '2px' : '0'
                  }}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item[xKey]}: {item[yKey]}
                  </div>
                </motion.div>
              </div>
              <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                {item[xKey]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;