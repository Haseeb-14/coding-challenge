import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from '../../types/app';

const initialState: AppState = {
  timezone: 'nyc',
  isLoading: false,
  error: null,
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTimezone: (state, action: PayloadAction<'local' | 'nyc'>) => {
      state.timezone = action.payload;
    },
    toggleTimezone: (state) => {
      state.timezone = state.timezone === 'local' ? 'nyc' : 'local';
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setTimezone, 
  toggleTimezone, 
  setLoading, 
  setError, 
  clearError 
} = appSlice.actions;

export default appSlice.reducer;
