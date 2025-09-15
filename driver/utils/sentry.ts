import * as Sentry from 'sentry-expo';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Initialize Sentry for crash reporting
 */
export const initSentry = (): void => {
  // Replace with your actual Sentry DSN
  const DSN = 'https://examplePublicKey@o0.ingest.sentry.io/0';
  
  Sentry.init({
    dsn: DSN,
    enableInExpoDevelopment: false,
    debug: __DEV__, // If true, Sentry will try to print out useful debugging information
    environment: __DEV__ ? 'development' : 'production',
    release: `RiderIN-driver@${Constants.expoConfig?.version}`,
    dist: Platform.OS === 'ios' 
      ? Constants.expoConfig?.ios?.buildNumber 
      : Constants.expoConfig?.android?.versionCode,
    tracesSampleRate: 0.2, // Capture 20% of transactions for performance monitoring
    enableAutoSessionTracking: true,
    sessionTrackingIntervalMillis: 30000, // 30 seconds
  });
};

/**
 * Capture an exception with Sentry
 * @param error The error to capture
 * @param context Additional context data
 */
export const captureException = (error: Error, context?: Record<string, any>): void => {
  Sentry.Native.captureException(error, {
    extra: context,
  });
};

/**
 * Capture a message with Sentry
 * @param message The message to capture
 * @param level The severity level
 * @param context Additional context data
 */
export const captureMessage = (
  message: string, 
  level: Sentry.Severity = Sentry.Severity.Info,
  context?: Record<string, any>
): void => {
  Sentry.Native.captureMessage(message, {
    level,
    extra: context,
  });
};

/**
 * Set user information for Sentry
 * @param user User information
 */
export const setUser = (user: { id: string; email?: string; username?: string }): void => {
  Sentry.Native.setUser(user);
};

/**
 * Clear user information from Sentry
 */
export const clearUser = (): void => {
  Sentry.Native.setUser(null);
};

/**
 * Add breadcrumb for tracking user actions
 * @param breadcrumb Breadcrumb information
 */
export const addBreadcrumb = (breadcrumb: {
  category: string;
  message: string;
  level?: Sentry.Severity;
  data?: Record<string, any>;
}): void => {
  Sentry.Native.addBreadcrumb({
    category: breadcrumb.category,
    message: breadcrumb.message,
    level: breadcrumb.level || Sentry.Severity.Info,
    data: breadcrumb.data,
  });
};

/**
 * Set a tag for the current scope
 * @param key Tag key
 * @param value Tag value
 */
export const setTag = (key: string, value: string): void => {
  Sentry.Native.setTag(key, value);
};

/**
 * Wrap a component with Sentry error boundary
 * @param component The component to wrap
 */
export const withErrorBoundary = Sentry.Native.withErrorBoundary;

export default {
  initSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  setTag,
  withErrorBoundary,
  Severity: Sentry.Severity,
};