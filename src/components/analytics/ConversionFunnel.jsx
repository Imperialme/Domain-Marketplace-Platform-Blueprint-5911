import React from 'react';
import { motion } from 'framer-motion';

const ConversionFunnel = ({ data }) => {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
      
      <div className="space-y-4">
        {data.map((stage, index) => {
          const percentage = (stage.value / maxValue) * 100;
          const conversionRate = index > 0 ? ((stage.value / data[index - 1].value) * 100).toFixed(1) : 100;
          
          return (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{stage.label}</span>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="font-semibold text-gray-900">{stage.value.toLocaleString()}</span>
                  {index > 0 && (
                    <span className="text-gray-500">({conversionRate}%)</span>
                  )}
                </div>
              </div>
              
              <div className="relative">
                <div className="h-12 bg-gray-100 rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.2 + 0.3, duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center text-white font-medium"
                    style={{ minWidth: stage.value > 0 ? '60px' : '0' }}
                  >
                    {stage.value > 0 && (
                      <span className="text-sm">{stage.value.toLocaleString()}</span>
                    )}
                  </motion.div>
                </div>
                
                {/* Drop-off indicator */}
                {index > 0 && (
                  <div className="absolute right-0 top-full mt-1 text-xs text-red-600">
                    -{((data[index - 1].value - stage.value) / data[index - 1].value * 100).toFixed(1)}% drop-off
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversionFunnel;