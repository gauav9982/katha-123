import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Purchase {
  id?: number;
  invoice_number: string;
  purchase_date?: string;
  invoice_date?: string;
  vendor_name: string;
  subtotal: number;
  total_gst: number;
  grand_total: number;
  items?: any[];
}

interface AppState {
  isDarkMode: boolean;
  todayStats: {
    cashSales: number;
    creditSales: number;
    purchases: number;
    transactions: number;
  };
  searchQuery: string;
  searchResults: any[];
  alert: {
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };
  companyInfo: {
    name: string;
    address: string;
    contact: string;
  };
  updatedPurchase: Purchase | null;
  purchases: Purchase[];
}

const initialState: AppState = {
  isDarkMode: false,
  todayStats: {
    cashSales: 0,
    creditSales: 0,
    purchases: 0,
    transactions: 0,
  },
  searchQuery: '',
  searchResults: [],
  alert: {
    show: false,
    message: '',
    type: 'info',
  },
  companyInfo: {
    name: 'Katha Sales',
    address: '9, Om Shiv Park, Nr. BSNL Office, Pij Road, Nadiad',
    contact: '9898986217',
  },
  updatedPurchase: null,
  purchases: [],
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    updateTodayStats: (state, action: PayloadAction<Partial<AppState['todayStats']>>) => {
      state.todayStats = { ...state.todayStats, ...action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<any[]>) => {
      state.searchResults = action.payload;
    },
    showAlert: (state, action: PayloadAction<{ message: string; type: 'success' | 'error' | 'info' | 'warning' }>) => {
      state.alert = {
        show: true,
        message: action.payload.message,
        type: action.payload.type,
      };
    },
    hideAlert: (state) => {
      state.alert = {
        show: false,
        message: '',
        type: 'info',
      };
    },
    setUpdatedPurchase: (state, action: PayloadAction<Purchase>) => {
      state.updatedPurchase = action.payload;
    },
    clearUpdatedPurchase: (state) => {
      state.updatedPurchase = null;
    },
    updatePurchase: (state, action: PayloadAction<Purchase>) => {
      state.purchases = state.purchases.map(p => 
        p.id === action.payload.id ? action.payload : p
      );
    },
    setPurchases: (state, action: PayloadAction<Purchase[]>) => {
      state.purchases = action.payload;
    },
  },
});

export const {
  toggleDarkMode,
  updateTodayStats,
  setSearchQuery,
  setSearchResults,
  showAlert,
  hideAlert,
  setUpdatedPurchase,
  clearUpdatedPurchase,
  updatePurchase,
  setPurchases,
} = appSlice.actions;

export default appSlice.reducer; 