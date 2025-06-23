import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CurrencyDollarIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import TopBar from './TopBar';

const SalaryManagement = () => {
  const navigate = useNavigate();
  const cityName = localStorage.getItem('schoolCity') || 'Unknown City';

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-3 hover:bg-white/20 transition-all duration-300"
            >
              <ArrowLeftIcon className="h-6 w-6 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Salary Management</h1>
              <p className="text-white/60">City: {cityName}</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-400 via-blue-500 to-purple-500 p-4 rounded-2xl">
            <CurrencyDollarIcon className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Coming Soon!</h2>
          <p className="text-white/80">
            Salary management features will be implemented here. This will include:
          </p>
          <ul className="text-white/70 mt-4 space-y-2">
            <li>• Calculate teacher salaries</li>
            <li>• Generate salary slips</li>
            <li>• View salary history</li>
            <li>• Salary reports</li>
            <li>• Payment tracking</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SalaryManagement; 