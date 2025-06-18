import axios from 'axios';

// API Base URL based on environment
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'http://168.231.122.33:4000'  // Production URL
  : 'http://localhost:4001';      // Development URL

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints
export const endpoints = {
  // Items
  items: {
    list: () => api.get('/api/items'),
    getById: (id: number) => api.get(`/api/items/${id}`),
    create: (data: any) => api.post('/api/items', data),
    update: (id: number, data: any) => api.put(`/api/items/${id}`, data),
    delete: (id: number) => api.delete(`/api/items/${id}`),
  },
  
  // Customers
  customers: {
    list: () => api.get('/api/customers'),
    getById: (id: number) => api.get(`/api/customers/${id}`),
    create: (data: any) => api.post('/api/customers', data),
    update: (id: number, data: any) => api.put(`/api/customers/${id}`, data),
    delete: (id: number) => api.delete(`/api/customers/${id}`),
  },

  // Sales
  sales: {
    list: () => api.get('/api/sales'),
    getById: (id: number) => api.get(`/api/sales/${id}`),
    create: (data: any) => api.post('/api/sales', data),
    update: (id: number, data: any) => api.put(`/api/sales/${id}`, data),
    delete: (id: number) => api.delete(`/api/sales/${id}`),
  },

  // Purchases
  purchases: {
    list: () => api.get('/api/purchases'),
    getById: (id: number) => api.get(`/api/purchases/${id}`),
    create: (data: any) => api.post('/api/purchases', data),
    update: (id: number, data: any) => api.put(`/api/purchases/${id}`, data),
    delete: (id: number) => api.delete(`/api/purchases/${id}`),
  },
};

export default api; 