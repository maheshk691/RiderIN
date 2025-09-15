import { createClient } from 'redis';

// Create Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Connect to Redis
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Initialize connection
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    console.error('Redis connection error:', error);
    // Retry connection after 5 seconds
    setTimeout(connectRedis, 5000);
  }
};

// Store OTP with expiration (TTL)
export const storeOTP = async (key: string, otp: string, expiryInSeconds = 300) => {
  try {
    await redisClient.set(key, otp);
    await redisClient.expire(key, expiryInSeconds);
    return true;
  } catch (error) {
    console.error('Error storing OTP:', error);
    return false;
  }
};

// Verify OTP
export const verifyOTP = async (key: string, otp: string) => {
  try {
    const storedOTP = await redisClient.get(key);
    return storedOTP === otp;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
};

// Delete OTP after successful verification
export const deleteOTP = async (key: string) => {
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    console.error('Error deleting OTP:', error);
    return false;
  }
};

export { redisClient, connectRedis };