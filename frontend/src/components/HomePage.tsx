import React, { useState, useEffect } from 'react';
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
  EyeSlashIcon,
  SparklesIcon,
  StarIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const HomePage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

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
      branch: 'Nadiad Main Branch',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'HDFC Bank',
      accountNumber: '0987654321',
      ifscCode: 'HDFC0005678',
      branch: 'Nadiad Branch',
      color: 'from-purple-500 to-purple-600'
    },
    {
      name: 'ICICI Bank',
      accountNumber: '1122334455',
      ifscCode: 'ICIC0009012',
      branch: 'Nadiad Branch',
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Company Logo and Name */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 p-3 rounded-2xl shadow-2xl transform hover:scale-110 transition-all duration-300">
                  <BuildingOfficeIcon className="h-10 w-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  KATHA SALES
                </h1>
                <p className="text-sm text-white/80 font-medium">Your Premium Business Partner</p>
              </div>
            </div>

            {/* Top Menu */}
            <div className="flex items-center space-x-4">
              {/* Bank Details Button */}
              <button
                onClick={() => setShowBankDetails(!showBankDetails)}
                className="group relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <BanknotesIcon className="h-5 w-5 mr-2" />
                  Bank Details
                </div>
              </button>

              {/* Account Button */}
              <button
                onClick={() => setShowLogin(true)}
                className="group relative px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Account
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bank Details Modal */}
      {showBankDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 max-w-4xl w-full mx-4 shadow-2xl transform animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Bank Account Details
              </h2>
              <button
                onClick={() => setShowBankDetails(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bankDetails.map((bank, index) => (
                <div key={index} className={`bg-gradient-to-br ${bank.color} text-white rounded-2xl p-6 shadow-xl transform hover:scale-105 transition-all duration-300`}>
                  <div className="flex items-center mb-4">
                    <BanknotesIcon className="h-8 w-8 mr-3" />
                    <h3 className="font-bold text-xl">{bank.name}</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-semibold">Account:</span> {bank.accountNumber}</div>
                    <div><span className="font-semibold">IFSC:</span> {bank.ifscCode}</div>
                    <div><span className="font-semibold">Branch:</span> {bank.branch}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-10 max-w-md w-full mx-4 shadow-2xl transform animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Login to Account
              </h2>
              <button
                onClick={() => {
                  setShowLogin(false);
                  setLoginError('');
                  setUsername('');
                  setPassword('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <LockClosedIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                <div className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-200">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-6 rounded-xl font-semibold shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`text-center mb-16 transition-all duration-1000 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-4 rounded-full shadow-2xl">
              <SparklesIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Katha Sales
            </span>
          </h1>
          <p className="text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed">
            Your trusted partner for all your business needs. We provide comprehensive 
            solutions to help your business grow and succeed in the digital age.
          </p>
        </div>

        {/* Company Information Cards */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
          <div className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 border border-white/20">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
              <BuildingOfficeIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Company</h3>
            <p className="text-white/80 font-medium">KATHA SALES</p>
          </div>

          <div className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 border border-white/20">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
              <MapPinIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Address</h3>
            <p className="text-white/80 font-medium">9, OM SHIV PARK SOCIETY<br />PIJ ROAD, NADIAD-387002</p>
          </div>

          <div className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 border border-white/20">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
              <EnvelopeIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Email</h3>
            <p className="text-white/80 font-medium">kathasales31@gmail.com</p>
          </div>

          <div className="group bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-500 border border-white/20">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
              <PhoneIcon className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Mobile</h3>
            <p className="text-white/80 font-medium">+91 9898986217</p>
          </div>
        </div>

        {/* Features Section */}
        <div className={`bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
          <h2 className="text-4xl font-bold text-white mb-12 text-center">
            Our Premium Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group text-center">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-6 rounded-3xl w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                <ChartBarIcon className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Accounting</h3>
              <p className="text-white/80 leading-relaxed">Complete accounting solutions with AI-powered insights for your business growth</p>
            </div>

            <div className="group text-center">
              <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-6 rounded-3xl w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                <RocketLaunchIcon className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Advanced Reports</h3>
              <p className="text-white/80 leading-relaxed">Real-time analytics and detailed reports to make informed business decisions</p>
            </div>

            <div className="group text-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-3xl w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                <ShieldCheckIcon className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Enterprise Security</h3>
              <p className="text-white/80 leading-relaxed">Bank-level security with encrypted data and secure cloud infrastructure</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className={`text-center mt-16 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
          <button
            onClick={() => setShowLogin(true)}
            className="group bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-12 py-6 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            <div className="flex items-center justify-center">
              <StarIcon className="h-6 w-6 mr-3" />
              Get Started Today
              <StarIcon className="h-6 w-6 ml-3" />
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/20 backdrop-blur-lg border-t border-white/20 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 p-3 rounded-full">
                <BuildingOfficeIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-4">KATHA SALES</p>
            <p className="text-white/70 mb-6 text-lg">
              9, OM SHIV PARK SOCIETY, PIJ ROAD, NADIAD-387002
            </p>
            <div className="flex justify-center space-x-8 text-sm text-white/60">
              <span className="flex items-center">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                kathasales31@gmail.com
              </span>
              <span className="flex items-center">
                <PhoneIcon className="h-4 w-4 mr-2" />
                +91 9898986217
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 