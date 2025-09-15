# 📱 RiderIN User App

## Overview

The RiderIN User App is a React Native application built with Expo that enables users to book rides, track drivers, and manage their ride history. This app is part of the RiderIN ecosystem alongside the driver app, server API, and socket server.

## 🏗️ Architecture Overview

### Core Technologies
- **Framework**: React Native with Expo Router
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Axios
- **Maps**: React Native Maps with Google Maps integration
- **Real-time**: WebSocket connections
- **Notifications**: Expo Notifications
- **Storage**: AsyncStorage
- **Location**: Expo Location
- **Places**: Google Places Autocomplete

### Project Structure
```
user/
├── app/                    # Expo Router pages
│   ├── (routes)/          # Authentication flows
│   │   ├── onboarding/    # App introduction
│   │   ├── login/         # Login screen
│   │   ├── otp-verification/ # OTP verification
│   │   ├── registration/  # User registration
│   │   ├── email-verification/ # Email verification
│   │   └── ride-details/  # Active ride tracking
│   ├── (tabs)/            # Main app tabs
│   │   ├── home.tsx       # Dashboard & ride booking
│   │   ├── services/      # Service selection
│   │   ├── history/       # Ride history
│   │   └── profile/       # User profile
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── common/           # Generic components (Button, Input)
│   ├── login/            # Authentication components
│   ├── ride/             # Ride-related components
│   └── location/         # Location search components
├── screens/               # Screen implementations
├── hooks/                 # Custom hooks
│   └── useGetUserData.tsx # User data management
├── themes/                # Design system
│   ├── app.colors.tsx    # Color palette
│   ├── app.constant.tsx  # Screen dimensions & fonts
│   └── app.fonts.tsx     # Typography
├── utils/                 # Utility functions
│   ├── container/         # Layout containers
│   ├── icons/            # Icon components
│   ├── images/           # Image assets
│   └── time/             # Time utilities
└── configs/               # Constants & configurations
    └── constants.tsx     # App constants
```

## 🔍 Key Features

### 1. Authentication Flow
- **Onboarding experience** with app introduction slides
- **Phone-based OTP authentication** for secure login
- **Multi-step registration** process:
  1. Phone number verification
  2. Personal information (name, email)
  3. Email verification (optional)
- **Secure token storage** using AsyncStorage

### 2. Core User Features
- **Ride booking** with Google Places integration
- **Real-time driver matching** via WebSocket
- **Live ride tracking** with map integration
- **Multiple vehicle types** (Car, Motorcycle, CNG)
- **Fare estimation** based on distance and driver rates
- **Ride history** and past trip management
- **Push notifications** for ride updates

### 3. UI/UX Components
- **Responsive design** with custom window dimensions
- **Consistent theming** with comprehensive color palette
- **Reusable components** (Button, Input, RideCard)
- **Map integration** with Google Maps and directions
- **Location search** with autocomplete
- **Swiper onboarding** experience

## 🚀 Enhancement Recommendations

### 1. Code Quality & Architecture

#### State Management Enhancement
```typescript
// Context API for global state management
interface AppState {
  user: User | null;
  currentRide: Ride | null;
  location: Location | null;
  isOnline: boolean;
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({
  state: initialState,
  dispatch: () => null
});

// Reducer for state management
const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_CURRENT_RIDE':
      return { ...state, currentRide: action.payload };
    case 'SET_LOCATION':
      return { ...state, location: action.payload };
    default:
      return state;
  }
};
```

#### Type Safety Improvements
```typescript
// Enhanced TypeScript interfaces
interface User {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  notificationToken?: string;
  ratings: number;
  totalRides: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Ride {
  id: string;
  userId: string;
  driverId: string;
  charge: number;
  currentLocationName: string;
  destinationLocationName: string;
  distance: string;
  status: 'Processing' | 'Ongoing' | 'Completed' | 'Cancelled';
  rating?: number;
  driver: Driver;
  user: User;
  createdAt: Date;
  updatedAt: Date;
}

interface Driver {
  id: string;
  name: string;
  phone_number: string;
  vehicle_type: 'Car' | 'Motorcycle' | 'CNG';
  rate: string;
  ratings: number;
  status: 'active' | 'inactive';
}
```

### 2. Performance Optimizations

#### Location Tracking Optimization
```typescript
// Optimized location tracking hook
const useLocationTracking = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  
  useEffect(() => {
    let watchId: Location.LocationSubscription;
    
    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      
      watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 50, // Update every 50 meters
        },
        (newLocation) => {
          setLocation(newLocation.coords);
          // Only send to server if significant movement
          if (shouldUpdateLocation(newLocation.coords)) {
            sendLocationUpdate(newLocation.coords);
          }
        }
      );
      setIsTracking(true);
    };
    
    startTracking();
    
    return () => {
      if (watchId) {
        watchId.remove();
      }
      setIsTracking(false);
    };
  }, []);
  
  return { location, isTracking };
};
```

