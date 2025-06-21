import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BanknotesIcon,
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showBankDetails, setShowBankDetails] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'KATHA' && password === 'MANTRA') {
      setLoginError('');
      // Navigate to the main application
      navigate('/dashboard');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const bankDetails = [
    {
      name: 'State Bank of India',
      accountNumber: '1234567890',
      ifscCode: 'SBIN0001234',
      branch: 'Nadiad Main Branch'
    },
    {
      name: 'HDFC Bank',
      accountNumber: '0987654321',
      ifscCode: 'HDFC0005678',
      branch: 'Nadiad Branch'
    },
    {
      name: 'ICICI Bank',
      accountNumber: '1122334455',
      ifscCode: 'ICIC0009012',
      branch: 'Nadiad Branch'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Company Logo and Name */}
            <div className="flex items-center">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <BuildingOfficeIcon className="h-8 w-8" />
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">KATHA SALES</h1>
                <p className="text-sm text-gray-600">Your Trusted Business Partner</p>
              </div>
            </div>

            {/* Top Menu */}
            <div className="flex items-center space-x-4">
              {/* Bank Details Button */}
              <button
                onClick={() => setShowBankDetails(!showBankDetails)}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <BanknotesIcon className="h-4 w-4 mr-2" />
                Bank Details
              </button>

              {/* Account Button */}
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                <UserIcon className="h-4 w-4 mr-2" />
                Account
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bank Details Modal */}
      {showBankDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Bank Account Details</h2>
              <button
                onClick={() => setShowBankDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {bankDetails.map((bank, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{bank.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><span className="font-medium">Account Number:</span> {bank.accountNumber}</div>
                    <div><span className="font-medium">IFSC Code:</span> {bank.ifscCode}</div>
                    <div><span className="font-medium">Branch:</span> {bank.branch}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Login to Account</h2>
              <button
                onClick={() => {
                  setShowLogin(false);
                  setLoginError('');
                  setUsername('');
                  setPassword('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Katha Sales
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted partner for all your business needs. We provide comprehensive 
            solutions to help your business grow and succeed.
          </p>
        </div>

        {/* Company Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <BuildingOfficeIcon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Company</h3>
            <p className="text-gray-600">KATHA SALES</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-green-100 text-green-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <MapPinIcon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Address</h3>
            <p className="text-gray-600">9, OM SHIV PARK SOCIETY<br />PIJ ROAD, NADIAD-387002</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <EnvelopeIcon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600">kathasales31@gmail.com</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <PhoneIcon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile</h3>
            <p className="text-gray-600">+91 9898986217</p>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 text-blue-600 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Accounting</h3>
              <p className="text-gray-600">Complete accounting solutions for your business</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 text-green-600 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports</h3>
              <p className="text-gray-600">Detailed reports and analytics</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 text-purple-600 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Security</h3>
              <p className="text-gray-600">Secure and reliable data management</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">KATHA SALES</p>
            <p className="text-gray-300 mb-4">
              9, OM SHIV PARK SOCIETY, PIJ ROAD, NADIAD-387002
            </p>
            <div className="flex justify-center space-x-4 text-sm text-gray-400">
              <span>Email: kathasales31@gmail.com</span>
              <span>Phone: +91 9898986217</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 