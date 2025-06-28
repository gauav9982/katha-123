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
import { API_ENDPOINTS, MAIN_APP_URL, ROUTES } from '../config/routes';

interface City {
  id: number;
  name: string;
}

const SchoolDashboard = () => {
  const navigate = useNavigate();
  const [cityName, setCityName] = useState('Nadiad'); // Default city
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default to logged in
  const [loginError, setLoginError] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState('Nadiad'); // Default city

  // Set default session on component mount
  useEffect(() => {
    console.log('SchoolDashboard: Setting up default session...');
    
    // Check if session already exists
    const existingSession = localStorage.getItem('schoolLoginSession');
    if (!existingSession) {
      // Create default session for Nadiad
      const defaultSession = {
        cityName: 'Nadiad',
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('schoolLoginSession', JSON.stringify(defaultSession));
      localStorage.setItem('schoolCityId', '1');
      localStorage.setItem('schoolCityName', 'Nadiad');
      
      console.log('SchoolDashboard: Default session created for Nadiad');
    } else {
      console.log('SchoolDashboard: Existing session found:', existingSession);
      try {
        const sessionData = JSON.parse(existingSession);
        setCityName(sessionData.cityName || 'Nadiad');
        setIsLoggedIn(true);
      } catch (error) {
        console.error('SchoolDashboard: Error parsing existing session:', error);
        // Reset to default
        setCityName('Nadiad');
        setIsLoggedIn(true);
      }
    }
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CITIES);
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
    window.location.href = MAIN_APP_URL;
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
      
      const response = await fetch(API_ENDPOINTS.CITY_LOGIN, {
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
      route: ROUTES.ADD_TEACHER
    },
    {
      title: 'Teacher List',
      description: 'View and manage all teachers',
      icon: UsersIcon,
      color: 'bg-green-500 hover:bg-green-600',
      route: ROUTES.TEACHER_MANAGEMENT
    },
    // Salary & Allowances
    {
      title: 'Salary Management',
      description: 'Manage teacher salaries',
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500 hover:bg-yellow-600',
      route: ROUTES.SALARY_MANAGEMENT
    },
    {
      title: 'DA% Management',
      description: 'Manage Dearness Allowance',
      icon: CurrencyDollarIcon,
      color: 'bg-orange-500 hover:bg-orange-600',
      route: ROUTES.DA_MANAGEMENT
    },
    {
      title: 'HRA% Management',
      description: 'Manage House Rent Allowance',
      icon: CurrencyDollarIcon,
      color: 'bg-teal-500 hover:bg-teal-600',
      route: ROUTES.HRA_MANAGEMENT
    },
    {
      title: 'LWP & HLWP',
      description: 'Manage Leave Without Pay records',
      icon: CalendarIcon,
      color: 'bg-red-500 hover:bg-red-600',
      route: ROUTES.LWP_MANAGEMENT
    },
    // Reports
    {
      title: 'All Payable Report',
      description: 'Generate Complete All Payable Report',
      icon: DocumentTextIcon,
      color: 'bg-red-600 hover:bg-red-700',
      route: ROUTES.ALL_PAYABLE
    },
    {
      title: 'All Paid Report',
      description: 'Generate Complete All Paid Report',
      icon: DocumentTextIcon,
      color: 'bg-green-600 hover:bg-green-700',
      route: ROUTES.ALL_PAID
    },
    {
      title: 'Different Salary Report',
      description: 'Generate Different Salary Report',
      icon: DocumentTextIcon,
      color: 'bg-cyan-600 hover:bg-cyan-700',
      route: ROUTES.DIFFERENT_SALARY
    },
    // Test Report
    {
      title: 'Test Report',
      description: 'Test routing and API functionality',
      icon: DocumentTextIcon,
      color: 'bg-purple-600 hover:bg-purple-700',
      route: ROUTES.TEST_REPORT
    },
    // Simple Test Report
    {
      title: 'Simple Test',
      description: 'Simple navigation test without API calls',
      icon: DocumentTextIcon,
      color: 'bg-indigo-600 hover:bg-indigo-700',
      route: '/simple-test-report'
    },
    // API Test Report
    {
      title: 'API Test',
      description: 'Test all backend API endpoints',
      icon: DocumentTextIcon,
      color: 'bg-pink-600 hover:bg-pink-700',
      route: '/api-test-report'
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
            {dashboardButtons.map((button, index) => {
              const Icon = button.icon;
              return (
                <Link
                  key={index}
                  to={button.route}
                  onClick={() => {
                    console.log('Navigating to:', button.route);
                    console.log('Button clicked:', button.title);
                  }}
                  className={`${button.color} rounded-lg shadow-lg p-6 text-white transform transition duration-500 hover:scale-105`}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium">{button.title}</h3>
                      <p className="mt-1 text-sm opacity-90">{button.description}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDashboard; 