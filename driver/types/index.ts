/**
 * Common TypeScript interfaces for the RiderIN Driver App
 */

// User related interfaces
export interface User {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  profile_picture?: string;
  created_at: string;
  updated_at: string;
}

// Driver related interfaces
export interface Driver {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  vehicle_type: 'Car' | 'Motorcycle' | 'CNG';
  rate: number;
  status: 'active' | 'inactive';
  profile_picture?: string;
  current_location?: Location;
  created_at: string;
  updated_at: string;
}

// Location related interfaces
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// Ride related interfaces
export interface Ride {
  id: string;
  user: User;
  driver?: Driver;
  currentLocation: Location;
  destination: Location;
  status: 'Processing' | 'Ongoing' | 'Completed' | 'Cancelled';
  charge: number;
  distance: number;
  created_at: string;
  updated_at: string;
}

// Authentication related interfaces
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  driver: Driver;
}

// API response interfaces
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Error related interfaces
export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Document related interfaces
export interface Document {
  id: string;
  type: 'license' | 'registration' | 'insurance';
  file_url: string;
  status: 'pending' | 'approved' | 'rejected';
  driver_id: string;
  created_at: string;
  updated_at: string;
}

// Notification related interfaces
export interface Notification {
  id: string;
  title: string;
  body: string;
  data?: any;
  read: boolean;
  created_at: string;
}

// Earnings related interfaces
export interface Earnings {
  total: number;
  today: number;
  weekly: number;
  monthly: number;
  rides: number;
}

// Vehicle related interfaces
export interface Vehicle {
  type: 'Car' | 'Motorcycle' | 'CNG';
  model?: string;
  year?: number;
  color?: string;
  license_plate?: string;
}

// Rating related interfaces
export interface Rating {
  id: string;
  user_id: string;
  driver_id: string;
  ride_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}