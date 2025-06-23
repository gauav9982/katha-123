import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlusIcon, 
  UsersIcon, 
  DocumentTextIcon, 
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import TopBar from './TopBar';

interface City {
  id: number;
  name: string;
}

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [cityName, setCityName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    const session = localStorage.getItem('schoolLoginSession');
    if (session) {
      try {
        const sessionData = JSON.parse(session);
        setCityName(sessionData.cityName);
        setIsLoggedIn(true);
        console.log('Session found:', sessionData);
      } catch (error) {
        console.error('Error parsing session:', error);
        setIsLoggedIn(false);
        localStorage.removeItem('schoolLoginSession');
        // Don't redirect immediately, let user see the login form
      }
    } else {
      setIsLoggedIn(false);
      fetchCities();
      console.log('No session found');
    }
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch('http://localhost:4009/api/cities');
      const data = await response.json();
      if (data.success) {
        setCities(data.data);
      } else {
        setLoginError('Failed to load cities.');
      }
    } catch (error) {
      setLoginError('Connection error. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('schoolLoginSession');
    setCityName('');
    setIsLoggedIn(false);
    setLoginError('');
    // Redirect to main website
    window.location.href = 'http://localhost:5173';
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');
    
    const formData = new FormData(e.target as HTMLFormElement);
    const cityName = selectedCity;
    
    if (!cityName) {
      setLoginError('Please enter city name');
      return;
    }
    
    try {
      console.log('Attempting login for city:', cityName);
      
      const response = await fetch('http://localhost:4009/api/cities/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cityName: cityName.trim() })
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (data.success) {
        const sessionData = {
          cityName: data.data.name,
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('schoolLoginSession', JSON.stringify(sessionData));
        localStorage.setItem('schoolCityId', data.data.id);
        localStorage.setItem('schoolCityName', data.data.name);
        setCityName(data.data.name);
        setIsLoggedIn(true);
        setLoginError('');
        console.log('Login successful:', sessionData);
      } else {
        setLoginError(data.error || 'Login failed');
        console.error('Login failed:', data.error);
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Connection error. Please try again.');
    }
  };

  const dashboardButtons = [
    // Teacher Management
    {
      title: 'Add Teacher',
      description: 'Add new teacher to the system',
      icon: UserPlusIcon,
      color: 'bg-blue-500 hover:bg-blue-600',
      route: '/teachers/add'
    },
    {
      title: 'Teacher List',
      description: 'View and manage all teachers',
      icon: UsersIcon,
      color: 'bg-green-500 hover:bg-green-600',
      route: '/teachers'
    },
    // Salary & Allowances
    {
      title: 'Salary Management',
      description: 'Manage teacher salaries',
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      route: '/salary'
    },
    {
      title: 'DA% Management',
      description: 'Manage Dearness Allowance',
      icon: CurrencyDollarIcon,
      color: 'bg-orange-500 hover:bg-orange-600',
      route: '/da-management'
    },
    {
      title: 'HRA% Management',
      description: 'Manage House Rent Allowance',
      icon: CurrencyDollarIcon,
      color: 'bg-teal-500 hover:bg-teal-600',
      route: '/hra-management'
    },
    {
      title: 'LWP & HLWP',
      description: 'Manage Leave Without Pay records',
      icon: CalendarIcon,
      color: 'bg-red-500 hover:bg-red-600',
      route: '/lwp-management'
    },
    // Reports
    {
      title: 'All Payable Report',
      description: 'Generate Complete All Payable Report',
      icon: DocumentTextIcon,
      color: 'bg-red-600 hover:bg-red-700',
      route: '/reports/all-payable'
    },
    {
      title: 'All Paid Report',
      description: 'Generate Complete All Paid Report',
      icon: DocumentTextIcon,
      color: 'bg-green-600 hover:bg-green-700',
      route: '/reports/all-paid'
    },
    {
      title: 'Different Salary Report',
      description: 'Generate Different Salary Report',
      icon: DocumentTextIcon,
      color: 'bg-cyan-600 hover:bg-cyan-700',
      route: '/reports/different-salary-report'
    }
  ];

  if (!isLoggedIn) {
    // Show login form instead of redirecting
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              School Login
            </h2>
            <p className="text-gray-600 mt-2">Please login to access the School Dashboard</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {/* City Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Choose your city</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{loginError}</p>
              </div>
            )}
            
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* TopBar */}
      <TopBar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Welcome "{cityName}" - Teacher Salary Management
              </h1>
              <p className="text-blue-100 mt-1">Manage your school's teacher data and salaries</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardButtons.map((button, index) => (
            <div
              key={index}
              onClick={() => navigate(button.route)}
              className={`${button.color} text-white p-6 rounded-lg shadow-lg cursor-pointer transform hover:scale-105 transition-all duration-200`}
            >
              <div className="flex items-center mb-4">
                <button.icon className="h-8 w-8 mr-3" />
                <h3 className="text-xl font-semibold">{button.title}</h3>
              </div>
              <p className="text-sm opacity-90">{button.description}</p>
            </div>
          ))}
        </div>

        {/* Quick Stats Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800">Total Teachers</h3>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-blue-600">Currently registered</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-green-800">Active Teachers</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
              <p className="text-sm text-green-600">Currently active</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-800">Total Salary</h3>
              <p className="text-3xl font-bold text-purple-600">₹0</p>
              <p className="text-sm text-purple-600">Monthly total</p>
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Reports</h3>
          <div className="space-y-3">
            <button onClick={() => navigate('/reports/payable-5th-commission')} className="w-full text-left bg-blue-100 hover:bg-blue-200 text-blue-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
              Payable 5th Commission Report
            </button>
            <button onClick={() => navigate('/reports/paid-5th-commission')} className="w-full text-left bg-green-100 hover:bg-green-200 text-green-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
              Paid 5th Commission Report
            </button>
            <button onClick={() => navigate('/reports/payable-6th-commission')} className="w-full text-left bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
              Payable 6th Commission Report
            </button>
            <button onClick={() => navigate('/reports/paid-6th-commission')} className="w-full text-left bg-pink-100 hover:bg-pink-200 text-pink-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
              Paid 6th Commission Report
            </button>
            <button onClick={() => navigate('/reports/sup-payable-6th-commission')} className="w-full text-left bg-purple-100 hover:bg-purple-200 text-purple-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
              Support Payable 6th Commission
            </button>
            <button onClick={() => navigate('/reports/payable-hra')} className="w-full text-left bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
              Payable HRA Report
            </button>
            <button onClick={() => navigate('/reports/paid-hra')} className="w-full text-left bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
              Paid HRA Report
            </button>
            <button onClick={() => navigate('/reports/all-payable')} className="w-full text-left bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
              All Payable Report
            </button>
          </div>
        </div>

        {/* Management Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">DA% Management</h3>
            <p className="text-3xl font-bold text-blue-600">Manage Dearness Allowance percentages</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">HRA% Management</h3>
            <p className="text-3xl font-bold text-green-600">Manage House Rent Allowance percentages</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-purple-800">LWP & HLWP</h3>
            <p className="text-3xl font-bold text-purple-600">Manage Leave Without Pay records</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard; 