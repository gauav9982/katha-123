import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface City {
  id: string;
  name: string;
  code: string;
}

const AdminPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newCity, setNewCity] = useState({ name: '', code: '' });

  // Admin login handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'Pintubhai@9982') {
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  // Add new city handler
  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/cities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCity),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('City added successfully!');
        setNewCity({ name: '', code: '' });
      } else {
        setError(data.error || 'Failed to add city');
      }
    } catch (error) {
      setError('Failed to connect to server');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Admin Panel
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {!isLoggedIn ? (
          // Admin Login Form
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300"
            >
              Login as Admin
            </button>
          </form>
        ) : (
          // City Management Form
          <form onSubmit={handleAddCity} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City Name
              </label>
              <input
                type="text"
                value={newCity.name}
                onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter city name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City Code
              </label>
              <input
                type="text"
                value={newCity.code}
                onChange={(e) => setNewCity({ ...newCity, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter city code (e.g., AHM)"
                required
                maxLength={3}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300"
              >
                Add City
              </button>
              <button
                type="button"
                onClick={() => setIsLoggedIn(false)}
                className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 