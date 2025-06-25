// Environment configuration
const isDevelopment = window.location.hostname === 'localhost';

// Base URLs
export const APP_BASE_URL = isDevelopment ? '' : '/school-app';
export const API_BASE_URL = isDevelopment ? '/api' : '/school-app/api';

// Main application URL
export const MAIN_APP_URL = isDevelopment 
  ? 'http://localhost:5173'
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
}; 