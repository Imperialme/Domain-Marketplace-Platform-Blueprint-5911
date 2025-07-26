import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiActivity, FiUsers, FiEye } = FiIcons;

const RealtimeWidget = () => {
  const [realtimeData, setRealtimeData] = useState({
    activeUsers: 0,
    pageViews: 0,
    newInquiries: 0
  });

  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      if (isLive) {
        setRealtimeData(prev => ({
          activeUsers: Math.max(0, prev.activeUsers + (Math.random() > 0.5 ? 1 : -1)),
          pageViews: prev.pageViews + Math.floor(Math.random() * 3),
          newInquiries: prev.newInquiries + (Math.random() > 0.9 ? 1 : 0)
        }));
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Real-time Activity</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-600">{isLive ? 'Live' : 'Paused'}</span>
          <button
            onClick={() => setIsLive(!isLive)}
            className="text-xs text-primary-600 hover:text-primary-700 ml-2"
          >
            {isLive ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <motion.div
          key={realtimeData.activeUsers}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-center p-4 bg-blue-50 rounded-lg"
        >
          <SafeIcon icon={FiUsers} className="h-6 w-6 text-blue-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-blue-900">{realtimeData.activeUsers}</p>
          <p className="text-xs text-blue-600">Active Users</p>
        </motion.div>

        <motion.div
          key={realtimeData.pageViews}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-center p-4 bg-green-50 rounded-lg"
        >
          <SafeIcon icon={FiEye} className="h-6 w-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-900">{realtimeData.pageViews}</p>
          <p className="text-xs text-green-600">Page Views</p>
        </motion.div>

        <motion.div
          key={realtimeData.newInquiries}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          className="text-center p-4 bg-purple-50 rounded-lg"
        >
          <SafeIcon icon={FiActivity} className="h-6 w-6 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-900">{realtimeData.newInquiries}</p>
          <p className="text-xs text-purple-600">New Inquiries</p>
        </motion.div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center text-xs text-gray-500">
          <SafeIcon icon={FiActivity} className="h-3 w-3 mr-1" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

export default RealtimeWidget;