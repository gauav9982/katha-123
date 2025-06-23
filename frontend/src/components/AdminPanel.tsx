import React, { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface CityCredentials {
  id: string;
  name: string;
  username: string;
  password?: string;
}

const AdminPanel = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cities, setCities] = useState<CityCredentials[]>([]);
  const [newCity, setNewCity] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fetchCities = async () => {
    try {
        const response = await fetch('/api/cities');
        const data = await response.json();
        if (data.success) {
            setCities(data.data);
        }
    } catch (e) {
        setError('Failed to fetch cities');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCities();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'Pintubhai@9982') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid admin password');
    }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.name || !newCity.username || !newCity.password) {
      setError('All fields are required');
      return;
    }
    setError('');
    setSuccessMessage('');

    try {
        const response = await fetch('/api/cities', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCity),
        });
        const data = await response.json();
        if (response.ok) {
            setSuccessMessage('City added successfully!');
            setNewCity({ name: '', username: '', password: '' });
            fetchCities(); // Refresh the list
        } else {
            setError(data.error || 'Failed to add city');
        }
    } catch (e) {
        setError('Failed to connect to server');
    }
  };

  const handleDeleteCity = async (id: string) => {
    try {
        const response = await fetch(`/api/cities/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            setSuccessMessage('City deleted successfully!');
            fetchCities(); // Refresh the list
        } else {
            const data = await response.json();
            setError(data.error || 'Failed to delete city');
        }
    } catch (e) {
        setError('Failed to connect to server');
    }
  };

  const handleClose = () => {
    setIsAuthenticated(false);
    setAdminPassword('');
    setError('');
    setSuccessMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Admin Panel
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {!isAuthenticated ? (
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter admin password"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              Login as Admin
            </button>
          </form>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-600 text-sm">{successMessage}</p>
              </div>
            )}

            {/* Add New City Form */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Add New City</h3>
              <form onSubmit={handleAddCity} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City Name
                    </label>
                    <input
                      type="text"
                      value={newCity.name}
                      onChange={(e) => setNewCity({ ...newCity, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter city name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={newCity.username}
                      onChange={(e) => setNewCity({ ...newCity, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter username"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      value={newCity.password}
                      onChange={(e) => setNewCity({ ...newCity, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter password"
                    />
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  type="submit"
                  className="flex items-center justify-center w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add City
                </button>
              </form>
            </div>

            {/* Cities List */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Registered Cities</h3>
              {cities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No cities registered yet</p>
              ) : (
                <div className="space-y-3">
                  {cities.map((city) => (
                    <div key={city.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800">{city.name}</h4>
                        <p className="text-sm text-gray-600">Username: {city.username}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCity(city.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete city"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Return to Login Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
              >
                Return to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 