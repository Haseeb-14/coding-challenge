export const API_CONFIG = {
  BASE_URL: 'https://coding-challenge-pd-1a25b1a14f34.herokuapp.com',
  CREDENTIALS: {
    username: 'perdiem',
    password: 'perdiem',
  },
  ENDPOINTS: {
    AUTH: '/auth/',
    STORE_TIMES: '/store-times/',
    STORE_OVERRIDES: '/store-overrides/',
  },
  TIMEOUT: 30000, // 30 seconds
} as const;

export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const;

export const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

export const API_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const DATE_CONFIG = {
  DAYS_AHEAD: 30,
  DISPLAY_DATE_FORMAT: 'MMM DD, YYYY',
  DISPLAY_TIME_FORMAT: 'h:mm A',
  API_DATE_FORMAT: 'YYYY-MM-DD',
  API_TIME_FORMAT: 'HH:mm',
} as const;

export const TIME_SLOTS = {
  INTERVAL_MINUTES: 30,
  START_TIME: '09:00',
  END_TIME: '18:00',
} as const;
