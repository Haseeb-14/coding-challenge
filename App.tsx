/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect} from 'react';
import { StatusBar, StyleSheet, useColorScheme} from 'react-native';
import { Provider, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Store
import { store, persistor, AppDispatch } from './src/store';

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Services
import { authService } from './src/services/authService';
import { notificationService } from './src/services/notificationService';

// Actions
import { setUser } from './src/store/slices/authSlice';
import { loadUserBookingsThunk } from './src/store/slices/storeSlice';

// Constants
import { Colors } from './src/constants/colors';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Set up auth state listener
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      if (user) {
        dispatch(setUser(user));
        // Load user-specific bookings
        dispatch(loadUserBookingsThunk(user.id));
      } else {
        // User is null, which means logged out
        // This will be handled by the logout action
      }
    });

    // Initialize notification service
    notificationService.configure().catch(error => {
      console.error('Failed to configure notification service:', error);
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <SafeAreaProvider>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={Colors.background}
      />
      <AppNavigator />
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
