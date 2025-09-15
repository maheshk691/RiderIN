import AsyncStorage from '@react-native-async-storage/async-storage';

// Token keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

/**
 * Secure token storage utility
 * 
 * This utility provides methods for securely storing and retrieving
 * authentication tokens. In a production environment, this should be
 * replaced with expo-secure-store for better security.
 */
const tokenStorage = {
  /**
   * Store access token
   * @param token The access token to store
   */
  async setAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing access token:', error);
      throw error;
    }
  },

  /**
   * Retrieve access token
   * @returns The stored access token or null if not found
   */
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving access token:', error);
      return null;
    }
  },

  /**
   * Store refresh token
   * @param token The refresh token to store
   */
  async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw error;
    }
  },

  /**
   * Retrieve refresh token
   * @returns The stored refresh token or null if not found
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error retrieving refresh token:', error);
      return null;
    }
  },

  /**
   * Clear all stored tokens
   */
  async clearTokens(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated (has a valid access token)
   * @returns True if user has an access token, false otherwise
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return token !== null;
  }
};

export default tokenStorage;