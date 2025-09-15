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
    // You can add auth token logic here if needed
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
      // Handle unauthorized access (e.g., redirect to login)
      // This is already implemented in the existing code
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