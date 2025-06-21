import { configureStore } from '@reduxjs/toolkit';
import appReducer from './appSlice';

const store = configureStore({
  reducer: {
    app: appReducer,
  },
});

// Define types
type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;

// Export store and types
export { store };
export type { RootState, AppDispatch }; 