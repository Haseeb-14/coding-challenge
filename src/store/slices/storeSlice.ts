import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { StoreTime, StoreOverride, Booking, StoreState } from '../../types/store';
import { storeService } from '../../services/storeService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const initialState: StoreState = {
  storeTimes: [],
  storeOverrides: [],
  selectedDate: null,
  selectedTime: null,
  isLoading: false,
  error: null,
  bookings: [],
  isBookingLoading: false,
};

// Async thunks
export const fetchStoreTimes = createAsyncThunk(
  'store/fetchStoreTimes',
  async () => {
    const response = await storeService.getStoreTimes();
    return response;
  }
);

export const fetchStoreOverrides = createAsyncThunk(
  'store/fetchStoreOverrides',
  async () => {
    const response = await storeService.getStoreOverrides();
    return response;
  }
);

// Helper function to get user-specific storage key
const getBookingsStorageKey = (userId: string) => `bookings_${userId}`;

// Helper function to load user-specific bookings
const loadUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const storageKey = getBookingsStorageKey(userId);
    const storedBookings = await AsyncStorage.getItem(storageKey);
    return storedBookings ? JSON.parse(storedBookings) : [];
  } catch (error) {
    console.error('Error loading user bookings:', error);
    return [];
  }
};

// Helper function to save user-specific bookings
const saveUserBookings = async (userId: string, bookings: Booking[]): Promise<void> => {
  try {
    const storageKey = getBookingsStorageKey(userId);
    await AsyncStorage.setItem(storageKey, JSON.stringify(bookings));
  } catch (error) {
    console.error('Error saving user bookings:', error);
  }
};

export const createBooking = createAsyncThunk(
  'store/createBooking',
  async ({ date, time, userId }: { date: string; time: string; userId: string }, { getState }) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));

    const newBooking: Booking = {
      id: Date.now().toString(),
      date,
      time,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      userId,
    };

    // Save to user-specific storage
    const currentState = getState() as { store: StoreState };
    const currentBookings = currentState.store.bookings;
    const updatedBookings = [...currentBookings, newBooking];
    
    // Save to AsyncStorage for this specific user
    await saveUserBookings(userId, updatedBookings);

    return newBooking;
  }
);

export const cancelBooking = createAsyncThunk(
  'store/cancelBooking',
  async ({ bookingId, userId }: { bookingId: string; userId: string }, { getState }) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));

    const currentState = getState() as { store: StoreState };
    const currentBookings = currentState.store.bookings;
    const updatedBookings = currentBookings.map(booking =>
      booking.id === bookingId ? { ...booking, status: 'cancelled' as const } : booking
    );

    // Save to AsyncStorage for this specific user
    await saveUserBookings(userId, updatedBookings);

    return { bookingId, status: 'cancelled' };
  }
);

// New thunk to load user-specific bookings
export const loadUserBookingsThunk = createAsyncThunk(
  'store/loadUserBookings',
  async (userId: string) => {
    const bookings = await loadUserBookings(userId);
    return bookings;
  }
);

const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    setSelectedDate: (state, action: PayloadAction<string | null>) => {
      state.selectedDate = action.payload;
    },
    setSelectedTime: (state, action: PayloadAction<string | null>) => {
      state.selectedTime = action.payload;
    },
    setDefaultDate: (state) => {
      const today = new Date().toISOString().split('T')[0];
      state.selectedDate = today;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelection: (state) => {
      state.selectedDate = null;
      state.selectedTime = null;
    },
    // Clear all data when user logs out
    clearStoreData: (state) => {
      state.storeTimes = [];
      state.storeOverrides = [];
      state.selectedDate = null;
      state.selectedTime = null;
      state.isLoading = false;
      state.error = null;
      state.bookings = [];
      state.isBookingLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoreTimes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStoreTimes.fulfilled, (state, action: PayloadAction<StoreTime[]>) => {
        state.isLoading = false;
        state.storeTimes = action.payload;
        if (!state.selectedDate) {
          const today = new Date().toISOString().split('T')[0];
          state.selectedDate = today;
        }
      })
      .addCase(fetchStoreTimes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch store times';
      })
      .addCase(fetchStoreOverrides.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStoreOverrides.fulfilled, (state, action: PayloadAction<StoreOverride[]>) => {
        state.isLoading = false;
        state.storeOverrides = action.payload;
      })
      .addCase(fetchStoreOverrides.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch store overrides';
      })
      .addCase(createBooking.pending, (state) => {
        state.isBookingLoading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action: PayloadAction<Booking>) => {
        state.isBookingLoading = false;
        state.bookings.push(action.payload);
        state.selectedTime = null; // Clear selection after booking
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isBookingLoading = false;
        state.error = action.error.message || 'Failed to create booking';
      })
      .addCase(cancelBooking.pending, (state) => {
        state.isBookingLoading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        const { bookingId, status } = action.payload;
        const booking = state.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = status as 'cancelled' | 'confirmed' | 'pending';
        }
        state.isBookingLoading = false;
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.isBookingLoading = false;
        state.error = action.error.message || 'Failed to cancel booking';
      })
      // Handle loadUserBookings
      .addCase(loadUserBookingsThunk.pending, (state) => {
        state.isBookingLoading = true;
      })
      .addCase(loadUserBookingsThunk.fulfilled, (state, action) => {
        state.bookings = action.payload;
        state.isBookingLoading = false;
      })
      .addCase(loadUserBookingsThunk.rejected, (state) => {
        state.isBookingLoading = false;
      });
  },
});

export const { 
  setSelectedDate, 
  setSelectedTime, 
  setDefaultDate, 
  clearError, 
  clearSelection,
  clearStoreData 
} = storeSlice.actions;

export default storeSlice.reducer;
