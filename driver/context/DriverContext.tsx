import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';
import api from '@/configs/api';
import tokenStorage from '@/utils/tokenStorage';
import { Toast } from 'react-native-toast-notifications';

import { Driver, Ride, Location } from '@/types';

interface DriverContextType {
  driver: Driver | null;
  isLoading: boolean;
  isOnline: boolean;
  currentRide: Ride | null;
  earnings: number;
  setIsOnline: (status: boolean) => void;
  setCurrentRide: (ride: Ride | null) => void;
  fetchDriverData: () => Promise<void>;
  logout: () => Promise<void>;
  updateDriverLocation: (latitude: number, longitude: number) => Promise<void>;
}

// Create the context with default values
const DriverContext = createContext<DriverContextType>({
  driver: null,
  isLoading: true,
  isOnline: false,
  currentRide: null,
  earnings: 0,
  setIsOnline: () => {},
  setCurrentRide: () => {},
  fetchDriverData: async () => {},
  logout: async () => {},
  updateDriverLocation: async () => {},
});

// Provider component
export const DriverProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(false);
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [earnings, setEarnings] = useState<number>(0);

  // Fetch driver data from API
  const fetchDriverData = async () => {
    try {
      setIsLoading(true);
      const token = await tokenStorage.getAccessToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      const response = await api.get('/driver/me');
      setDriver(response.data.driver);
      setIsOnline(response.data.driver.status === 'active');
      
      // Fetch earnings data
      const earningsResponse = await api.get('/driver/earnings');
      setEarnings(earningsResponse.data.total || 0);
      
      // Fetch current ride if any
      const ridesResponse = await api.get('/driver/current-ride');
      if (ridesResponse.data.ride) {
        setCurrentRide(ridesResponse.data.ride);
      }
    } catch (error) {
      console.error('Error fetching driver data:', error);
      Toast.show('Failed to load driver data', {
        type: 'danger',
        placement: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update driver online status
  const updateOnlineStatus = async (status: boolean) => {
    try {
      await api.post('/driver/update-status', {
        status: status ? 'active' : 'inactive',
      });
      setIsOnline(status);
    } catch (error) {
      console.error('Error updating driver status:', error);
      Toast.show('Failed to update status', {
        type: 'danger',
        placement: 'bottom',
      });
    }
  };

  // Update driver location
  const updateDriverLocation = async (latitude: number, longitude: number) => {
    try {
      if (!driver || !isOnline) return;
      
      await api.post('/driver/update-location', {
        latitude,
        longitude,
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await tokenStorage.clearTokens();
      setDriver(null);
      setCurrentRide(null);
      router.replace('/(routes)/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await tokenStorage.isAuthenticated();
      if (isAuth) {
        fetchDriverData();
      } else {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <DriverContext.Provider
      value={{
        driver,
        isLoading,
        isOnline,
        currentRide,
        earnings,
        setIsOnline: updateOnlineStatus,
        setCurrentRide,
        fetchDriverData,
        logout,
        updateDriverLocation,
      }}
    >
      {children}
    </DriverContext.Provider>
  );
};

// Custom hook to use the driver context
export const useDriver = () => useContext(DriverContext);

export default DriverContext;