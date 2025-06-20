// src/config.ts

// Determine if we are in a development environment
const isDevelopment = import.meta.env.DEV;

// Check for the custom environment variable to decide which DB to use
// VITE_USE_LOCAL_DB=true npm run dev
const useLocalDb = import.meta.env.VITE_USE_LOCAL_DB === 'true';

// We are considered to be using the "live server" if we are *not* in development,
// OR if we are in development but VITE_USE_LOCAL_DB is *not* set to true.
const isLiveServer = !isDevelopment || !useLocalDb;

const serverUrl = 'http://168.231.122.33'; // Live server IP (Nginx handles port)
const localUrl = 'http://localhost:4001';   // Base URL for local backend

const baseUrl = isLiveServer ? serverUrl : localUrl;
const apiUrl = `${baseUrl}/api`;

// For the status component
const config = {
  isLiveServer,
  serverUrl,
  localUrl,
  apiUrl,
};
export default config;

// For the rest of the app
export const API_URL = {
  BASE: apiUrl,
  ITEMS: `${apiUrl}/items`,
  PURCHASES: `${apiUrl}/purchases`,
  CATEGORIES: `${apiUrl}/categories`,
  PURCHASE_ITEMS: `${apiUrl}/purchase-items`,
  CASH_SALES: `${apiUrl}/cashsales`,
  CASH_SALE_ITEMS: `${apiUrl}/cashsale-items`,
  CREDIT_SALES: `${apiUrl}/creditsales`,
  GROUPS: `${apiUrl}/groups`,
  PARTIES: `${apiUrl}/parties`,
  DELIVERY_CHALANS: `${apiUrl}/delivery-chalans`,
  DELIVERY_CHALAN_ITEMS: `${apiUrl}/delivery-chalan-items`,
  PAYMENTS: `${apiUrl}/payments`,
  PENDING_PURCHASES: `${apiUrl}/pending-purchases`,
  REPORTS: {
    STOCK_BY_GROUP: `${apiUrl}/reports/stock-by-group`,
    STOCK_BY_CATEGORY: `${apiUrl}/reports/stock-by-category`,
    STOCK_BY_ITEM: `${apiUrl}/reports/stock-by-item`,
    ITEM_TRANSACTIONS: `${apiUrl}/reports/item-transactions`,
  },
};
