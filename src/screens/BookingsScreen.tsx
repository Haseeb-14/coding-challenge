import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { cancelBooking, loadUserBookingsThunk } from '../store/slices/storeSlice';
import moment from 'moment';
import { Colors } from '../constants/colors';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Booking } from '../types/store';

const BookingsScreen: React.FC = () => {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<any>>();
  const { user } = useAppSelector(state => state.auth);
  const dispatch = useAppDispatch();
  const { bookings, isBookingLoading } = useAppSelector(state => state.store);

  // Load user-specific bookings when screen mounts or user changes
  useEffect(() => {
    if (user?.id) {
      dispatch(loadUserBookingsThunk(user.id));
    }
  }, [dispatch, user?.id]);

  const handleRefresh = () => {
    console.log('Refreshing bookings...');
    if (user?.id) {
      dispatch(loadUserBookingsThunk(user.id));
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    Alert.alert(
      'Cancel Booking',
      `Are you sure you want to cancel your booking for ${moment(booking.date).format('MMM DD, YYYY')} at ${booking.time}?`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(cancelBooking({ 
                bookingId: booking.id, 
                userId: user?.id || '' 
              })).unwrap();
              
              Alert.alert('Success', 'Booking cancelled successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return Colors.success;
      case 'pending':
        return Colors.warning;
      case 'cancelled':
        return Colors.error;
      default:
        return Colors.gray[500];
    }
  };

  const renderBookingItem = ({ item }: { item: Booking }) => (
    <Card style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.dateTimeContainer}>
          <Text style={styles.bookingDate}>
            {moment(item.date).format('MMM DD, YYYY')}
          </Text>
          <Text style={styles.bookingTime}>🕐 {item.time}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>📅 Booked on:</Text>
          <Text style={styles.detailValue}>
            {moment(item.createdAt).format('MMM DD, YYYY')}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>🆔 Booking ID:</Text>
          <Text style={styles.detailValue}>{item.id.slice(0, 8)}...</Text>
        </View>
      </View>
      
      {item.status === 'confirmed' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelBooking(item)}
        >
          <Text style={styles.cancelButtonText}>🚫 Cancel Booking</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📋</Text>
      <Text style={styles.emptyStateTitle}>No Bookings Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        You haven't made any bookings yet. Go to the Home tab to book your first appointment!
      </Text>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.emptyStateButton}>
        <Text style={styles.emptyStateButtonText}>🎯 Start Booking</Text>
      </TouchableOpacity>
    </View>
  );

  if (isBookingLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner text="Loading your bookings..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        style={[styles.header, { paddingTop: top + 10 }]}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>My Bookings</Text>
          <Text style={styles.subtitle}>
            {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
          </Text>
        </View>
        <View style={styles.headerDecoration}>
          <Text style={styles.headerIcon}>📚</Text>
        </View>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBookingItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={isBookingLoading} 
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            title="Pull to refresh"
            titleColor={Colors.primary}
          />
        }
        ListEmptyComponent={EmptyState}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          bookings.length > 0 ? (
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>Your Appointments</Text>
              <Text style={styles.listHeaderSubtitle}>
                Manage and track all your store bookings
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    backgroundColor: Colors.primary,
    elevation: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    minHeight: 120,
  },
  headerContent: {
    justifyContent: 'center',
  },
  headerDecoration: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{ translateY: -20 }],
  },
  headerIcon: {
    fontSize: 40,
    opacity: 0.3,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.white,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
    fontWeight: '500',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: Colors.white,
    marginVertical: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  listHeaderSubtitle: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  bookingCard: {
    marginBottom: 16,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateTimeContainer: {
    flex: 1,
  },
  bookingDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  bookingTime: {
    fontSize: 16,
    color: Colors.gray[700],
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: Colors.gray[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  bookingDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.gray[600],
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: Colors.gray[900],
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: Colors.error,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignSelf: 'flex-start',
    elevation: 2,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    elevation: 3,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  emptyStateButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BookingsScreen;
