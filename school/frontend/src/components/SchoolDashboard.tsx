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
import { Link } from 'react-router-dom';

interface City {
  id: number;
  name: string;
}

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [cityName, setCityName] = useState('NADIAD'); // Default city
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Always logged in
  const [loginError, setLoginError] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    // Set default session
    const sessionData = {
      cityName: 'NADIAD',
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('schoolLoginSession', JSON.stringify(sessionData));
    localStorage.setItem('schoolCityId', '1');
    localStorage.setItem('schoolCityName', 'NADIAD');
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities');
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
    localStorage.removeItem('schoolCityId');
    localStorage.removeItem('schoolCityName');
    window.location.href = window.location.hostname === 'localhost' 
      ? 'http://localhost:5173'
      : '/';
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
      
      const response = await fetch('/api/cities/login', {
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

  // Always show dashboard
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">School Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">City: {cityName}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {dashboardButtons.map((button, index) => (
              <div
                key={index}
                className="relative rounded-lg border border-gray-300 bg-white px-6 py-5 shadow-sm hover:shadow-lg transition-all duration-300 flex items-center space-x-3"
              >
                <div className={`flex-shrink-0 h-10 w-10 ${button.color} rounded-full flex items-center justify-center`}>
                  <button.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={button.route}
                    className="focus:outline-none"
                  >
                    <span className="absolute inset-0" aria-hidden="true" />
                    <p className="text-sm font-medium text-gray-900">{button.title}</p>
                    <p className="text-sm text-gray-500">{button.description}</p>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard; 