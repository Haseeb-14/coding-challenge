export interface AppState {
  timezone: 'local' | 'nyc';
  isLoading: boolean;
  error: string | null;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

export interface Theme {
  isDark: boolean;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  data?: any;
  date: Date;
}

export interface TimezoneInfo {
  name: string;
  offset: string;
  currentTime: string;
  displayName: string;
}
