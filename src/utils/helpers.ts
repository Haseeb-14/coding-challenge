import moment from 'moment';
import 'moment-timezone';

export const helpers = {
  // Date and Time helpers
  formatDate: (date: string | Date, format: string = 'MMM DD, YYYY'): string => {
    return moment(date).format(format);
  },

  formatTime: (time: string, format: string = 'h:mm A'): string => {
    return moment(time, 'HH:mm').format(format);
  },

  getCurrentTime: (timezone: 'local' | 'nyc' = 'nyc'): string => {
    const now = timezone === 'nyc' 
      ? moment().tz('America/New_York')
      : moment();
    return now.format('HH:mm');
  },

  getCurrentDate: (timezone: 'local' | 'nyc' = 'nyc'): string => {
    const now = timezone === 'nyc' 
      ? moment().tz('America/New_York')
      : moment();
    return now.format('YYYY-MM-DD');
  },

  isToday: (date: string): boolean => {
    return moment(date).isSame(moment(), 'day');
  },

  isTomorrow: (date: string): boolean => {
    return moment(date).isSame(moment().add(1, 'day'), 'day');
  },

  // String helpers
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  truncate: (str: string, length: number): string => {
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
  },

  // Array helpers
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  unique: <T>(array: T[]): T[] => {
    return [...new Set(array)];
  },

  // Object helpers
  isEmpty: (obj: any): boolean => {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    if (obj instanceof Map || obj instanceof Set) return obj.size === 0;
    if (typeof obj === 'object') return Object.keys(obj).length === 0;
    return false;
  },

  // Number helpers
  formatNumber: (num: number, decimals: number = 2): string => {
    return num.toFixed(decimals);
  },

  clamp: (num: number, min: number, max: number): number => {
    return Math.min(Math.max(num, min), max);
  },

  // Color helpers
  hexToRgba: (hex: string, alpha: number = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  // Async helpers
  delay: (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  retry: async <T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await helpers.delay(delay);
        return helpers.retry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  },

  // Platform helpers
  isIOS: (): boolean => {
    return require('react-native').Platform.OS === 'ios';
  },

  isAndroid: (): boolean => {
    return require('react-native').Platform.OS === 'android';
  },

  // Storage helpers
  safeJsonParse: (json: string, fallback: any = null): any => {
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  },

  safeJsonStringify: (obj: any, fallback: string = ''): string => {
    try {
      return JSON.stringify(obj);
    } catch {
      return fallback;
    }
  },
};
