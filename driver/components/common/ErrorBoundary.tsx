import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import color from '@/themes/app.colors';
import { windowHeight, windowWidth } from '@/themes/app.constant';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Here you would typically log to a service like Sentry
    // if (Sentry) {
    //   Sentry.captureException(error);
    // }
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  goToHome = (): void => {
    this.resetError();
    router.replace('/(tabs)/home');
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>
            The app encountered an unexpected error.
          </Text>
          
          {__DEV__ && this.state.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Error Details:</Text>
              <Text style={styles.errorText}>{this.state.error.toString()}</Text>
            </View>
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={this.resetError}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.button} onPress={this.goToHome}>
              <Text style={styles.buttonText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: windowWidth(20),
    backgroundColor: color.white,
  },
  title: {
    fontSize: windowHeight(24),
    fontWeight: 'bold',
    color: color.primary,
    marginBottom: windowHeight(10),
  },
  subtitle: {
    fontSize: windowHeight(16),
    color: color.subtitle,
    textAlign: 'center',
    marginBottom: windowHeight(20),
  },
  errorContainer: {
    width: '100%',
    padding: windowWidth(15),
    backgroundColor: color.lightGray,
    borderRadius: 8,
    marginBottom: windowHeight(20),
  },
  errorTitle: {
    fontSize: windowHeight(14),
    fontWeight: 'bold',
    marginBottom: windowHeight(5),
    color: color.subtitle,
  },
  errorText: {
    fontSize: windowHeight(12),
    color: color.danger,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: windowHeight(20),
  },
  button: {
    backgroundColor: color.primary,
    paddingVertical: windowHeight(12),
    paddingHorizontal: windowWidth(20),
    borderRadius: 8,
    flex: 1,
    marginHorizontal: windowWidth(5),
    alignItems: 'center',
  },
  buttonText: {
    color: color.white,
    fontSize: windowHeight(16),
    fontWeight: 'bold',
  },
});

export default ErrorBoundary;