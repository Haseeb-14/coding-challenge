export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
  provider: 'google' | 'email';
  createdAt: string;
  lastLoginAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;  // Only token from API
}

export interface GoogleSignInResult {
  user: {
    id: string;
    email: string;
    name: string;
    photoURL?: string;
  };
  idToken: string;
}

export interface AuthError {
  code: string;
  message: string;
}