#### Memory Management
```typescript
// WebSocket connection management
const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        setIsConnected(true);
        setSocket(ws);
        console.log('WebSocket connected');
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        setSocket(null);
        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    };
    
    connect();
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [url]);
  
  return { socket, isConnected };
};
```

### 3. Enhanced Features

#### Advanced Ride Booking
```typescript
// Enhanced ride booking with preferences
interface RidePreferences {
  vehicleType?: 'Car' | 'Motorcycle' | 'CNG';
  maxWaitTime?: number; // minutes
  maxDistance?: number; // km
  preferredDriver?: string;
  scheduledTime?: Date;
}

const useRideBooking = () => {
  const [preferences, setPreferences] = useState<RidePreferences>({});
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  
  const findDrivers = async (pickup: Location, destination: Location) => {
    setIsBooking(true);
    try {
      const response = await axios.post('/api/v1/ride/find-drivers', {
        pickup,
        destination,
        preferences
      });
      setAvailableDrivers(response.data.drivers);
    } catch (error) {
      console.error('Error finding drivers:', error);
    } finally {
      setIsBooking(false);
    }
  };
  
  const bookRide = async (driverId: string, rideData: any) => {
    try {
      const response = await axios.post('/api/v1/ride/book', {
        driverId,
        ...rideData
      });
      return response.data;
    } catch (error) {
      console.error('Error booking ride:', error);
      throw error;
    }
  };
  
  return {
    preferences,
    setPreferences,
    availableDrivers,
    isBooking,
    findDrivers,
    bookRide
  };
};
```

#### Real-time Ride Tracking
```typescript
// Real-time ride tracking with WebSocket
const useRideTracking = (rideId: string) => {
  const [rideStatus, setRideStatus] = useState<string>('Processing');
  const [driverLocation, setDriverLocation] = useState<Location | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(null);
  const { socket } = useWebSocket(process.env.EXPO_PUBLIC_SOCKET_URL!);
  
  useEffect(() => {
    if (socket && rideId) {
      // Join ride-specific room
      socket.send(JSON.stringify({
        type: 'join_ride',
        rideId
      }));
      
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'ride_status_update':
            setRideStatus(data.status);
            break;
          case 'driver_location_update':
            setDriverLocation(data.location);
            break;
          case 'estimated_arrival':
            setEstimatedArrival(new Date(data.arrivalTime));
            break;
        }
      };
    }
  }, [socket, rideId]);
  
  return {
    rideStatus,
    driverLocation,
    estimatedArrival
  };
};
```

### 4. Security Enhancements

#### Secure Token Management
```typescript
// Secure token storage with encryption
import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'your-secret-key';

const secureStorage = {
  async setItem(key: string, value: string) {
    const encrypted = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
    await SecureStore.setItemAsync(key, encrypted);
  },
  
  async getItem(key: string): Promise<string | null> {
    const encrypted = await SecureStore.getItemAsync(key);
    if (!encrypted) return null;
    
    try {
      const decrypted = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  },
  
  async removeItem(key: string) {
    await SecureStore.deleteItemAsync(key);
  }
};
```

#### API Security
```typescript
// Axios interceptors for security
axios.interceptors.request.use(
  async (config) => {
    const token = await secureStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await secureStorage.removeItem('accessToken');
      // Redirect to login
      router.replace('/(routes)/login');
    }
    return Promise.reject(error);
  }
);
```

### 5. User Experience Improvements

#### Offline Support
```typescript
// Offline queue for actions
const useOfflineQueue = () => {
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const addToQueue = (action: QueuedAction) => {
    setQueue(prev => [...prev, { ...action, timestamp: Date.now() }]);
  };
  
  const processQueue = async () => {
    if (!isOnline) return;
    
    for (const action of queue) {
      try {
        await executeAction(action);
        setQueue(prev => prev.filter(a => a.id !== action.id));
      } catch (error) {
        console.error('Failed to execute queued action:', error);
      }
    }
  };
  
  useEffect(() => {
    if (isOnline && queue.length > 0) {
      processQueue();
    }
  }, [isOnline, queue]);
  
  return { addToQueue, isOnline };
};
```

#### Enhanced Error Handling
```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
    // Log to crash reporting service
    logError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// Error fallback component
const ErrorFallback = ({ error }: { error: Error }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Something went wrong</Text>
    <Text style={styles.errorMessage}>{error.message}</Text>
    <Button
      title="Try Again"
      onPress={() => window.location.reload()}
    />
  </View>
);
```

### 6. Testing Implementation

