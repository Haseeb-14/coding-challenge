# React Native Coding Challenge

# Loom Video Link
https://www.loom.com/share/2f632fcebae6457d8887131280bdd51f?sid=a5f135e0-5899-40f7-9294-8c079109e2e9


A React Native application for managing store bookings with time slot selection, user authentication, and real-time notifications.

## �� Features

- **User Authentication**: Google Sign-In integration with Firebase
- **Store Management**: Dynamic time slot generation based on store hours and overrides
- **Booking System**: Create and manage appointments with real-time availability
- **Timezone Support**: Handle multiple timezones for global users
- **Push Notifications**: Local and remote notification support
- **State Management**: Redux Toolkit with persistence
- **Modern UI**: Clean, responsive design with custom components

## �� Screens

- **Login Screen**: Google Sign-In authentication
- **Home Screen**: Store hours, time slot selection, and booking creation
- **Bookings Screen**: View and manage existing bookings

## 🛠️ Tech Stack

- **React Native**: 0.79.3
- **TypeScript**: 5.0.4
- **State Management**: Redux Toolkit + Redux Persist
- **Navigation**: React Navigation v7
- **Authentication**: Firebase Auth + Google Sign-In
- **Notifications**: React Native Push Notification
- **Date/Time**: Moment.js with timezone support
- **UI Components**: Custom component library

## 📋 Prerequisites

- **Node.js**: >=18.0.0
- **React Native CLI**: Latest version
- **Android Studio**: For Android development
- **Xcode**: For iOS development (macOS only)
- **Firebase Project**: For authentication and backend services

## �� Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd coding-challenge
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. iOS Setup (macOS only)
```bash
cd ios
pod install
cd ..
```

### 4. Environment Configuration
Create a Firebase project and download the configuration files:
- **Android**: Place `google-services.json` in `android/app/`
- **iOS**: Place `GoogleService-Info.plist` in `ios/codingChallenge/`

### 5. Run the Application

#### Start Metro Bundler
```bash
npm start
# or
yarn start
```

#### Run on Android
```bash
npm run android
# or
yarn android
```

#### Run on iOS
```bash
npm run ios
# or
yarn ios
```

## 🧪 Testing

```bash
npm test
# or
yarn test
```

## 📁 Project Structure

## 🔐 Authentication Flow

1. User opens the app
2. Firebase Auth state listener checks for existing session
3. If no session, user sees Login screen with Google Sign-In
4. After successful authentication, user is redirected to Home screen
5. User data is stored in Redux store with persistence

## �� Booking System

1. **Store Hours**: Configured store operating hours
2. **Time Slots**: Dynamic generation based on store hours
3. **Overrides**: Special hours for holidays or events
4. **Availability**: Real-time slot availability checking
5. **Booking Creation**: User selects date/time and creates appointment

## 🌍 Timezone Handling

- App detects user's timezone automatically
- All dates/times are displayed in user's local timezone
- Store hours are converted from store's timezone to user's timezone
- Moment.js with timezone-support for accurate conversions

## �� Push Notifications

- Local notifications for booking confirmations
- Remote notifications via Firebase Cloud Messaging
- Notification permissions handled automatically
- Background notification support

## 🚨 Assumptions & Limitations

### Assumptions
- Users have Google accounts for authentication
- Store operates in a single timezone
- All users can access the same store
- Network connectivity is available for real-time updates

### Limitations
- **Authentication**: Only Google Sign-In supported (no email/password)
- **Offline Support**: Limited offline functionality
- **Multi-store**: Single store implementation
- **Payment**: No payment processing integration
- **Admin Panel**: No store management interface
- **Data Persistence**: Limited offline data storage

### Known Issues
- iOS simulator may have notification limitations
- Android emulator requires Google Play Services for Google Sign-In
- Timezone changes require app restart for full effect

## 🎯 Development Approach

### Architecture Decisions
1. **Redux Toolkit**: Chosen for predictable state management and developer experience
2. **TypeScript**: Full type safety for better code quality and debugging
3. **Custom Components**: Reusable UI components for consistency and maintainability
4. **Service Layer**: Separation of concerns with dedicated service files
5. **Hooks Pattern**: Custom hooks for business logic and state management

### Code Organization
- **Feature-based Structure**: Components organized by feature/domain
- **Type Safety**: Comprehensive TypeScript interfaces for all data structures
- **Error Handling**: Centralized error handling with user-friendly messages
- **Performance**: Optimized re-renders with useCallback and useMemo
- **Testing**: Jest setup with React Native testing utilities

### State Management Strategy
- **Normalized State**: Efficient data storage and retrieval
- **Async Operations**: Redux Toolkit async thunks for API calls
- **Persistence**: Redux Persist for offline data availability
- **Optimistic Updates**: Immediate UI feedback for better UX

## 🔧 Development Commands

```bash
# Linting
npm run lint

# Type checking
npx tsc --noEmit

# Metro bundler
npm start

# Clean builds
cd android && ./gradlew clean && cd ..
cd ios && xcodebuild clean && cd ..
```

## 📱 Platform-Specific Notes

### Android
- Minimum SDK: 21
- Target SDK: 33
- Google Play Services required for Google Sign-In

### iOS
- Minimum iOS: 12.0
- Target iOS: 16.0
- CocoaPods required for dependencies

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for new features
3. Include error handling for edge cases
4. Test on both platforms before submitting
5. Update documentation for new features

## 📄 License

This project is part of a coding challenge and is not intended for production use.

## 🆘 Troubleshooting

### Common Issues

**Metro bundler issues:**
```bash
npx react-native start --reset-cache
```

**iOS build failures:**
```bash
cd ios && pod deintegrate && pod install
```

**Android build failures:**
```bash
cd android && ./gradlew clean && cd ..
```

**Google Sign-In not working:**
- Verify Firebase configuration files are in correct locations
- Check SHA-1 fingerprint for Android
- Ensure Google Sign-In is enabled in Firebase console

For additional support, check the React Native documentation or create an issue in the repository.
