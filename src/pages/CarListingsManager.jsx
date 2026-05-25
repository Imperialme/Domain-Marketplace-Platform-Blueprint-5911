import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import { useCars } from '../context/CarContext';

const { FiArrowLeft, FiCheckCircle, FiXCircle, FiTrash2, FiSearch, FiEye, FiFilter } = FiIcons;

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
};

const CarListingsManager = () => {
  const { cars, updateCar, deleteCar } = useCars();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = cars.filter(c => {
    const matchesSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.seller_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const approve = (id) => updateCar(id, { status: 'active' });
  const reject = (id) => updateCar(id, { status: 'rejected' });
  const remove = (id) => { deleteCar(id); setConfirmDelete(null); };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/admin" className="flex items-center space-x-1.5 text-gray-600 hover:text-gray-900">
              <SafeIcon icon={FiArrowLeft} className="h-4 w-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </Link>
            <span className="text-gray-300">|</span>
            <span className="text-sm font-semibold text-gray-700">Manage Listings</span>
          </div>
          <Link to="/" className="flex items-center space-x-1">
            <span className="text-lg font-black text-primary-600">cars</span>
            <span className="text-lg font-black text-gray-900">.me</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex-1 relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or seller name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-sm"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'active', 'pending', 'rejected'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {s} {s === 'all' ? `(${cars.length})` : `(${cars.filter(c => c.status === s).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No listings found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600">Car</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Seller</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Price</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Location</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Date</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(car => (
                    <tr key={car.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900 truncate max-w-[180px]">{car.title}</p>
                        <p className="text-gray-400 text-xs">{car.body_type} · {car.mileage.toLocaleString()} km</p>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <p className="text-gray-700">{car.seller_name}</p>
                        <p className="text-gray-400 text-xs">{car.seller_phone}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-primary-600">AED {car.price.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-600 hidden sm:table-cell">{car.location}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[car.status]}`}>
                          {car.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-gray-400 hidden lg:table-cell">
                        {new Date(car.created_at).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-1">
                          <Link to={`/car/${car.id}`} target="_blank"
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                            <SafeIcon icon={FiEye} className="h-4 w-4" />
                          </Link>
                          {car.status !== 'active' && (
                            <button onClick={() => approve(car.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                              <SafeIcon icon={FiCheckCircle} className="h-4 w-4" />
                            </button>
                          )}
                          {car.status !== 'rejected' && (
                            <button onClick={() => reject(car.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                              <SafeIcon icon={FiXCircle} className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => setConfirmDelete(car.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <SafeIcon icon={FiTrash2} className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Listing?</h3>
            <p className="text-gray-500 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => remove(confirmDelete)}
                className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-xl hover:bg-red-700 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarListingsManager;
