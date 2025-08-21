import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {useAppDispatch} from '../hooks/useAppDispatch';
import {useAppSelector} from '../hooks/useAppSelector';
import {
  fetchStoreTimes,
  fetchStoreOverrides,
  setSelectedDate,
  setSelectedTime,
  createBooking,
  clearSelection,
} from '../store/slices/storeSlice';
import {logout} from '../store/slices/authSlice';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DateSelector from '../components/forms/DateSelector';
import TimeSlotGrid from '../components/forms/TimeSlotGrid';
import {Colors} from '../constants/colors';
import {storeService} from '../services/storeService';
import {notificationService} from '../services/notificationService';
import {TimeSlot, StoreStatus} from '../types/store';
import {RootState} from '../store';
import moment from 'moment-timezone';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {toggleTimezone} from '../store/slices/appSlice';
import {NavigationProp, useNavigation} from '@react-navigation/native';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const dispatch = useAppDispatch();
  const {
    storeTimes,
    storeOverrides,
    selectedDate,
    selectedTime,
    isLoading,
    error,
    isBookingLoading,
  } = useAppSelector((state: RootState) => state.store);
  const {user, isLoading: isAuthLoading} = useAppSelector(
    (state: RootState) => state.auth,
  );
  const {timezone} = useAppSelector((state: RootState) => state.app);
  const {top} = useSafeAreaInsets();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  console.log('user>>', user);
  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        dispatch(fetchStoreTimes()).unwrap(),
        dispatch(fetchStoreOverrides()).unwrap(),
      ]);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const generateTimeSlotsForDate = useCallback(
    async (date: string) => {
      try {
        const slots = await storeService.generateTimeSlots(
          date,
          storeTimes,
          storeOverrides,
        );
        setTimeSlots(slots);
      } catch (e) {
        console.error('Failed to generate time slots:', e);
        setTimeSlots([]);
      }
    },
    [storeTimes, storeOverrides],
  );

  const updateStoreStatus = useCallback(
    async (date: string) => {
      try {
        const status = storeService.getStoreStatus(
          date,
          storeTimes,
          storeOverrides,
        );
        setStoreStatus(status);
      } catch (e) {
        console.error('Failed to get store status:', e);
      }
    },
    [storeTimes, storeOverrides],
  );

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-select today's date when store times are loaded
  useEffect(() => {
    if (storeTimes.length > 0 && !selectedDate) {
      const today = new Date().toISOString().split('T')[0];
      dispatch(setSelectedDate(today));

      // Schedule notifications for store openings
      notificationService.scheduleAllStoreReminders(storeTimes, storeOverrides);
    }
  }, [storeTimes, storeOverrides, selectedDate, dispatch]);

  // Generate time slots when date changes
  useEffect(() => {
    if (selectedDate && storeTimes.length > 0) {
      generateTimeSlotsForDate(selectedDate);
      updateStoreStatus(selectedDate);
    }
  }, [
    selectedDate,
    storeTimes,
    storeOverrides,
    timezone,
    generateTimeSlotsForDate,
    updateStoreStatus,
  ]);

  const handleDateSelect = (date: string) => {
    console.log('Date selected:', date, 'Previous selectedTime:', selectedTime);
    dispatch(setSelectedDate(date));
    dispatch(setSelectedTime(null));
    // Don't reset selectedTime when date changes
  };

  const handleTimeSelect = (time: string) => {
    console.log('Time selected:', time, 'Current selectedDate:', selectedDate);
    dispatch(setSelectedTime(time));
  };

  const handleConfirmBooking = async () => {
    console.log(
      'Confirm booking clicked - selectedDate:',
      selectedDate,
      'selectedTime:',
      selectedTime,
      'user:',
      user,
    );

    if (!selectedDate || !selectedTime || !user) {
      Alert.alert(
        'Error',
        `Please select a date and time first.\nDate: ${
          selectedDate || 'Not selected'
        }\nTime: ${selectedTime || 'Not selected'}`,
      );
      return;
    }

    try {
      await dispatch(
        createBooking({
          date: selectedDate,
          time: selectedTime,
          userId: user.id,
        }),
      ).unwrap();

      Alert.alert(
        'Booking Confirmed!',
        `Your booking for ${moment(selectedDate).format(
          'MMM DD, YYYY',
        )} at ${selectedTime} has been confirmed.`,
        [
          {
            text: 'View Bookings',
            onPress: () => {
              // Navigate to bookings tab
              navigation.navigate('Bookings');
            },
          },
          {
            text: 'OK',
            style: 'default',
          },
        ],
      );

      // Clear selection after successful booking
      dispatch(clearSelection());
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm booking. Please try again.');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(logout()).unwrap();
            console.log('Logout successful');
          } catch (e: any) {
            console.error('Logout error:', e);
            if (e && e.message && !e.message.includes('warnings')) {
              Alert.alert('Error', `Logout failed: ${e.message}`);
            } else {
              console.log('Logout completed with warnings');
            }
          }
        },
      },
    ]);
  };

  const toggleTimezoneHandler = () => {
    dispatch(toggleTimezone());
  };

  const getGreetingMessage = () => {
    const currentTime =
      timezone === 'nyc'
        ? moment().tz('America/New_York').format('HH:mm')
        : moment().format('HH:mm');
    const hour = parseInt(currentTime.split(':')[0]);

    if (hour < 12) return 'Good Morning! ☀️';
    if (hour < 17) return 'Good Afternoon! 🌤️';
    return 'Good Evening! 🌙';
  };

  const getCurrentTimeDisplay = () => {
    if (timezone === 'nyc') {
      return moment().tz('America/New_York').format('MMM DD, YYYY HH:mm');
    } else {
      return moment().format('MMM DD, YYYY HH:mm');
    }
  };

  const getStoreStatusColor = () => {
    if (!storeStatus) return Colors.gray[500];
    return storeStatus.isOpen ? Colors.success : Colors.error;
  };

  const getStoreStatusText = () => {
    if (!storeStatus) return 'Unknown';
    return storeStatus.isOpen ? 'OPEN' : 'CLOSED';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner text="Loading store information..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

      {/* Header */}
      <View style={[styles.header, {paddingTop: top + 10}]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreetingMessage()}</Text>
            <Text style={styles.welcomeText}>
              Welcome back, {user?.name || 'User'}!
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            {isAuthLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Icon name="logout" size={24} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.timezoneSection}>
          <Text style={styles.currentTime}>{getCurrentTimeDisplay()}</Text>
          <TouchableOpacity
            style={styles.timezoneToggle}
            onPress={toggleTimezoneHandler}>
            <Icon
              name={timezone === 'nyc' ? 'city' : 'earth'}
              size={20}
              color={Colors.white}
            />
            <Text style={styles.timezoneText}>
              {timezone === 'nyc' ? 'NYC Time' : 'Local Time'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadData}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            title="Pull to refresh"
            titleColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}>
        {/* Store Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Icon name="store" size={24} color={Colors.primary} />
            <Text style={styles.statusTitle}>Store Status</Text>
          </View>
          <View style={styles.statusContent}>
            <View
              style={[
                styles.statusIndicator,
                {backgroundColor: getStoreStatusColor()},
              ]}>
              <Text style={styles.statusIndicatorText}>
                {getStoreStatusText()}
              </Text>
            </View>
            {storeStatus && (
              <Text style={styles.statusDetails}>
                {storeStatus.isOpen
                  ? `Open until ${storeStatus.nextClosing || 'closing time'}`
                  : `Next opening: ${storeStatus.nextOpening || 'unknown'}`}
              </Text>
            )}
          </View>
        </Card>

        {/* Notification Test Card - Remove in production */}
        {/* {__DEV__ && (
          <Card style={styles.notificationCard}>
            <View style={styles.cardHeader}>
              <Icon name="bell" size={24} color={Colors.warning} />
              <Text style={styles.cardTitle}>Test Notifications</Text>
            </View>
            <View style={styles.notificationButtons}>
              <Button
                title="Test Notification"
                variant="outline"
                onPress={() => notificationService.showTestNotification()}
                style={styles.testButton}
              />
              <Button
                title="Schedule Hourly"
                variant="outline"
                onPress={() => notificationService.scheduleHourlyReminder()}
                style={styles.testButton}
              />
              <Button
                title="Schedule Store Reminders"
                variant="outline"
                onPress={() =>
                  notificationService.scheduleAllStoreReminders(
                    storeTimes,
                    storeOverrides,
                  )
                }
                style={styles.testButton}
              />
              <Button
                title="Test 1 Min Reminder"
                variant="outline"
                onPress={() => notificationService.scheduleTestReminder()}
                style={styles.testButton}
              />
              <Button
                title="Clear All Notifications"
                variant="outline"
                onPress={() => notificationService.clearAllNotifications()}
                style={styles.testButton}
              />
              <Button
                title="Check Notification Status"
                variant="outline"
                onPress={() => notificationService.checkNotificationStatus()}
                style={styles.testButton}
              />
            </View>
          </Card>
        )} */}

        {/* Date Selection */}
        <Card style={styles.dateCard}>
          <View style={styles.cardHeader}>
            <Icon name="calendar" size={24} color={Colors.primary} />
            <Text style={styles.cardTitle}>Select Date</Text>
          </View>
          <DateSelector
            dates={storeService.generateDateList(30)}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            disabled={isLoading}
          />
        </Card>

        {/* Time Slots */}
        {selectedDate && timeSlots.length > 0 && (
          <Card style={styles.timeCard}>
            <View style={styles.cardHeader}>
              <Icon name="clock-outline" size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>Select Time</Text>
            </View>
            <TimeSlotGrid
              timeSlots={timeSlots}
              selectedTime={selectedTime}
              onTimeSelect={handleTimeSelect}
              disabled={isLoading}
            />
          </Card>
        )}

        {/* Booking Confirmation */}
        {selectedDate && selectedTime && (
          <Card style={styles.bookingCard}>
            <View style={styles.cardHeader}>
              <Icon name="check-circle" size={24} color={Colors.success} />
              <Text style={styles.cardTitle}>Confirm Booking</Text>
            </View>
            <View style={styles.bookingSummary}>
              <Text style={styles.bookingText}>
                Date: {moment(selectedDate).format('MMM DD, YYYY')}
              </Text>
              <Text style={styles.bookingText}>Time: {selectedTime}</Text>
            </View>
            <Button
              title={isBookingLoading ? 'Confirming...' : 'Confirm Booking'}
              onPress={handleConfirmBooking}
              loading={isBookingLoading}
              disabled={isBookingLoading}
              fullWidth
              style={styles.confirmButton}
            />
          </Card>
        )}

        {/* Debug Info - Remove this in production */}
        {/* {__DEV__ && (
          <Card style={styles.debugCard}>
            <Text style={styles.debugText}>Debug Info:</Text>
            <Text style={styles.debugText}>Selected Date: {selectedDate || 'None'}</Text>
            <Text style={styles.debugText}>Selected Time: {selectedTime || 'None'}</Text>
            <Text style={styles.debugText}>User: {user ? user.name : 'None'}</Text>
            <Text style={styles.debugText}>Time Slots: {timeSlots.length}</Text>
          </Card>
        )} */}

        {/* Empty State */}
        {selectedDate && timeSlots.length === 0 && (
          <Card style={styles.emptyCard}>
            <Icon name="calendar-remove" size={48} color={Colors.gray[500]} />
            <Text style={styles.emptyTitle}>No Available Times</Text>
            <Text style={styles.emptySubtitle}>
              The store is closed on this date. Please select another date.
            </Text>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card style={styles.errorCard}>
            <Icon name="alert-circle" size={24} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <Button
              title="Retry"
              variant="outline"
              onPress={loadData}
              style={styles.retryButton}
            />
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  timezoneSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentTime: {
    fontSize: 14,
    color: Colors.white,
    opacity: 0.9,
  },
  timezoneToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  timezoneText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    marginBottom: 20,
    padding: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[900],
    marginLeft: 12,
  },
  statusContent: {
    alignItems: 'center',
  },
  statusIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginBottom: 12,
  },
  statusIndicatorText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  statusDetails: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  dateCard: {
    marginBottom: 20,
    padding: 20,
  },
  timeCard: {
    marginBottom: 20,
    padding: 20,
  },
  bookingCard: {
    marginBottom: 20,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[900],
    marginLeft: 12,
  },
  bookingSummary: {
    marginBottom: 20,
  },
  bookingText: {
    fontSize: 16,
    color: Colors.gray[900],
    marginBottom: 8,
  },
  confirmButton: {
    marginTop: 10,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 40,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.gray[900],
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
  },
  errorCard: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  retryButton: {
    minWidth: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  debugCard: {
    marginTop: 20,
    padding: 15,
    backgroundColor: Colors.gray[100],
    borderRadius: 10,
    alignItems: 'center',
  },
  debugText: {
    fontSize: 14,
    color: Colors.gray[800],
    marginBottom: 5,
  },
  notificationCard: {
    marginBottom: 20,
    padding: 20,
  },
  notificationButtons: {
    flexDirection: 'column',
    gap: 10,
  },
  testButton: {
    flex: 1,
    minWidth: 120,
  },
});

export default HomeScreen;
