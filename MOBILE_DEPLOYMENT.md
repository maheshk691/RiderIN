# 📱 RiderIN Mobile App Deployment Guide

## Overview

This guide provides comprehensive instructions for building and deploying the RiderIN Driver and User mobile applications for Android and iOS platforms. Both apps are built with React Native and Expo, offering cross-platform compatibility with native performance.

## 📋 Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure Analysis](#project-structure-analysis)
3. [Android Development Setup](#android-development-setup)
4. [iOS Development Setup](#ios-development-setup)
5. [Expo Build Configuration](#expo-build-configuration)
6. [Environment Configuration](#environment-configuration)
7. [Google Maps Integration](#google-maps-integration)
8. [Push Notifications Setup](#push-notifications-setup)
9. [App Store Deployment](#app-store-deployment)
10. [Testing & Debugging](#testing--debugging)
11. [Performance Optimization](#performance-optimization)
12. [Troubleshooting](#troubleshooting)

## 🛠️ Development Environment Setup

### Prerequisites

#### System Requirements
- **macOS**: Required for iOS development (Xcode)
- **Windows/Linux**: Android development only
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 50GB free space
- **Node.js**: v16 or higher
- **Git**: Latest version

#### Required Software
```bash
# Install Node.js (using nvm recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Install Expo CLI globally
npm install -g @expo/cli

# Install EAS CLI for builds
npm install -g eas-cli

# Verify installations
node --version
npm --version
expo --version
eas --version
```

### Project Setup

```bash
# Clone the repository
git clone https://github.com/your-repo/RiderIN.git
cd RiderIN

# Install dependencies for both apps
cd driver
npm install

cd ../user
npm install

# Verify Expo projects
expo doctor
```

## 📁 Project Structure Analysis

### Driver App Configuration
```json
{
  "name": "RiderIN-Driver",
  "slug": "RiderIN-Driver",
  "package": "com.becodemy.RiderIN-Driver",
  "version": "1.0.0",
  "expo": "~51.0.18"
}
```

### User App Configuration
```json
{
  "name": "RiderIN",
  "slug": "RiderIN", 
  "package": "com.becodemy.RiderIN",
  "version": "1.0.0",
  "expo": "~51.0.17"
}
```

### Key Dependencies Analysis

#### Driver App Dependencies
- **Maps**: `react-native-maps`, `react-native-maps-directions`
- **Location**: `expo-location`
- **Notifications**: `expo-notifications`
- **WebSocket**: `react-native-websocket`
- **Storage**: `@react-native-async-storage/async-storage`
- **UI**: `react-native-svg`, `react-native-switch-toggle`

#### User App Dependencies
- **Maps**: `react-native-maps`, `react-native-maps-directions`
- **Places**: `react-native-google-places-autocomplete`
- **Location**: `expo-location`
- **Notifications**: `expo-notifications`
- **UI**: `react-native-swiper`, `react-native-svg`

## 🤖 Android Development Setup

### Android Studio Installation

#### Windows/Linux
```bash
# Download Android Studio
# https://developer.android.com/studio

# Install Android SDK
# - Android SDK Platform 33
# - Android SDK Build-Tools 33.0.0
# - Android SDK Platform-Tools
# - Android SDK Tools
# - Android Emulator
```

#### macOS
```bash
# Install using Homebrew
brew install --cask android-studio

# Or download from official website
# https://developer.android.com/studio
```

### Android SDK Configuration

```bash
# Set environment variables (add to ~/.bashrc or ~/.zshrc)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Reload shell configuration
source ~/.bashrc  # or ~/.zshrc
```

### Android Emulator Setup

```bash
# List available system images
$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager list

# Create virtual device
$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd \
  -n "Pixel_6_API_33" \
  -k "system-images;android-33;google_apis;x86_64"

# Start emulator
$ANDROID_HOME/emulator/emulator -avd Pixel_6_API_33
```

### Android Build Configuration

#### Update app.json for Android
```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.RiderIN.driver",
      "versionCode": 1,
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
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_GOOGLE_MAPS_API_KEY"
        }
      },
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

### Android Development Commands

```bash
# Start development server
expo start

# Run on Android emulator
expo start --android

# Run on physical device
expo start --android --device

# Build Android APK
eas build --platform android --profile development

# Build Android AAB for Play Store
eas build --platform android --profile production
```

## 🍎 iOS Development Setup

### Xcode Installation (macOS Only)

```bash
# Install Xcode from App Store
# Or download from Apple Developer Portal

# Install Xcode Command Line Tools
xcode-select --install

# Install CocoaPods
sudo gem install cocoapods

# Verify installation
xcodebuild -version
pod --version
```

### iOS Simulator Setup

```bash
# List available simulators
xcrun simctl list devices

# Boot iOS simulator
xcrun simctl boot "iPhone 14 Pro"

# Open Simulator app
open -a Simulator
```

### iOS Build Configuration

#### Update app.json for iOS
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.RiderIN.driver",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "This app needs location access to find nearby drivers and provide navigation.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "This app needs location access to track your ride in real-time.",
        "NSCameraUsageDescription": "This app needs camera access to take profile pictures.",
        "NSMicrophoneUsageDescription": "This app needs microphone access for voice calls with drivers."
      },
      "config": {
        "googleMapsApiKey": "YOUR_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

### iOS Development Commands

```bash
# Start development server
expo start

# Run on iOS simulator
expo start --ios

# Run on physical device
expo start --ios --device

# Build iOS app
eas build --platform ios --profile development

# Build iOS app for App Store
eas build --platform ios --profile production
```

## ⚙️ Expo Build Configuration

### EAS Build Setup

```bash
# Login to Expo account
eas login

# Initialize EAS configuration
eas build:configure

# This creates eas.json file
```

### EAS Configuration (eas.json)

```json
{
  "cli": {
    "version": ">= 5.9.1"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "resourceClass": "medium"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "resourceClass": "medium"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "resourceClass": "medium"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "./path/to/api-key.json",
        "track": "production"
      }
    }
  }
}
```

### Build Profiles

#### Development Build
```bash
# Create development build
eas build --platform all --profile development

# Install on device
eas build:run --platform android
eas build:run --platform ios
```

#### Preview Build
```bash
# Create preview build for testing
eas build --platform all --profile preview
```

#### Production Build
```bash
# Create production build
eas build --platform all --profile production
```

## 🔧 Environment Configuration

### Environment Variables Setup

#### Create .env files for both apps

**Driver App (.env)**
```bash
# API Configuration
EXPO_PUBLIC_SERVER_URI=https://your-api-domain.com/api/v1
EXPO_PUBLIC_SOCKET_URL=wss://your-socket-domain.com

# Google Maps
EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=your_google_maps_api_key

# App Configuration
EXPO_PUBLIC_APP_NAME=RideWave Driver
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_ENVIRONMENT=production

# Push Notifications
EXPO_PUBLIC_PUSH_NOTIFICATION_KEY=your_push_notification_key
```

**User App (.env)**
```bash
# API Configuration
EXPO_PUBLIC_SERVER_URI=https://your-api-domain.com/api/v1
EXPO_PUBLIC_SOCKET_URL=wss://your-socket-domain.com

# Google Maps & Places
EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=your_google_maps_api_key
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your_google_places_api_key

# App Configuration
EXPO_PUBLIC_APP_NAME=RideWave
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_ENVIRONMENT=production

# Push Notifications
EXPO_PUBLIC_PUSH_NOTIFICATION_KEY=your_push_notification_key
```

### App Configuration Updates

#### Update app.json with environment variables
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      },
      "serverUri": "process.env.EXPO_PUBLIC_SERVER_URI",
      "socketUrl": "process.env.EXPO_PUBLIC_SOCKET_URL",
      "googleMapsApiKey": "process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY"
    }
  }
}
```

## 🗺️ Google Maps Integration

### Google Cloud Console Setup

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create new project: "RideWave"
   - Enable billing

2. **Enable Required APIs**
   ```bash
   # Enable these APIs:
   # - Maps SDK for Android
   # - Maps SDK for iOS
   # - Places API
   # - Directions API
   # - Distance Matrix API
   # - Geocoding API
   ```

3. **Create API Keys**
   ```bash
   # Create separate API keys for:
   # - Android app
   # - iOS app
   # - Server API
   ```

### API Key Configuration

#### Android Configuration
```bash
# Add to android/app/src/main/AndroidManifest.xml
<application>
  <meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_ANDROID_API_KEY"/>
</application>
```

#### iOS Configuration
```bash
# Add to ios/RideWave/AppDelegate.m
#import <GoogleMaps/GoogleMaps.h>

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"YOUR_IOS_API_KEY"];
  // ... rest of the code
}
```

### Maps Implementation

#### Driver App Maps Setup
```typescript
// components/maps/DriverMap.tsx
import MapView, { Marker, Polyline } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const DriverMap = ({ currentLocation, destination, onLocationUpdate }) => {
  return (
    <MapView
      style={{ flex: 1 }}
      region={region}
      showsUserLocation={true}
      showsMyLocationButton={true}
      onUserLocationChange={onLocationUpdate}
    >
      {destination && (
        <Marker coordinate={destination} />
      )}
      {currentLocation && destination && (
        <MapViewDirections
          origin={currentLocation}
          destination={destination}
          apikey={process.env.EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY}
          strokeWidth={4}
          strokeColor="blue"
        />
      )}
    </MapView>
  );
};
```

#### User App Maps Setup
```typescript
// components/maps/UserMap.tsx
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const UserMap = ({ onPlaceSelect }) => {
  return (
    <View style={{ flex: 1 }}>
      <GooglePlacesAutocomplete
        placeholder="Where to?"
        onPress={onPlaceSelect}
        query={{
          key: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY,
          language: 'en',
        }}
        styles={{
          textInputContainer: {
            backgroundColor: 'transparent',
          },
          textInput: {
            backgroundColor: '#fff',
            borderRadius: 8,
            paddingHorizontal: 16,
            paddingVertical: 12,
          },
        }}
      />
      <MapView
        style={{ flex: 1 }}
        region={region}
        showsUserLocation={true}
      >
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={marker.coordinate}
            title={marker.title}
          />
        ))}
      </MapView>
    </View>
  );
};
```

## 📱 Push Notifications Setup

### Expo Notifications Configuration

#### Update app.json
```json
{
  "expo": {
    "notification": {
      "icon": "./assets/notification-icon.png",
      "color": "#ffffff",
      "iosDisplayInForeground": true,
      "androidMode": "default",
      "androidCollapsedTitle": "#{unread_notifications} new interactions"
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff",
          "defaultChannel": "default"
        }
      ]
    ]
  }
}
```

### Notification Implementation

#### Driver App Notifications
```typescript
// hooks/useNotifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export const useNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string>('');

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => {
      setExpoPushToken(token);
      // Send token to server
      sendTokenToServer(token);
    });

    const notificationListener = Notifications.addNotificationReceivedListener(
      notification => {
        // Handle ride request notification
        handleRideRequest(notification);
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Failed to get push token for push notification!');
      }
      
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      return token;
    } else {
      throw new Error('Must use physical device for Push Notifications');
    }
  };

  return { expoPushToken };
};
```

#### User App Notifications
```typescript
// hooks/useUserNotifications.ts
export const useUserNotifications = () => {
  useEffect(() => {
    const notificationListener = Notifications.addNotificationReceivedListener(
      notification => {
        // Handle driver updates
        handleDriverUpdate(notification);
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
    };
  }, []);

  const sendRideRequest = async (driverId: string, rideData: any) => {
    const message = {
      to: driverPushToken,
      sound: 'default',
      title: 'New Ride Request',
      body: 'You have a new ride request',
      data: { rideData },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
  };

  return { sendRideRequest };
};
```

## 🏪 App Store Deployment

### Google Play Store Deployment

#### 1. Google Play Console Setup
```bash
# Create Google Play Developer Account
# https://play.google.com/console

# Pay $25 one-time registration fee
# Complete developer profile
```

#### 2. App Bundle Creation
```bash
# Build Android App Bundle
eas build --platform android --profile production

# Download AAB file from Expo dashboard
# Upload to Google Play Console
```

#### 3. Play Store Listing
```bash
# Required assets:
# - App icon (512x512 PNG)
# - Feature graphic (1024x500 PNG)
# - Screenshots (minimum 2, maximum 8)
# - App description
# - Privacy policy URL
# - Content rating questionnaire
```

#### 4. Release Configuration
```bash
# Create release track
# - Internal testing
# - Closed testing
# - Open testing
# - Production
```

### Apple App Store Deployment

#### 1. Apple Developer Account Setup
```bash
# Create Apple Developer Account
# https://developer.apple.com/programs/

# Pay $99/year subscription
# Complete enrollment process
```

#### 2. App Store Connect Setup
```bash
# Create app in App Store Connect
# - App name
# - Bundle ID
# - SKU
# - Primary language
```

#### 3. iOS Build Submission
```bash
# Build iOS app
eas build --platform ios --profile production

# Submit to App Store
eas submit --platform ios --profile production
```

#### 4. App Store Review Process
```bash
# Prepare for review:
# - App description
# - Keywords
# - Screenshots
# - App preview videos
# - Privacy policy
# - App review information
```

### App Store Optimization (ASO)

#### Keywords Strategy
```bash
# Driver App Keywords:
# - ride sharing driver
# - taxi driver app
# - delivery driver
# - driver earnings
# - ride hailing

# User App Keywords:
# - ride sharing
# - taxi app
# - ride hailing
# - transportation
# - car service
```

#### App Store Assets
```bash
# Required assets for both stores:
# - App icon (various sizes)
# - Screenshots (phone and tablet)
# - Feature graphic (Android)
# - App preview videos (iOS)
# - Promotional text
# - App description
```

## 🧪 Testing & Debugging

### Development Testing

#### Local Testing
```bash
# Start development server
expo start

# Test on physical device
expo start --tunnel

# Test on emulator/simulator
expo start --android
expo start --ios
```

#### Debugging Tools
```bash
# Install Flipper for debugging
# https://fbflipper.com/

# Use React Native Debugger
# https://github.com/jhen0409/react-native-debugger

# Enable remote debugging
# Shake device -> Debug -> Remote JS Debugging
```

### Testing Framework Setup

#### Jest Configuration
```json
// jest.config.js
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.expo/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
};
```

#### Test Implementation
```typescript
// __tests__/components/Button.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../components/common/button';

describe('Button Component', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={() => {}} />
    );
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Testing

#### Detox Setup
```bash
# Install Detox
npm install --save-dev detox

# Configure Detox
# Create .detoxrc.js
module.exports = {
  testRunner: 'jest',
  runnerConfig: 'e2e/config.json',
  configurations: {
    'ios.sim.debug': {
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/RideWave.app',
      build: 'xcodebuild -workspace ios/RideWave.xcworkspace -scheme RideWave -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14 Pro',
      },
    },
    'android.emu.debug': {
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_6_API_33',
      },
    },
  },
};
```

#### E2E Test Example
```typescript
// e2e/firstTest.e2e.js
describe('RideWave App', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show welcome screen', async () => {
    await expect(element(by.id('welcome'))).toBeVisible();
  });

  it('should navigate to login screen', async () => {
    await element(by.id('login-button')).tap();
    await expect(element(by.id('login-screen'))).toBeVisible();
  });
});
```

## ⚡ Performance Optimization

### Bundle Size Optimization

#### Metro Configuration
```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Enable tree shaking
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Optimize bundle
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

module.exports = config;
```

#### Code Splitting
```typescript
// Lazy load components
import { lazy, Suspense } from 'react';

const MapScreen = lazy(() => import('./screens/MapScreen'));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen'));

const App = () => (
  <Suspense fallback={<LoadingScreen />}>
    <MapScreen />
  </Suspense>
);
```

### Memory Optimization

#### Image Optimization
```typescript
// Optimize images
import { Image } from 'react-native';

const OptimizedImage = ({ source, ...props }) => (
  <Image
    source={source}
    resizeMode="contain"
    style={props.style}
    // Use appropriate image formats
    // WebP for Android, HEIF for iOS
  />
);
```

#### List Optimization
```typescript
// Use FlatList for large lists
import { FlatList } from 'react-native';

const RideList = ({ rides }) => (
  <FlatList
    data={rides}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => <RideItem ride={item} />}
    getItemLayout={(data, index) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    })}
    removeClippedSubviews={true}
    maxToRenderPerBatch={10}
    windowSize={10}
  />
);
```

## 🚨 Troubleshooting

### Common Issues & Solutions

#### Build Issues
```bash
# Clear Expo cache
expo r -c

