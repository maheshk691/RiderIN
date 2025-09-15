# 🚗 RiderIN Driver App - Local Development & Testing Guide

## Overview

This guide provides comprehensive instructions for setting up and testing the RiderIN Driver app locally on your system. The app is built with React Native and Expo, offering cross-platform development capabilities.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Setup](#project-setup)
4. [Local Development Server](#local-development-server)
5. [Testing on Devices](#testing-on-devices)
6. [API Integration Setup](#api-integration-setup)
7. [Google Maps Configuration](#google-maps-configuration)
8. [Push Notifications Testing](#push-notifications-testing)
9. [Debugging & Development Tools](#debugging--development-tools)
10. [Common Issues & Solutions](#common-issues--solutions)
11. [Development Workflow](#development-workflow)

## 🖥️ System Requirements

### Minimum Requirements
- **OS**: Windows 10/11, macOS 10.15+, or Ubuntu 18.04+
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 10GB free space
- **Node.js**: v16.0.0 or higher
- **Git**: Latest version

### Recommended Development Setup
- **IDE**: Visual Studio Code with React Native extensions
- **Terminal**: PowerShell (Windows), Terminal (macOS), or Bash (Linux)
- **Device**: Physical Android/iOS device for testing
- **Emulator**: Android Studio emulator or iOS Simulator

## 🛠️ Development Environment Setup

### 1. Install Node.js

#### Windows
```powershell
# Download and install Node.js from https://nodejs.org/
# Or use Chocolatey
choco install nodejs

# Verify installation
node --version
npm --version
```

#### macOS
```bash
# Using Homebrew
brew install node

# Or download from https://nodejs.org/
# Verify installation
node --version
npm --version
```

#### Linux (Ubuntu/Debian)
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install Expo CLI

```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Verify installation
expo --version
```

### 3. Install Development Tools

#### Android Development (Windows/Linux/macOS)
```bash
# Download Android Studio from https://developer.android.com/studio
# Install Android SDK, Android SDK Platform-Tools, and Android Emulator

# Set environment variables (add to your shell profile)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

#### iOS Development (macOS Only)
```bash
# Install Xcode from App Store
# Install Xcode Command Line Tools
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods
```

### 4. Install Additional Tools

```bash
# Install Git (if not already installed)
# Windows: Download from https://git-scm.com/
# macOS: brew install git
# Linux: sudo apt-get install git

# Install Watchman (for better file watching)
# Windows: Download from https://facebook.github.io/watchman/
# macOS: brew install watchman
# Linux: sudo apt-get install watchman
```

## 📁 Project Setup

### 1. Clone and Navigate to Driver App

```bash
# Navigate to your project directory
cd /path/to/RiderIN/driver

# Install dependencies
npm install

# Verify project structure
ls -la
```

### 2. Project Structure Overview

```
driver/
├── app/                    # Expo Router pages
│   ├── _layout.tsx         # Root layout
│   ├── index.tsx           # Entry point
│   ├── (routes)/           # Authentication routes
│   └── (tabs)/             # Main app tabs
├── assets/                 # Images, fonts, icons
├── components/             # Reusable components
├── configs/               # Constants and configuration
├── hooks/                 # Custom React hooks
├── screens/               # Screen components
├── styles/                # Style definitions
├── themes/                # App theming
├── utils/                 # Utility functions
├── app.json               # Expo configuration
├── package.json           # Dependencies
└── tsconfig.json          # TypeScript config
```

### 3. Environment Configuration

#### Create Environment File
```bash
# Create .env file in driver directory
touch .env
```

#### Add Environment Variables (.env)
```bash
# API Configuration
EXPO_PUBLIC_SERVER_URI=http://localhost:3000/api/v1
EXPO_PUBLIC_SOCKET_URL=ws://localhost:8080

# Google Maps (Get from Google Cloud Console)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# App Configuration
EXPO_PUBLIC_APP_NAME=RiderIN Driver
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_ENVIRONMENT=development

# Development Settings
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=debug
```

### 4. Update app.json Configuration

```json
{
  "expo": {
    "name": "RiderIN-Driver",
    "slug": "RiderIN-Driver",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "RiderIN-Driver",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.becodemy.RiderIN-Driver"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.becodemy.RiderIN-Driver",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECORD_AUDIO",
        "VIBRATE",
        "WAKE_LOCK"
      ],
        "config": {}
    },
    "plugins": [
      "expo-router",
      [
        "expo-font",
        {
          "fonts": ["./assets/fonts/TT-Octosquares-Medium.ttf"]
        }
      ],
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "This app needs location access to track rides and provide navigation."
        }
      ],
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "defaultChannel": "default"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "eas": {
        "projectId": "6cdffa57-e0c7-4571-bbe8-7b3c97422bc2"
      }
    }
  }
}
```

## 🚀 Local Development Server

### 1. Start Development Server

```bash
# Navigate to driver directory
cd driver

# Start Expo development server
npm start
# or
expo start

# Alternative commands
npm run android    # Start with Android
npm run ios        # Start with iOS
npm run web        # Start with Web
```

### 2. Development Server Options

```bash
# Start with specific options
expo start --clear          # Clear cache
expo start --tunnel         # Use tunnel for external access
expo start --localhost      # Use localhost only
expo start --lan            # Use LAN connection
expo start --dev-client     # Use development client
```

### 3. QR Code Scanning

- **Android**: Use Expo Go app or development build
- **iOS**: Use Expo Go app or development build
- **Web**: Open browser automatically

### 4. Hot Reloading

The development server supports:
- **Fast Refresh**: Automatic component updates
- **Live Reloading**: Full app reload on file changes
- **Error Overlay**: In-app error display

## 📱 Testing on Devices

### 1. Physical Device Testing

#### Android Device
```bash
# Enable Developer Options
# 1. Go to Settings > About Phone
# 2. Tap "Build Number" 7 times
# 3. Go to Settings > Developer Options
# 4. Enable "USB Debugging"

# Connect device via USB
# Run the app
expo start --android
```

#### iOS Device
```bash
# Connect iPhone via USB
# Trust the computer when prompted
# Run the app
expo start --ios
```

### 2. Emulator/Simulator Testing

#### Android Emulator
```bash
# Start Android Studio
# Open AVD Manager
# Create/Start virtual device
# Run the app
expo start --android
```

#### iOS Simulator
```bash
# Start iOS Simulator
# Run the app
expo start --ios
```

### 3. Web Testing

```bash
# Start web development server
expo start --web

# Open browser to http://localhost:19006
```

## 🔌 API Integration Setup

### 1. Backend Server Setup

#### Start Backend Server
```bash
# Navigate to server directory
cd ../server

# Install dependencies
npm install

# Start development server
npm run dev
# Server runs on http://localhost:3000
```

#### Start Socket Server
```bash
# Navigate to socket directory
cd ../socket

# Install dependencies
npm install

# Start socket server
node server.js
# Socket server runs on ws://localhost:8080
```

### 2. API Configuration

#### Update API Endpoints
```typescript
// configs/api.ts
export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_SERVER_URI || 'http://localhost:3000/api/v1',
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'ws://localhost:8080',
  TIMEOUT: 10000,
};

// Usage in components
import axios from 'axios';
import { API_CONFIG } from '@/configs/api';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});
```

### 3. Authentication Testing

#### Test Login Flow
```typescript
// Test phone number login
const testLogin = async () => {
  try {
    const response = await axios.post(`${API_CONFIG.BASE_URL}/driver/send-otp`, {
      phone_number: '+1234567890',
      country_code: '+1'
    });
    console.log('OTP sent:', response.data);
  } catch (error) {
    console.error('Login error:', error);
  }
};
```

## 🗺️ Google Maps Configuration

### 1. Google Cloud Console Setup

#### Create Project and Enable APIs
```bash
# 1. Go to Google Cloud Console
# 2. Create new project: "RiderIN Driver"
# 3. Enable billing
# 4. Enable these APIs:
#    - Maps SDK for Android
#    - Maps SDK for iOS
#    - Places API
#    - Directions API
#    - Geocoding API
```

#### Create API Keys
```bash
# Create separate API keys for:
# - Android app
# - iOS app
# - Server API (if needed)
```

### 2. Maps Implementation Testing

#### Test Maps Component
```typescript
// Test maps functionality
import MapView, { Marker } from 'react-native-maps';

const TestMap = () => {
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  return (
    <MapView
      style={{ flex: 1 }}
      region={region}
      showsUserLocation={true}
      showsMyLocationButton={true}
    >
      <Marker
        coordinate={{
          latitude: 37.78825,
          longitude: -122.4324,
        }}
        title="Test Location"
      />
    </MapView>
  );
};
```

### 3. Location Services Testing

#### Test Location Permissions
```typescript
import * as Location from 'expo-location';

const testLocation = async () => {
  try {
    // Request permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission denied');
      return;
    }

    // Get current location
    const location = await Location.getCurrentPositionAsync({});
    console.log('Current location:', location);
  } catch (error) {
    console.error('Location error:', error);
  }
};
```

## 📲 Push Notifications Testing

### 1. Notification Setup

#### Test Notification Permissions
```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

const testNotifications = async () => {
  try {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Push token:', token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  } catch (error) {
    console.error('Notification error:', error);
  }
};
```

### 2. Test Notifications

#### Send Test Notification
```typescript
// Send test notification
const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification",
      body: 'This is a test notification from RiderIN Driver',
      data: { data: 'goes here' },
    },
    trigger: { seconds: 2 },
  });
};
```

## 🔧 Debugging & Development Tools

### 1. React Native Debugger

#### Install React Native Debugger
```bash
# Download from https://github.com/jhen0409/react-native-debugger
# Or use Flipper (recommended)
```

#### Enable Remote Debugging
```bash
# In the app, shake device or press Cmd+D (iOS) / Cmd+M (Android)
# Select "Debug" -> "Remote JS Debugging"
```

### 2. Flipper Integration

#### Install Flipper
```bash
# Download from https://fbflipper.com/
# Install React Native plugin
```

#### Configure Flipper
```bash
# Add to package.json
"scripts": {
  "flipper": "npx react-native run-android --variant=debug"
}
```

### 3. Console Logging

#### Debug Console
```typescript
// Use console.log for debugging
console.log('Debug info:', data);

