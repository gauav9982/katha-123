import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Bars3Icon, 
  XMarkIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  TagIcon,
  CubeIcon,
  ShoppingCartIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  ReceiptRefundIcon,
  BanknotesIcon,
  HomeIcon,
  PhoneIcon,
  MapPinIcon,
  ServerIcon,
  ComputerDesktopIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import AlertMessage from '../components/AlertMessage';
import config from '../config';
import logoSvg from '../assets/logo.svg';
import axios from 'axios';
import ItemQuickSearch from '../components/ItemQuickSearch';
import { FaHome } from 'react-icons/fa';

// Database Connection Status Component
const DatabaseStatus = () => {
  const [isLive, setIsLive] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setIsLoading(true);
      const url = config.isLiveServer ? config.serverUrl : config.localUrl;
      const liveStatus = config.isLiveServer;
      setIsLive(liveStatus);
      try {
        await axios.get(url); // Check the API base URL directly
        setIsConnected(true);
      } catch (error) {
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center px-3 py-1 text-xs">
        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-600 mr-2"></div>
        Checking connection...
      </div>
    );
  }

  return (
    <div className={`flex items-center px-3 py-1 text-xs rounded-full ${
      isConnected 
        ? 'bg-green-100 text-green-800' 
        : 'bg-red-100 text-red-800'
    }`}>
      {config.isLiveServer ? (
        <ServerIcon className="h-3 w-3 mr-1" />
      ) : (
        <ComputerDesktopIcon className="h-3 w-3 mr-1" />
      )}
      {config.isLiveServer ? 'Live Server' : 'Local DB'}
      <div className={`ml-1 h-2 w-2 rounded-full ${
        isConnected ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
    </div>
  );
};

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const companyInfo = useSelector((state: RootState) => state.app.companyInfo);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    // Navigate back to main website
    navigate('/');
  };
  
  const sidebarLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Group', path: '/dashboard/forms/group', icon: UserGroupIcon },
    { name: 'Category', path: '/dashboard/forms/category', icon: TagIcon },
    { name: 'Item', path: '/dashboard/forms/item', icon: CubeIcon },
    { name: 'Purchase', path: '/dashboard/forms/purchase', icon: ShoppingCartIcon },
    { name: 'Cash Sales', path: '/dashboard/forms/cash-sale', icon: CurrencyRupeeIcon },
    { name: 'Credit Sales', path: '/dashboard/forms/credit-sale', icon: CurrencyRupeeIcon },
    { name: 'Delivery Chalan', path: '/dashboard/forms/delivery-chalan-form', icon: TruckIcon },
    { name: 'Reports', path: '/dashboard/reports/stock', icon: ChartBarIcon },
    { name: 'Party Account', path: '/dashboard/forms/party', icon: UserGroupIcon },
    { name: 'Party List', path: '/dashboard/lists/payment-list', icon: UserGroupIcon },
    { name: 'Payment', path: '/dashboard/forms/payment', icon: BanknotesIcon },
    { name: 'Receipt', path: '/dashboard/forms/receipt', icon: ReceiptRefundIcon },
  ];
  
  const topMenuLinks = [
    { name: 'Group', path: '/dashboard/forms/group' },
    { name: 'Category', path: '/dashboard/forms/category' },
    { name: 'Item', path: '/dashboard/forms/item' },
    { name: 'Group List', path: '/dashboard/lists/group-list' },
    { name: 'Category List', path: '/dashboard/lists/category-list' },
    { name: 'Item List', path: '/dashboard/lists/item-list' },
    { name: 'Stock Report', path: '/dashboard/reports/stock' },
    { name: 'Item Transactions', path: '/dashboard/reports/item-transactions' },
  ];
  
  const bottomMenuLinks = [
    { name: 'Purchase', path: '/dashboard/forms/purchase' },
    { name: 'Cash Sales', path: '/dashboard/forms/cash-sale' },
    { name: 'Credit Sales', path: '/dashboard/forms/credit-sale' },
    { name: 'Delivery Chalan', path: '/dashboard/forms/delivery-chalan-form' },
    { name: 'Purchase List', path: '/dashboard/lists/purchase-list' },
    { name: 'Cash Sales List', path: '/dashboard/lists/cashsale-list' },
    { name: 'Credit Sales List', path: '/dashboard/lists/creditsale-list' },
    { name: 'Delivery Chalan List', path: '/dashboard/lists/delivery-chalan-list' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Alert Message */}
      <AlertMessage />
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <div className="flex items-center">
            <img src={logoSvg} alt="Logo" className="h-8 w-8" />
            <span className="ml-2 text-xl font-semibold">{companyInfo.name}</span>
          </div>
          <button onClick={toggleSidebar} className="lg:hidden">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-5 px-2 flex flex-col h-full">
          <div className="flex-1">
            {sidebarLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  location.pathname === link.path
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <link.icon className="mr-4 h-6 w-6" />
                {link.name}
              </Link>
            ))}
          </div>
          
          {/* Logout Button at bottom */}
          <div className="border-t border-gray-200 pt-4 pb-4">
            <button
              onClick={handleLogout}
              className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 w-full"
            >
              <ArrowRightOnRectangleIcon className="mr-4 h-6 w-6" />
              Logout
            </button>
          </div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Navigation */}
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            onClick={toggleSidebar}
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1">
              <div className="flex w-full md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MagnifyingGlassIcon className="h-5 w-5" />
                  </div>
                  <input
                    className="block h-full w-full rounded-md border-transparent bg-gray-50 py-2 pl-10 pr-3 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Search"
                    type="search"
                  />
                </div>
              </div>
            </div>
            
            <div className="ml-4 flex items-center md:ml-6">
              {/* Database Connection Status */}
              <div className="mr-4">
                <DatabaseStatus />
              </div>
              
              <div ref={menuRef}>
                <button
                  onClick={toggleMenu}
                  className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Open user menu</span>
                  <UserGroupIcon className="h-6 w-6" />
                </button>

                {/* Top Menu Dropdown */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Master Data
                      </div>
                      {topMenuLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.name}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 my-1"></div>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Transactions
                      </div>
                      {bottomMenuLinks.map((link) => (
                        <Link
                          key={link.path}
                          to={link.path}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.name}
                        </Link>
                      ))}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          handleLogout();
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Page Content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const HomePageContent = () => {
  const location = useLocation();

  if (location.pathname === '/') {
    return (
      <div className="p-8">
        <h1 className="text-6xl font-bold text-red-600 text-center animate-pulse">
          I AM BEST!
        </h1>
      </div>
    );
  }

  return null;
};

export default MainLayout; 