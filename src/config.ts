// API Configuration
const isDevelopment = import.meta.env.DEV;
const isLocalDatabase = import.meta.env.VITE_USE_LOCAL_DB === 'true';

// Base URL configuration
const BASE_URL = isDevelopment && !isLocalDatabase 
  ? 'http://168.231.122.33/api'  // Live server (via Nginx on port 80)
  : isDevelopment 
    ? 'http://localhost:4001'     // Local development
    : '/api';                     // Production (relative path)

export const API_URL = {
  BASE: BASE_URL,
  GROUPS: `${BASE_URL}/groups`,
  CATEGORIES: `${BASE_URL}/categories`,
  ITEMS: `${BASE_URL}/items`,
  PARTIES: `${BASE_URL}/parties`,
  PURCHASES: `${BASE_URL}/purchases`,
  PURCHASE_ITEMS: `${BASE_URL}/purchase-items`,
  CREDITSALES: `${BASE_URL}/creditsales`,
  CREDITSALE_ITEMS: `${BASE_URL}/creditsale-items`,
  DELIVERY_CHALANS: `${BASE_URL}/delivery-chalans`,
  DELIVERY_CHALAN_ITEMS: `${BASE_URL}/delivery-chalan-items`,
  PAYMENTS: `${BASE_URL}/payments`,
  PENDING_PURCHASES: `${BASE_URL}/pending-purchases`,
  CASHSALES: `${BASE_URL}/cashsales`,
  CASHSALE_ITEMS: `${BASE_URL}/cashsale-items`,
  REPORTS: {
    STOCK_BY_GROUP: `${BASE_URL}/reports/stock-by-group`,
    STOCK_BY_CATEGORY: `${BASE_URL}/reports/stock-by-category`,
    STOCK_BY_ITEM: `${BASE_URL}/reports/stock-by-item`,
    ITEM_TRANSACTIONS: `${BASE_URL}/reports/item-transactions`
  }
};

// Database connection info
export const DATABASE_INFO = {
  isLiveServer: isDevelopment && !isLocalDatabase,
  serverUrl: 'http://168.231.122.33/api', // Check health via Nginx
  localUrl: 'http://localhost:4001'
}; 