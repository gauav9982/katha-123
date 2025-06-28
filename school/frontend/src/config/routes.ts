// Environment configuration
const isDevelopment = window.location.hostname === 'localhost';

// Port configuration
export const APP_PORT = isDevelopment ? 5180 : 80;
export const MAIN_APP_PORT = isDevelopment ? 5173 : 80;

// Base URLs
export const APP_BASE_URL = isDevelopment ? '' : '/school-app';
export const API_BASE_URL = isDevelopment ? '/api' : '/school-app/api';

// Main application URL
export const MAIN_APP_URL = isDevelopment 
  ? `http://localhost:${MAIN_APP_PORT}`
  : window.location.protocol + '//' + window.location.hostname;

// API endpoints
export const API_ENDPOINTS = {
  CITIES: `${API_BASE_URL}/cities`,
  CITY_LOGIN: `${API_BASE_URL}/cities/login`,
  // Add other endpoints here
};

// Application routes
export const ROUTES = {
  DASHBOARD: '/dashboard',
  LOGIN_DEBUG: '/login-debug',
  TEACHER_MANAGEMENT: '/teacher-management',
  ADD_TEACHER: '/add-teacher',
  EDIT_TEACHER: '/edit-teacher',
  SALARY_MANAGEMENT: '/salary-management',
  HRA_MANAGEMENT: '/hra-management',
  DA_MANAGEMENT: '/da-management',
  LWP_MANAGEMENT: '/lwp-management',
  ALL_PAYABLE: '/all-payable',
  ALL_PAID: '/all-paid',
  DIFFERENT_SALARY: '/different-salary',
  TEST_REPORT: '/test-report',
  // Report Routes
  PAYABLE_5TH_COMMISSION: '/reports/payable-5th-commission',
  PAID_5TH_COMMISSION: '/reports/paid-5th-commission',
  PAYABLE_6TH_COMMISSION: '/reports/payable-6th-commission',
  PAID_6TH_COMMISSION: '/reports/paid-6th-commission',
  SUP_PAYABLE_6TH_COMMISSION: '/reports/sup-payable-6th-commission',
  SUP_PAID_6TH_COMMISSION: '/reports/sup-paid-6th-commission',
  PAYABLE_7TH_COMMISSION: '/reports/payable-7th-commission',
  PAID_7TH_COMMISSION: '/reports/paid-7th-commission',
  SUP_PAYABLE_5TH_COMMISSION: '/reports/sup-payable-5th-commission',
  SUP_PAID_5TH_COMMISSION: '/reports/sup-paid-5th-commission',
  PAYABLE_HRA: '/reports/payable-hra',
  PAID_HRA: '/reports/paid-hra',
}; 