// Use console.warn for warnings
console.warn('Warning:', warning);

// Use console.error for errors
console.error('Error:', error);
```

### 4. Network Debugging

#### Monitor API Calls
```typescript
// Add request/response interceptors
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);
```

## 🚨 Common Issues & Solutions

### 1. Build Issues

#### Metro Cache Issues
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear Expo cache
expo r -c

# Clear npm cache
npm cache clean --force
```

#### Dependency Issues
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Clear package-lock.json
rm package-lock.json
npm install
```

### 2. Android Issues

#### Gradle Build Issues
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

#### SDK Issues
```bash
# Check Android SDK path
echo $ANDROID_HOME

# Update SDK tools
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --update
```

### 3. iOS Issues

#### Xcode Build Issues
```bash
cd ios
pod install
xcodebuild clean
```

#### Simulator Issues
```bash
# Reset iOS Simulator
xcrun simctl erase all
xcrun simctl boot "iPhone 14 Pro"
```

### 4. Maps Issues

#### API Key Issues
```bash
# Check API key configuration
# Verify API key restrictions
# Check billing account
# Test API key in browser
```

#### Location Permission Issues
```bash
# Check Info.plist permissions
# Test on physical device
# Reset location permissions
```

## 🔄 Development Workflow

### 1. Daily Development Routine

```bash
# Morning setup
cd driver
npm start

# Make changes to code
# Test on device/emulator
# Debug issues
# Commit changes

# Evening cleanup
# Stop development server
# Commit final changes
```

### 2. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Develop feature
# Test thoroughly
# Create pull request
# Merge to main
```

### 3. Testing Checklist

- [ ] App launches successfully
- [ ] Login flow works
- [ ] Maps display correctly
- [ ] Location services work
- [ ] Push notifications work
- [ ] API calls succeed
- [ ] UI components render properly
- [ ] Navigation works
- [ ] Data persistence works

### 4. Performance Monitoring

```typescript
// Monitor performance
import { Performance } from 'react-native-performance';

const measurePerformance = () => {
  const start = Performance.now();
  
  // Your code here
  
  const end = Performance.now();
  console.log(`Execution time: ${end - start} ms`);
};
```

## 📞 Support & Resources

### Documentation Links
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://expo.github.io/router/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)

### Community Support
- [Expo Discord](https://chat.expo.dev/)
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

### Development Tools
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/)
- [Flipper](https://fbflipper.com/)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)

---

*This local development guide provides comprehensive instructions for setting up and testing the RiderIN Driver app on your local system. Follow these steps carefully and adapt them to your specific development environment.*
