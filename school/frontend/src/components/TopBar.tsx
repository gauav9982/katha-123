import React, { Fragment } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HomeIcon, ArrowRightOnRectangleIcon, UsersIcon, CurrencyDollarIcon, CalendarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';

const otherReports = [
  { name: 'Payable 5th Commission', href: '/reports/payable-5th-commission' },
  { name: 'Paid 5th Commission', href: '/reports/paid-5th-commission' },
  { name: 'Sup-Payable 5th Report', href: '/reports/sup-payable-5th-commission' },
  { name: 'Sup-Paid 5th Report', href: '/reports/sup-paid-5th-commission' },
  { name: 'Payable 6th Commission', href: '/reports/payable-6th-commission' },
  { name: 'Paid 6th Commission', href: '/reports/paid-6th-commission' },
  { name: 'Sup-Payable 6th Report', href: '/reports/sup-payable-6th-commission' },
  { name: 'Sup-Paid 6th Report', href: '/reports/sup-paid-6th-commission' },
  { name: 'Payable 7th Commission', href: '/reports/payable-7th-commission' },
  { name: 'Paid 7th Commission', href: '/reports/paid-7th-commission' },
  { name: 'Payable HRA Report', href: '/reports/payable-hra' },
  { name: 'Paid HRA Report', href: '/reports/paid-hra' },
];

const TopBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear session
    localStorage.removeItem('schoolLoginSession');
    // Redirect to main application (using port 5173)
    window.location.href = 'http://localhost:5173';
  };

  return (
    <div className="w-full bg-blue-700 py-2 px-4 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/school')}
          className="flex items-center text-white font-semibold hover:text-yellow-300 focus:outline-none transition-colors"
        >
          <HomeIcon className="h-6 w-6 mr-1" />
          Home
        </button>
        
        <button
          onClick={() => navigate('/teachers')}
          className="flex items-center text-white font-semibold hover:text-yellow-300 focus:outline-none transition-colors"
        >
          <UsersIcon className="h-6 w-6 mr-1" />
          Teachers
        </button>
        
        <button
          onClick={() => navigate('/salary')}
          className="flex items-center text-white font-semibold hover:text-yellow-300 focus:outline-none transition-colors"
        >
          <CurrencyDollarIcon className="h-6 w-6 mr-1" />
          Salary
        </button>
        
        <button
          onClick={() => navigate('/lwp-management')}
          className="flex items-center text-white font-semibold hover:text-yellow-300 focus:outline-none transition-colors"
        >
          <CalendarIcon className="h-6 w-6 mr-1" />
          LWP/HLWP
        </button>

        <Menu as="div" className="relative inline-block text-left">
          <div>
            <Menu.Button className="flex items-center text-white font-semibold hover:text-yellow-300 focus:outline-none transition-colors">
              Other Reports
              <ChevronDownIcon className="h-5 w-5 ml-1" />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
              <div className="px-1 py-1 ">
                {otherReports.map(report => (
                  <Menu.Item key={report.href}>
                    {({ active }) => (
                      <Link
                        to={report.href}
                        className={`${
                          active ? 'bg-blue-500 text-white' : 'text-gray-900'
                        } group flex rounded-md items-center w-full px-2 py-2 text-sm`}
                      >
                        {report.name}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      
      <button
        onClick={handleLogout}
        className="flex items-center text-white font-semibold hover:text-red-300 focus:outline-none transition-colors"
        title="Logout"
      >
        <ArrowRightOnRectangleIcon className="h-6 w-6 mr-1" />
        Logout
      </button>
    </div>
  );
};

export default TopBar; 