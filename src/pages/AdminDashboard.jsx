import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCars } from '../context/CarContext';
import { useInquiries } from '../context/InquiryContext';
import { useAuth } from '../context/AuthContext';

const {
  FiList, FiClock, FiCheckCircle, FiXCircle, FiMail, FiLogOut,
  FiArrowRight, FiBarChart2
} = FiIcons;

const AdminDashboard = () => {
  const { cars, activeCars, pendingCars, updateCar } = useCars();
  const { inquiries } = useInquiries();
  const { user, logout } = useAuth();

  const newInquiries = inquiries.filter(i => i.status === 'new').length;

  const approve = (id) => updateCar(id, { status: 'active' });
  const reject = (id) => updateCar(id, { status: 'rejected' });

  const stats = [
    { label: 'Active Listings', value: activeCars.length, color: 'text-green-600', bg: 'bg-green-50', icon: FiCheckCircle },
    { label: 'Pending Review', value: pendingCars.length, color: 'text-amber-600', bg: 'bg-amber-50', icon: FiClock },
    { label: 'Total Listings', value: cars.length, color: 'text-blue-600', bg: 'bg-blue-50', icon: FiList },
    { label: 'New Inquiries', value: newInquiries, color: 'text-purple-600', bg: 'bg-purple-50', icon: FiMail },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-1">
              <span className="text-xl font-black text-primary-600">cars</span>
              <span className="text-xl font-black text-gray-900">.me</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-semibold text-gray-500">Admin Panel</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:block">👋 {user?.name}</span>
            <button onClick={logout} className="flex items-center space-x-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors">
              <SafeIcon icon={FiLogOut} className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, color, bg, icon }) => (
            <motion.div
              key={label}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`${bg} rounded-2xl p-5`}
            >
              <SafeIcon icon={icon} className={`h-6 w-6 ${color} mb-2`} />
              <p className={`text-3xl font-black ${color}`}>{value}</p>
              <p className="text-sm text-gray-600 mt-0.5">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <Link to="/admin/listings" className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiList} className="h-6 w-6 text-primary-600" />
              <span className="font-semibold text-gray-800">Manage Listings</span>
            </div>
            <SafeIcon icon={FiArrowRight} className="h-4 w-4 text-gray-400" />
          </Link>
          <Link to="/admin/inquiries" className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiMail} className="h-6 w-6 text-purple-600" />
              <span className="font-semibold text-gray-800">
                Inquiries {newInquiries > 0 && <span className="bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">{newInquiries}</span>}
              </span>
            </div>
            <SafeIcon icon={FiArrowRight} className="h-4 w-4 text-gray-400" />
          </Link>
          <Link to="/admin/analytics" className="flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiBarChart2} className="h-6 w-6 text-blue-600" />
              <span className="font-semibold text-gray-800">Analytics</span>
            </div>
            <SafeIcon icon={FiArrowRight} className="h-4 w-4 text-gray-400" />
          </Link>
        </div>

        {/* Pending listings */}
        {pendingCars.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiClock} className="h-5 w-5 text-amber-600" />
                <h2 className="font-bold text-gray-900">Pending Review ({pendingCars.length})</h2>
              </div>
              <Link to="/admin/listings" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingCars.slice(0, 5).map(car => (
                <div key={car.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">{car.title}</p>
                    <div className="flex items-center space-x-3 mt-0.5">
                      <span className="text-sm text-primary-600 font-medium">AED {car.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-400">{car.location}</span>
                      <span className="text-sm text-gray-400">{car.seller_name}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                    <button onClick={() => approve(car.id)}
                      className="flex items-center space-x-1 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors">
                      <SafeIcon icon={FiCheckCircle} className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                    <button onClick={() => reject(car.id)}
                      className="flex items-center space-x-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors">
                      <SafeIcon icon={FiXCircle} className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
            <SafeIcon icon={FiCheckCircle} className="h-10 w-10 text-green-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">All caught up!</p>
            <p className="text-sm text-gray-400 mt-1">No listings pending review.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
