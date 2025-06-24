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
  ShieldCheckIcon,
  AcademicCapIcon,
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import AdminPanel from './AdminPanel';
import SchoolLogin from './SchoolLogin';

const HomePage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSchoolLogin, setShowSchoolLogin] = useState(false);
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

  const handleSchoolLoginSuccess = (cityId: string, cityName: string) => {
    console.log(`Login successful for ${cityName} (ID: ${cityId}). Storing session and redirecting.`);
    
    // Store session data for school app
    const sessionData = {
      cityName: cityName,
      loginTime: new Date().toISOString()
    };
    
    // Store in localStorage for school app
    localStorage.setItem('schoolLoginSession', JSON.stringify(sessionData));
    
    // Also store the old format for compatibility
    localStorage.setItem('schoolCityId', cityId);
    localStorage.setItem('schoolCityName', cityName);
    
    setShowSchoolLogin(false); // Close the modal
    
    // Show success message and redirect
    setTimeout(() => {
      const schoolUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:5179/dashboard' 
        : '/school-app/dashboard';
      window.location.href = schoolUrl;
    }, 500);
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

      {/* Floating Transparent Balloons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={`balloon-${i}`}
            className="absolute animate-float"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          >
            {/* Balloon */}
            <div 
              className={`w-16 h-20 rounded-full opacity-20 blur-sm ${
                i % 4 === 0 ? 'bg-gradient-to-b from-pink-400/30 to-pink-600/30' :
                i % 4 === 1 ? 'bg-gradient-to-b from-blue-400/30 to-blue-600/30' :
                i % 4 === 2 ? 'bg-gradient-to-b from-yellow-400/30 to-yellow-600/30' :
                'bg-gradient-to-b from-purple-400/30 to-purple-600/30'
              }`}
              style={{
                transform: `scale(${0.8 + Math.random() * 0.4})`,
                filter: 'blur(1px)'
              }}
            ></div>
            {/* Balloon String */}
            <div 
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-px h-8 bg-white/20"
              style={{
                transform: `translateX(-50%) rotate(${Math.random() * 20 - 10}deg)`
              }}
            ></div>
          </div>
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
              {/* Only School System Button */}
              <button
                onClick={() => setShowSchoolLogin(true)}
                className="group relative px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <AcademicCapIcon className="h-5 w-5 mr-2" />
                  School System
                </div>
              </button>
              {/* Account Button Restored */}
              <button
                onClick={() => window.open('http://localhost:5173/account', '_blank')}
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
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {bankDetails.map((bank, index) => (
                <div key={index} className={`bg-gradient-to-br ${bank.color} p-6 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-all duration-300`}>
                  <h3 className="text-xl font-bold mb-4">{bank.name}</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-semibold">Account:</span> {bank.accountNumber}</p>
                    <p><span className="font-semibold">IFSC:</span> {bank.ifscCode}</p>
                    <p><span className="font-semibold">Branch:</span> {bank.branch}</p>
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
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl transform animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Login
              </h2>
              <button
                onClick={() => setShowLogin(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter username"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-600 text-sm">{loginError}</p>
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin Panel Modal */}
      <AdminPanel 
        isOpen={showAdminPanel} 
        onClose={() => setShowAdminPanel(false)} 
      />

      {/* School Login Modal */}
      <SchoolLogin 
        isOpen={showSchoolLogin} 
        onClose={() => setShowSchoolLogin(false)}
        onLoginSuccess={handleSchoolLoginSuccess}
        onAdminClick={() => setShowAdminPanel(true)}
      />

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className={`transform transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-8">
                Welcome to{' '}
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Katha Sales
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed">
                Your comprehensive business management solution. From inventory to sales, 
                we've got everything you need to grow your business.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button
                  onClick={() => setShowLogin(true)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <RocketLaunchIcon className="h-6 w-6 mr-3" />
                    Get Started
                  </div>
                </button>
                
                <button
                  onClick={() => setShowSchoolLogin(true)}
                  className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center">
                    <AcademicCapIcon className="h-6 w-6 mr-3" />
                    School System
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-lg">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Why Choose{' '}
                <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  Katha Sales?
                </span>
              </h2>
              <p className="text-xl text-white/80 max-w-3xl mx-auto">
                Experience the power of integrated business management with our comprehensive suite of tools.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: ChartBarIcon,
                  title: 'Advanced Analytics',
                  description: 'Get detailed insights into your business performance with comprehensive reports and analytics.',
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: ShieldCheckIcon,
                  title: 'Secure & Reliable',
                  description: 'Your data is protected with enterprise-grade security and reliable backup systems.',
                  color: 'from-green-500 to-emerald-500'
                },
                {
                  icon: SparklesIcon,
                  title: 'Easy to Use',
                  description: 'Intuitive interface designed for users of all technical levels.',
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  icon: StarIcon,
                  title: '24/7 Support',
                  description: 'Round-the-clock customer support to help you whenever you need assistance.',
                  color: 'from-yellow-500 to-orange-500'
                },
                {
                  icon: BuildingOfficeIcon,
                  title: 'Multi-Branch',
                  description: 'Manage multiple branches and locations from a single platform.',
                  color: 'from-indigo-500 to-purple-500'
                },
                {
                  icon: AcademicCapIcon,
                  title: 'School Management',
                  description: 'Integrated school management system for teacher salary and administration.',
                  color: 'from-teal-500 to-blue-500'
                }
              ].map((feature, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${feature.color} p-8 rounded-2xl text-white shadow-xl transform hover:scale-105 transition-all duration-300`}
                >
                  <feature.icon className="h-12 w-12 mb-6" />
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-white/90 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto">
              Join thousands of businesses that trust Katha Sales for their management needs.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={() => setShowLogin(true)}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <UserIcon className="h-6 w-6 mr-3" />
                  Start Free Trial
                </div>
              </button>
              
              <div className="flex items-center space-x-6 text-white/80">
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-2" />
                  <span>info@kathasales.com</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/20 backdrop-blur-lg border-t border-white/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white/60">
            <p>&copy; 2024 Katha Sales. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 