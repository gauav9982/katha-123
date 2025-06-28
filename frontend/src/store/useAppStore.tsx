import { create } from 'zustand';
import { showAlert, hideAlert } from './appSlice';

interface AppStore {
  showAlert: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
  hideAlert: () => void;
}

const useAppStore = create<AppStore>((set) => ({
  showAlert: (message, type) => {
    set((state) => ({
      ...state,
      alert: {
        show: true,
        message,
        type,
      },
    }));
  },
  hideAlert: () => {
    set((state) => ({
      ...state,
      alert: {
        show: false,
        message: '',
        type: 'info',
      },
    }));
  },
}));

export default useAppStore; 