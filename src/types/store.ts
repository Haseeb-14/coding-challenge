export interface StoreTime {
  id: string;
  day_of_week: number;  // 0-6 (Sunday=0)
  is_open: boolean;
  start_time: string;   // "HH:mm" format
  end_time: string;     // "HH:mm" format
}

export interface StoreOverride {
  id: string;
  day: number;         // 1-31
  month: number;       // 1-12
  is_open: boolean;
  start_time: string;  // "HH:mm" format
  end_time: string;    // "HH:mm" format
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isSelected: boolean;
}

export interface Booking {
  id: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
  userId: string;
}

export interface StoreState {
  storeTimes: StoreTime[];
  storeOverrides: StoreOverride[];
  selectedDate: string | null;
  selectedTime: string | null;
  isLoading: boolean;
  error: string | null;
  bookings: Booking[];
  isBookingLoading: boolean;
}

export interface StoreStatus {
  isOpen: boolean;
  nextOpening: string | null;
  nextClosing: string | null;
  currentStatus: 'open' | 'closed' | 'opening_soon' | 'closing_soon';
}

export interface DateSelection {
  date: string;
  timeSlots: TimeSlot[];
  storeStatus: StoreStatus;
}
