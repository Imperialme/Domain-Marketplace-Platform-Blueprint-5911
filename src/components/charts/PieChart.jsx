import React from 'react';
import { motion } from 'framer-motion';

const PieChart = ({ data, labelKey, valueKey, title, colors = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500">
        No data available
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item[valueKey], 0);
  let cumulativePercentage = 0;

  const slices = data.map((item, index) => {
    const percentage = (item[valueKey] / total) * 100;
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
    
    cumulativePercentage += percentage;

    const x1 = 50 + 40 * Math.cos((startAngle - 90) * Math.PI / 180);
    const y1 = 50 + 40 * Math.sin((startAngle - 90) * Math.PI / 180);
    const x2 = 50 + 40 * Math.cos((endAngle - 90) * Math.PI / 180);
    const y2 = 50 + 40 * Math.sin((endAngle - 90) * Math.PI / 180);

    const largeArc = percentage > 50 ? 1 : 0;

    const pathData = [
      `M 50 50`,
      `L ${x1} ${y1}`,
      `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    return {
      ...item,
      pathData,
      percentage: percentage.toFixed(1),
      color: colors[index % colors.length],
      startAngle,
      endAngle
    };
  });

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-8">
        {/* Chart */}
        <div className="relative">
          <svg viewBox="0 0 100 100" className="w-48 h-48">
            {slices.map((slice, index) => (
              <motion.path
                key={index}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: index * 0.2, duration: 0.8, ease: "easeOut" }}
                d={slice.pathData}
                fill={slice.color}
                className="hover:opacity-80 cursor-pointer"
                strokeWidth="1"
                stroke="white"
              >
                <title>{`${slice[labelKey]}: ${slice[valueKey]} (${slice.percentage}%)`}</title>
              </motion.path>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {slices.map((slice, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.5 }}
              className="flex items-center space-x-3"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-sm text-gray-700">
                {slice[labelKey]} ({slice.percentage}%)
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChart;