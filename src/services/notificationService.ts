import PushNotification from 'react-native-push-notification';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import moment from 'moment-timezone';

class NotificationService {
  constructor() {
    this.configure();
  }

  configure = async () => {
    try {
      // Request permissions first
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs notification permission to send store reminders',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission granted');
        } else {
          console.log('Notification permission denied');
          return;
        }
      }

      // Configure push notifications
      PushNotification.configure({
        onRegister: function (token) {
          console.log('TOKEN:', token);
        },
        onNotification: function (notification) {
          console.log('NOTIFICATION RECEIVED:', notification);
          // Handle notification when app is in foreground
          if (Platform.OS === 'ios' && typeof notification.finish === 'function') {
            notification.finish('UIBackgroundFetchResultNoData');
          }
        },
        permissions: {
          alert: true,
          badge: true,
          sound: true,
        },
        popInitialNotification: true,
        requestPermissions: Platform.OS === 'ios',
      });

      // Create notification channel for Android
      if (Platform.OS === 'android') {
        PushNotification.createChannel(
          {
            channelId: 'store-reminders',
            channelName: 'Store Reminders',
            channelDescription: 'Reminders for store opening times',
            playSound: true,
            soundName: 'default',
            importance: 4,
            vibrate: true,
          },
          (created) => {
            console.log(`Channel created: ${created}`);
            if (created) {
              console.log('Notification channel created successfully');
            } else {
              console.log('Notification channel already exists');
            }
          }
        );
      }

      console.log('Notification service configured successfully');
    } catch (error) {
      console.error('Failed to configure notification service:', error);
    }
  };

  // Test notification (for development) - IMMEDIATE
  showTestNotification = () => {
    try {
      console.log('Attempting to show test notification...');
      
      PushNotification.localNotification({
        channelId: 'store-reminders',
        title: 'Test Notification 🧪',
        message: 'This is a test notification - if you see this, notifications are working!',
        playSound: true,
        soundName: 'default',
        importance: 'high',
        priority: 'high',
        vibrate: true,
        vibration: 300,
        smallIcon: 'ic_launcher',
        largeIcon: 'ic_launcher',
        bigText: 'This is a test notification to verify the system is working properly.',
        subText: 'Notification Test',
        color: '#FF0000',
        number: 1,
        autoCancel: true,
        ongoing: false,
        allowWhileIdle: true,
      });

      console.log('Test notification sent successfully');
      
      // Show alert to confirm notification was sent
      Alert.alert(
        'Test Notification Sent',
        'A test notification has been sent. Check your notification panel.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to show test notification:', error);
      Alert.alert(
        'Notification Error',
        `Failed to send test notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  };

  // Schedule notification for store opening reminder
  scheduleStoreOpeningReminder = (date: string, openingTime: string) => {
    try {
      // Parse the date and time in NYC timezone
      const reminderTime = moment.tz(date + ' ' + openingTime, 'YYYY-MM-DD HH:mm', 'America/New_York');
      const notificationTime = reminderTime.clone().subtract(1, 'hour'); // 1 hour before opening

      // Only schedule if the time is in the future
      if (notificationTime.isAfter(moment())) {
        const notificationId = `store-reminder-${date}-${openingTime}`;
        
        PushNotification.localNotificationSchedule({
          id: notificationId,
          channelId: 'store-reminders',
          title: 'Store Opening Soon! 🏪',
          message: `The store will open in 1 hour at ${openingTime}`,
          date: notificationTime.toDate(),
          allowWhileIdle: true,
          repeatType: 'day', // Repeat daily
          number: 1,
          playSound: true,
          soundName: 'default',
          importance: 'high',
          priority: 'high',
          vibrate: true,
          vibration: 300,
        });

        console.log(`Scheduled reminder for ${notificationTime.format('YYYY-MM-DD HH:mm')}`);
        return true;
      }
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
    return false;
  };

  // Schedule notifications for all upcoming store openings
  scheduleAllStoreReminders = (storeTimes: any[], storeOverrides: any[]) => {
    try {
      // Clear existing notifications first
      this.cancelAllStoreReminders();

      const today = moment();
      const nextWeek = moment().add(7, 'days');

      // Schedule for regular store times
      storeTimes.forEach(storeTime => {
        if (storeTime.is_open && storeTime.start_time) {
          // Get next occurrence of this day of week
          let nextDate = moment().day(storeTime.day_of_week);
          if (nextDate.isBefore(today)) {
            nextDate = nextDate.add(1, 'week');
          }

          // Schedule for next 7 occurrences
          for (let i = 0; i < 7; i++) {
            const targetDate = nextDate.clone().add(i, 'weeks');
            if (targetDate.isBefore(nextWeek)) {
              this.scheduleStoreOpeningReminder(
                targetDate.format('YYYY-MM-DD'),
                storeTime.start_time
              );
            }
          }
        }
      });

      // Schedule for store overrides
      storeOverrides.forEach(override => {
        if (override.is_open && override.start_time) {
          const overrideDate = moment().month(override.month - 1).date(override.day);
          if (overrideDate.isAfter(today) && overrideDate.isBefore(nextWeek)) {
            this.scheduleStoreOpeningReminder(
              overrideDate.format('YYYY-MM-DD'),
              override.start_time
            );
          }
        }
      });

      console.log('Scheduled all store reminders');
    } catch (error) {
      console.error('Failed to schedule all reminders:', error);
    }
  };

  // Cancel all store reminders
  cancelAllStoreReminders = () => {
    PushNotification.cancelAllLocalNotifications();
    console.log('Cancelled all store reminders');
  };

  // Cancel specific reminder
  cancelReminder = (notificationId: string) => {
    PushNotification.cancelLocalNotification(notificationId);
    console.log(`Cancelled reminder: ${notificationId}`);
  };

  // Get all scheduled notifications
  getScheduledNotifications = () => {
    PushNotification.getScheduledLocalNotifications((notifications) => {
      console.log('Scheduled notifications:', notifications);
    });
  };

  // Schedule hourly reminder (for testing purposes)
  scheduleHourlyReminder = () => {
    const now = moment();
    const nextHour = now.clone().add(1, 'hour').startOf('hour');
    
    PushNotification.localNotificationSchedule({
      id: 'hourly-reminder',
      channelId: 'store-reminders',
      title: 'Hourly Reminder ⏰',
      message: 'This is an hourly reminder',
      date: nextHour.toDate(),
      allowWhileIdle: true,
      repeatType: 'hour',
      number: 1,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
      vibrate: true,
      vibration: 300,
    });

    console.log(`Scheduled hourly reminder for ${nextHour.format('YYYY-MM-DD HH:mm')}`);
  };

  // Schedule notification for 1 minute from now (for immediate testing)
  scheduleTestReminder = () => {
    const now = moment();
    const testTime = now.clone().add(1, 'minute');
    
    PushNotification.localNotificationSchedule({
      id: 'test-reminder',
      channelId: 'store-reminders',
      title: 'Test Reminder 🧪',
      message: 'This is a test reminder scheduled for 1 minute from now',
      date: testTime.toDate(),
      allowWhileIdle: true,
      number: 1,
      playSound: true,
      soundName: 'default',
      importance: 'high',
      priority: 'high',
      vibrate: true,
      vibration: 300,
    });

    console.log(`Scheduled test reminder for ${testTime.format('YYYY-MM-DD HH:mm')}`);
  };

  // Clear all notifications
  clearAllNotifications = () => {
    PushNotification.cancelAllLocalNotifications();
    PushNotification.removeAllDeliveredNotifications();
    console.log('Cleared all notifications');
  };

  // Check if notifications are working
  checkNotificationStatus = () => {
    if (Platform.OS === 'android') {
      PushNotification.checkPermissions((permissions) => {
        console.log('Notification permissions:', permissions);
        Alert.alert(
          'Notification Status',
          `Alert: ${permissions.alert}\nBadge: ${permissions.badge}\nSound: ${permissions.sound}`,
          [{ text: 'OK' }]
        );
      });
    }
  };
}

export const notificationService = new NotificationService();
export default notificationService;