# Clear npm cache
npm cache clean --force

# Clear Metro cache
npx react-native start --reset-cache

# Reinstall node_modules
rm -rf node_modules
npm install
```

#### Android Issues
```bash
# Gradle build issues
cd android
./gradlew clean
./gradlew assembleDebug

# SDK issues
# Check ANDROID_HOME environment variable
echo $ANDROID_HOME

# Emulator issues
$ANDROID_HOME/emulator/emulator -avd Pixel_6_API_33 -wipe-data
```

#### iOS Issues
```bash
# Xcode build issues
cd ios
pod install
xcodebuild clean

# Simulator issues
xcrun simctl erase all
xcrun simctl boot "iPhone 14 Pro"
```

#### Maps Issues
```bash
# Google Maps not loading
# Check API key configuration
# Verify API key restrictions
# Check billing account

# Location permissions
# Check Info.plist permissions
# Test on physical device
```

### Debugging Commands

```bash
# View logs
expo logs

# Debug network requests
# Use Flipper or React Native Debugger

# Performance profiling
# Use React Native Performance Monitor

# Memory debugging
# Use Xcode Instruments or Android Studio Profiler
```

## 📞 Support & Resources

### Documentation Links
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Google Maps React Native](https://github.com/react-native-maps/react-native-maps)

### Community Support
- [Expo Discord](https://chat.expo.dev/)
- [React Native Community](https://github.com/react-native-community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

### Development Tools
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/)
- [EAS CLI](https://docs.expo.dev/build/setup/)
- [Flipper](https://fbflipper.com/)
- [React Native Debugger](https://github.com/jhen0409/react-native-debugger)

---

*This mobile app deployment guide provides comprehensive instructions for building and deploying the RideWave Driver and User applications for both Android and iOS platforms. Follow these steps carefully and adapt them to your specific requirements.*
