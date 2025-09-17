import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { useDriver } from '@/context/DriverContext';

interface LocationData {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  accuracy: number | null;
  timestamp: number;
}

interface UseLocationTrackingOptions {
  distanceInterval?: number; // Minimum distance (in meters) between updates
  timeInterval?: number; // Minimum time (in milliseconds) between updates
  accuracy?: Location.Accuracy; // Location accuracy
  onLocationUpdate?: (location: LocationData) => void; // Callback for location updates
  highAccuracy?: boolean; // Enable higher precision tracking
}

/**
 * Custom hook for optimized location tracking with high precision option
 */
const useLocationTracking = (options: UseLocationTrackingOptions = {}) => {
  const {
    distanceInterval = 50, // Only update every 50 meters by default
    timeInterval = 5000, // Update every 5 seconds by default
    accuracy = Location.Accuracy.Balanced,
    onLocationUpdate,
    highAccuracy = false, // Default to normal accuracy
  } = options;

  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const lastUpdateTime = useRef<number>(0);
  const { updateDriverLocation, isOnline } = useDriver();

  // Calculate distance between two coordinates in meters
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Check if we should update location based on distance and time thresholds
  const shouldUpdateLocation = (newLocation: Location.LocationObject): boolean => {
    const now = Date.now();
    const timeDiff = now - lastUpdateTime.current;

    // Always update if this is the first location or enough time has passed
    if (!location || timeDiff > timeInterval) {
      lastUpdateTime.current = now;
      return true;
    }

    // Check distance threshold
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      newLocation.coords.latitude,
      newLocation.coords.longitude
    );

    if (distance > distanceInterval) {
      lastUpdateTime.current = now;
      return true;
    }

    return false;
  };

  // Start location tracking
  const startTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      setIsTracking(true);
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setErrorMsg('Failed to request location permissions');
    }
  };

  // Stop location tracking
  const stopTracking = () => {
    setIsTracking(false);
  };

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const setupLocationTracking = async () => {
      if (!isTracking) return;

      try {
        // Get initial location
        const currentLocation = await Location.getCurrentPositionAsync({
          accuracy,
        });

        const locationData: LocationData = {
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          heading: currentLocation.coords.heading,
          speed: currentLocation.coords.speed,
          accuracy: currentLocation.coords.accuracy,
          timestamp: currentLocation.timestamp,
        };

        setLocation(locationData);
        onLocationUpdate?.(locationData);

        if (highAccuracy && isOnline) {
          updateDriverLocation(locationData.latitude, locationData.longitude);
        } else if (isOnline) {
          updateDriverLocation(locationData.latitude, locationData.longitude);
        }

        // Start watching position
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy,
            distanceInterval, // Minimum distance between updates
            timeInterval, // Minimum time between updates
          },
          (newLocation) => {
            if (shouldUpdateLocation(newLocation)) {
              const updatedLocationData: LocationData = {
                latitude: newLocation.coords.latitude,
                longitude: newLocation.coords.longitude,
                heading: newLocation.coords.heading,
                speed: newLocation.coords.speed,
                accuracy: newLocation.coords.accuracy,
                timestamp: newLocation.timestamp,
              };

              setLocation(updatedLocationData);
              onLocationUpdate?.(updatedLocationData);

              if (isOnline) {
                updateDriverLocation(updatedLocationData.latitude, updatedLocationData.longitude);
              }
            }
          }
        );
      } catch (error) {
        console.error('Error setting up location tracking:', error);
        setErrorMsg('Failed to start location tracking');
      }
    };

    setupLocationTracking();

    // Cleanup function
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isTracking, isOnline, accuracy, distanceInterval, timeInterval]);

  return {
    location,
    errorMsg,
    isTracking,
    startTracking,
    stopTracking,
  };
};

export default useLocationTracking;