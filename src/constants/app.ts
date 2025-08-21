export const APP_CONFIG = {
  NAME: 'PerDiem Store',
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
} as const;

export const TIMEZONES = {
  NYC: 'America/New_York',
  LOCAL: 'local',
} as const;

export const TIME_SLOTS = {
  INTERVAL_MINUTES: 30,
  START_HOUR: 0,
  END_HOUR: 24,
} as const;

export const GREETING_MESSAGES = {
  MORNING: {
    start: 5,
    end: 9,
    message: 'Good Morning, NYC!',
  },
  LATE_MORNING: {
    start: 10,
    end: 11,
    message: 'Late Morning Vibes! NYC',
  },
  AFTERNOON: {
    start: 12,
    end: 16,
    message: 'Good Afternoon, NYC!',
  },
  EVENING: {
    start: 17,
    end: 20,
    message: 'Good Evening, NYC!',
  },
  NIGHT: {
    start: 21,
    end: 4,
    message: 'Night Owl in NYC!',
  },
} as const;

export const STORE_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
} as const;

export const NOTIFICATION_CONFIG = {
  STORE_OPENING_REMINDER: {
    id: 'store_opening_reminder',
    title: 'Store Opening Reminder',
    message: 'The store will open in 1 hour!',
    delay: 3600000, // 1 hour in milliseconds
  },
} as const;

export const AUTH_CONFIG = {
  TEST_EMAIL: 'user@tryperdiem.com',
  TEST_PASSWORD: 'password',
} as const;

export const DATE_CONFIG = {
  DAYS_AHEAD: 30,
  DATE_FORMAT: 'YYYY-MM-DD',
  TIME_FORMAT: 'HH:mm',
  DISPLAY_DATE_FORMAT: 'MMM DD, YYYY',
  DISPLAY_TIME_FORMAT: 'h:mm A',
} as const;
