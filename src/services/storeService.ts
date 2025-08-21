import { StoreTime, StoreOverride, TimeSlot, StoreStatus } from '../types/store';
import { apiService } from './apiService';
import { API_CONFIG, DATE_CONFIG, TIME_SLOTS } from '../constants/api';
import moment from 'moment';
import { notificationService } from './notificationService';

class StoreService {
  async getStoreTimes(): Promise<StoreTime[]> {
    try {
      const response = await apiService.get('/store-times/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch store times');
    }
  }

  async getStoreOverrides(): Promise<StoreOverride[]> {
    try {
      const response = await apiService.get('/store-overrides/');
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch store overrides');
    }
  }

  async generateTimeSlots(
    date: string,
    storeTimes: StoreTime[],
    storeOverrides: StoreOverride[]
  ): Promise<TimeSlot[]> {
    try {
      const selectedDate = moment(date);
      const dayOfWeek = selectedDate.day(); // 0-6 (Sunday=0)
      const day = selectedDate.date(); // 1-31
      const month = selectedDate.month() + 1; // 1-12

      const override = storeOverrides.find((o) => o.day === day && o.month === month);

      if (override) {
        if (!override.is_open) { 
          return []; 
        }
        const slots = this.generateSlotsForTimeRange(override.start_time, override.end_time);
        
        // Schedule notification for override opening time
        if (slots.length > 0) {
          notificationService.scheduleStoreOpeningReminder(date, override.start_time);
        }
        
        return slots;
      }

      const storeTime = storeTimes.find((st) => st.day_of_week === dayOfWeek);
      if (!storeTime || !storeTime.is_open) { 
        return []; 
      }
      
      const slots = this.generateSlotsForTimeRange(storeTime.start_time, storeTime.end_time);
      
      // Schedule notification for regular opening time
      if (slots.length > 0) {
        notificationService.scheduleStoreOpeningReminder(date, storeTime.start_time);
      }
      
      return slots;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to generate time slots');
    }
  }

  private generateSlotsForTimeRange(startTime: string, endTime: string): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const start = moment(startTime, 'HH:mm');
    const end = moment(endTime, 'HH:mm');
    
    if (end.isBefore(start)) {
      end.add(1, 'day');
    }

    let current = start.clone();
    while (current.isBefore(end)) {
      slots.push({
        time: current.format('HH:mm'),
        isAvailable: true,
        isSelected: false,
      });
      current.add(30, 'minutes');
    }

    return slots;
  }

  getStoreStatus(
    date: string,
    storeTimes: StoreTime[],
    storeOverrides: StoreOverride[]
  ): StoreStatus {
    try {
      const selectedDate = moment(date);
      const dayOfWeek = selectedDate.day();
      const day = selectedDate.date();
      const month = selectedDate.month() + 1;

      // Check for override first
      const override = storeOverrides.find((o) => o.day === day && o.month === month);
      if (override) {
        return this.calculateStatusFromTimes(override.start_time, override.end_time, override.is_open);
      }

      // Check regular store hours
      const storeTime = storeTimes.find((st) => st.day_of_week === dayOfWeek);
      if (!storeTime) {
        return {
          isOpen: false,
          nextOpening: null,
          nextClosing: null,
          currentStatus: 'closed',
        };
      }

      return this.calculateStatusFromTimes(storeTime.start_time, storeTime.end_time, storeTime.is_open);
    } catch (error: any) {
      console.error('Error getting store status:', error);
      return {
        isOpen: false,
        nextOpening: null,
        nextClosing: null,
        currentStatus: 'closed',
      };
    }
  }

  private calculateStatusFromTimes(startTime: string, endTime: string, isOpen: boolean): StoreStatus {
    if (!isOpen) {
      return {
        isOpen: false,
        nextOpening: startTime,
        nextClosing: null,
        currentStatus: 'closed',
      };
    }

    const now = moment();
    const today = now.format('YYYY-MM-DD');
    const start = moment(`${today} ${startTime}`, 'YYYY-MM-DD HH:mm');
    const end = moment(`${today} ${endTime}`, 'YYYY-MM-DD HH:mm');

    // Handle overnight hours
    if (end.isBefore(start)) {
      end.add(1, 'day');
    }

    const isCurrentlyOpen = now.isBetween(start, end, null, '[]');
    const nextOpening = start.format('HH:mm');
    const nextClosing = end.format('HH:mm');

    let currentStatus: 'open' | 'closed' | 'opening_soon' | 'closing_soon' = 'closed';

    if (isCurrentlyOpen) {
      const timeUntilClose = end.diff(now, 'minutes');
      if (timeUntilClose <= 30) {
        currentStatus = 'closing_soon';
      } else {
        currentStatus = 'open';
      }
    } else {
      const timeUntilOpen = start.diff(now, 'minutes');
      if (timeUntilOpen <= 60 && timeUntilOpen > 0) {
        currentStatus = 'opening_soon';
      }
    }

    return {
      isOpen: isCurrentlyOpen,
      nextOpening: nextOpening,
      nextClosing: nextClosing,
      currentStatus,
    };
  }

  generateDateList(daysAhead: number = DATE_CONFIG.DAYS_AHEAD): string[] {
    const dates: string[] = [];
    const today = moment();

    for (let i = 0; i < daysAhead; i++) {
      const date = today.clone().add(i, 'days');
      dates.push(date.format('YYYY-MM-DD'));
    }

    return dates;
  }

  formatTimeForDisplay(time: string, format: string = DATE_CONFIG.DISPLAY_TIME_FORMAT): string {
    return moment(time, 'HH:mm').format(format);
  }

  formatDateForDisplay(date: string, format: string = DATE_CONFIG.DISPLAY_DATE_FORMAT): string {
    return moment(date).format(format);
  }

  getGreetingMessage(): string {
    return 'Welcome to our store!';
  }
}

export const storeService = new StoreService();
export default storeService;
