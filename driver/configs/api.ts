import axios from 'axios';
import { Platform } from 'react-native';
import { Toast } from 'react-native-toast-notifications';

export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_SERVER_URI || 'http://localhost:3000/api/v1',
  SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL || 'ws://localhost:8080',
  TIMEOUT: 10000,
};

// Create axios instance with default config
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Import dynamically to avoid circular dependency
      const tokenStorage = (await import('@/utils/tokenStorage')).default;
      const token = await tokenStorage.getAccessToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error setting auth header:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('Network Error detected:', error);
      
      // Show user-friendly message
      Toast.show('Network error. Please check your internet connection and try again.', {
        type: 'danger',
        placement: 'bottom',
        duration: 4000,
      });
      
      // You can implement retry logic here if needed
    }
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Import dynamically to avoid circular dependency
      import('@/utils/tokenStorage').then(module => {
        const tokenStorage = module.default;
        // Clear tokens and redirect to login
        tokenStorage.clearTokens().then(() => {
          // Use setTimeout to avoid calling router during render
          setTimeout(() => {
            // Import router dynamically to avoid circular dependency
            import('expo-router').then(({ router }) => {
              router.replace('/(routes)/login');
            });
          }, 0);
        });
      }).catch(err => {
        console.error('Error handling 401:', err);
      });
    }
    
    // Handle other API errors
    if (error.response) {
      console.error('API Error:', error.response.data);
      
      // Show error message from API if available
      const errorMessage = error.response.data?.message || 'Something went wrong';
      Toast.show(errorMessage, {
        type: 'danger',
        placement: 'bottom',
        duration: 4000,
      });
    }
    
    return Promise.reject(error);
  }
);

export default api;