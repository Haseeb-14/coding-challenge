import {LoginCredentials, AuthResponse, User} from '../types/auth';
import {apiService} from './apiService';
import {API_CONFIG} from '../constants/api';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  constructor() {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn() {
    GoogleSignin.configure({
      webClientId:
        '78369209228-rapaage5kvjpf9fq3moqbfqofco0c3mn.apps.googleusercontent.com',
      offlineAccess: true,
      hostedDomain: '', // Optional
      forceCodeForRefreshToken: true, // Important for getting refresh tokens
    });
  }

  async loginWithEmail(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // First, authenticate with Firebase using email/password
      const userCredential = await auth().signInWithEmailAndPassword(
        credentials.email,
        credentials.password,
      );

      // Get the Firebase user
      const firebaseUser = userCredential.user;

      // If user doesn't have a display name, set it from email
      if (!firebaseUser.displayName) {
        await firebaseUser.updateProfile({
          displayName: credentials.email.split('@')[0], // Use part before @ as display name
        });
      }

      // Also call the mock API to get the token (for compatibility)
      const apiResponse = await apiService.post<AuthResponse>(
        '/auth/',
        credentials,
      );

      // Create user object similar to Google login
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        name: firebaseUser.displayName || credentials.email.split('@')[0],
        photoURL: firebaseUser.photoURL || undefined,
        provider: 'email',
        createdAt:
          firebaseUser.metadata.creationTime || new Date().toISOString(),
        lastLoginAt:
          firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
      };

      // Store user data in AsyncStorage for persistence
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('authToken', apiResponse.data.token);

      return apiResponse.data;
    } catch (error: any) {
      console.error('Email login error:', error);

      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found') {
        // User doesn't exist, create a new account
        try {
          const userCredential = await auth().createUserWithEmailAndPassword(
            credentials.email,
            credentials.password,
          );

          const firebaseUser = userCredential.user;

          // Set display name
          await firebaseUser.updateProfile({
            displayName: credentials.email.split('@')[0],
          });

          // Call the mock API
          const apiResponse = await apiService.post<AuthResponse>(
            '/auth/',
            credentials,
          );

          // Create user object
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || credentials.email.split('@')[0],
            photoURL: firebaseUser.photoURL || undefined,
            provider: 'email',
            createdAt:
              firebaseUser.metadata.creationTime || new Date().toISOString(),
            lastLoginAt:
              firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
          };

          // Store user data
          await AsyncStorage.setItem('user', JSON.stringify(user));
          await AsyncStorage.setItem('authToken', apiResponse.data.token);

          return apiResponse.data;
        } catch (createError: any) {
          console.error('User creation error:', createError);
          throw new Error(
            createError.message || 'Failed to create user account',
          );
        }
      }

      throw new Error(error.message || 'Email login failed');
    }
  }

  async loginWithGoogle(): Promise<AuthResponse> {
    try {
      // Check for Play Services availability
      await GoogleSignin.hasPlayServices();

      // Sign out any previous user first (clears cache)
      await GoogleSignin.signOut();

      // Sign in with Google
      const googleSignInResult = await GoogleSignin.signIn();

      // Verify we got the required tokens
      if (!googleSignInResult.data?.idToken) {
        throw new Error('No ID token received from Google Sign-In');
      }

      // Create Firebase credential
      const googleCredential = auth.GoogleAuthProvider.credential(
        googleSignInResult.data?.idToken,
        // googleSignInResult.data?.accessToken, // Include access token as well
      );

      // Sign in with Firebase
      const userCredential = await auth().signInWithCredential(
        googleCredential,
      );

      // Get fresh ID token
      const idToken = await userCredential.user.getIdToken(true); // Force refresh

      return {
        token: idToken,
      };
    } catch (error: any) {
      console.log('Google Sign-In Error:', error);

      // Handle specific error cases
      if (error.code === 'auth/internal-error') {
        // Try signing out and retrying once
        try {
          await GoogleSignin.signOut();
          await auth().signOut();
          throw new Error('Authentication failed. Please try again.');
        } catch (signOutError) {
          console.log('Sign out error:', signOutError);
        }
      }

      // Handle network issues
      if (error.code === 'auth/network-request-failed') {
        throw new Error(
          'Network error. Please check your internet connection.',
        );
      }

      // Handle cancelled sign-in
      if (
        error.code === '12501' ||
        error.message?.includes('SIGN_IN_CANCELLED')
      ) {
        throw new Error('Sign-in was cancelled');
      }

      throw new Error(error.message || 'Google login failed');
    }
  }

  async logout(): Promise<void> {
    try {
      // Check if user is currently signed in before trying to sign out
      const currentUser = auth().currentUser;

      if (currentUser) {
        // Sign out from Firebase only if user is signed in
        await auth().signOut();
        console.log('Firebase sign out successful');
      } else {
        console.log('No user currently signed in to Firebase');
      }

      // Sign out from Google (this might fail if user wasn't signed in with Google)
      try {
        await GoogleSignin.signOut();
        console.log('Google sign out successful');
      } catch (googleError) {
        // Ignore Google sign out errors as user might not have been signed in with Google
        console.log('Google sign out error (ignored):', googleError);
      }

      // Clear any stored tokens
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('authToken');

      console.log('Logout successful');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Even if there's an error, we should still consider logout successful
      // as the user wants to logout
      console.log('Logout completed despite errors');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const currentUser = auth().currentUser;

      if (!currentUser) {
        // Try to get user from AsyncStorage as fallback
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
        return null;
      }

      return {
        id: currentUser.uid,
        email: currentUser.email || '',
        name: currentUser.displayName || '',
        photoURL: currentUser.photoURL || undefined,
        provider:
          currentUser.providerData[0]?.providerId === 'google.com'
            ? 'google'
            : 'email',
        createdAt:
          currentUser.metadata.creationTime || new Date().toISOString(),
        lastLoginAt:
          currentUser.metadata.lastSignInTime || new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Error getting current user:', error);
      // Try to get user from AsyncStorage as fallback
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
      } catch (storageError) {
        console.error('Error reading from AsyncStorage:', storageError);
      }
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const currentUser = auth().currentUser;
      return currentUser !== null;
    } catch (error: any) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  onAuthStateChanged(callback: (user: User | null) => void) {
    return auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || undefined,
          provider:
            firebaseUser.providerData[0]?.providerId === 'google.com'
              ? 'google'
              : 'email',
          createdAt:
            firebaseUser.metadata.creationTime || new Date().toISOString(),
          lastLoginAt:
            firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
        };
        
        // Sync with AsyncStorage
        try {
          await AsyncStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.error('Error syncing user to AsyncStorage:', error);
        }
        
        callback(user);
      } else {
        // Clear AsyncStorage when user is null
        try {
          await AsyncStorage.removeItem('user');
          await AsyncStorage.removeItem('authToken');
        } catch (error) {
          console.error('Error clearing AsyncStorage:', error);
        }
        
        callback(null);
      }
    });
  }

  async verifyToken(_token: string): Promise<User | null> {
    try {
      const response = await apiService.get<{
        email: string;
        name: string;
        userId: string;
        role: string;
        permissions: string[];
        createdAt: string;
        updatedAt: string;
      }>(`${API_CONFIG.ENDPOINTS.AUTH}verify`, true);

      return {
        id: response.data.userId,
        email: response.data.email,
        name: response.data.name,
        provider: 'email',
        createdAt: response.data.createdAt,
        lastLoginAt: response.data.updatedAt,
      };
    } catch (error: any) {
      console.error('Token verification failed:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