#### Unit Tests
```typescript
// Jest tests for components
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../screens/home/home.screen';

describe('HomeScreen', () => {
  it('renders ride history correctly', async () => {
    const mockRides = [
      {
        id: '1',
        driver: { name: 'John Doe' },
        charge: 50,
        distance: '5km',
        status: 'Completed'
      }
    ];
    
    // Mock API response
    jest.spyOn(axios, 'get').mockResolvedValue({
      data: { rides: mockRides }
    });
    
    const { getByText } = render(<HomeScreen />);
    
    await waitFor(() => {
      expect(getByText('John Doe')).toBeTruthy();
      expect(getByText('BDT 50')).toBeTruthy();
    });
  });
  
  it('handles location search correctly', () => {
    const { getByPlaceholderText } = render(<HomeScreen />);
    const searchInput = getByPlaceholderText('Where to?');
    
    fireEvent.changeText(searchInput, 'New York');
    
    expect(searchInput.props.value).toBe('New York');
  });
});
```

#### Integration Tests
```typescript
// E2E tests with Detox
describe('Ride Booking Flow', () => {
  beforeEach(async () => {
    await device.launchApp();
  });
  
  it('should complete ride booking flow', async () => {
    // Login
    await element(by.id('phone-input')).typeText('+1234567890');
    await element(by.id('get-otp-button')).tap();
    
    // Enter OTP
    await element(by.id('otp-input')).typeText('1234');
    await element(by.id('verify-button')).tap();
    
    // Book ride
    await element(by.id('where-to-input')).typeText('Central Park');
    await element(by.id('confirm-booking')).tap();
    
    // Verify booking success
    await expect(element(by.id('booking-success'))).toBeVisible();
  });
});
```

### 7. Monitoring & Analytics

#### Crash Reporting
```typescript
// Sentry integration
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: __DEV__ ? 'development' : 'production',
});

// Track user actions
const trackEvent = (eventName: string, properties: any) => {
  Sentry.addBreadcrumb({
    message: eventName,
    data: properties,
    level: 'info'
  });
};

// Track ride events
const trackRideEvent = (event: 'ride_requested' | 'ride_completed' | 'ride_cancelled', data: any) => {
  Sentry.addBreadcrumb({
    message: `Ride ${event}`,
    data,
    level: 'info'
  });
};
```

#### Performance Monitoring
```typescript
// Performance monitoring
import { Performance } from 'react-native-performance';

const usePerformanceMonitoring = () => {
  const startTimer = (name: string) => {
    Performance.mark(`${name}-start`);
  };
  
  const endTimer = (name: string) => {
    Performance.mark(`${name}-end`);
    Performance.measure(name, `${name}-start`, `${name}-end`);
  };
  
  const measureAsync = async <T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    startTimer(name);
    try {
      const result = await fn();
      endTimer(name);
      return result;
    } catch (error) {
      endTimer(name);
      throw error;
    }
  };
  
  return { startTimer, endTimer, measureAsync };
};
```

## 📋 Implementation Priority

### High Priority
- ✅ Implement Context API for state management
- ✅ Add comprehensive TypeScript interfaces
- ✅ Secure token storage implementation
- ✅ Enhanced error handling and boundaries
- ✅ Optimize location tracking performance

### Medium Priority
- ⚡ Offline support and queue management
- ⚡ Advanced ride booking features
- ⚡ Real-time ride tracking
- ⚡ Comprehensive testing framework
- ⚡ Performance monitoring

### Low Priority
- 📊 Advanced analytics and crash reporting
- 🎨 Enhanced UI/UX components
- 🔒 Advanced security features
- 📈 User behavior analytics
- 🧪 End-to-end testing

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- React Native development environment
- Google Maps API key
- Google Places API key

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Environment Setup
Create a `.env` file in the user directory:
```env
EXPO_PUBLIC_SERVER_URI=http://your-server-url
EXPO_PUBLIC_SOCKET_URL=ws://your-socket-url
EXPO_PUBLIC_GOOGLE_CLOUD_API_KEY=your-google-maps-api-key
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY=your-google-places-api-key
```

## 📱 Current Features Status

- ✅ User authentication (OTP-based)
- ✅ Onboarding experience
- ✅ Ride booking with location search
- ✅ Real-time driver matching
- ✅ Live ride tracking
- ✅ Push notifications
- ✅ Ride history
- ✅ Multiple vehicle types
- ✅ Fare estimation
- ✅ Map integration

## 🔧 Development Notes

- The app uses Expo Router for navigation
- WebSocket connections are used for real-time features
- Location tracking updates every 5 seconds
- Push notifications are handled via Expo Notifications
- All API calls use Axios with Bearer token authentication
- Google Places API is used for location autocomplete

## 📞 Support

For development questions or issues, refer to the main project documentation or contact the development team.

---

*This documentation provides a comprehensive overview of the RiderIN User App architecture, features, and enhancement recommendations for future development.*
