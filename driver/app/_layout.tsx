import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { Stack } from "expo-router";
import { ToastProvider } from "react-native-toast-notifications";
import { LogBox } from "react-native";
import { DriverProvider } from "@/context/DriverContext";
import { useFonts } from "expo-font";
import React from "react";
import { initSentry } from "@/utils/sentry";

// Import our custom ErrorBoundary instead of using the one from expo-router
import ErrorBoundary from "@/components/common/ErrorBoundary";

// Initialize Sentry
initSentry();

// Prevent the splash screen from auto-hiding before asset loading is complete.
// SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "TT-Octosquares-Medium": require("../assets/fonts/TT-Octosquares-Medium.ttf"),
  });

  useEffect(() => {
    LogBox.ignoreAllLogs(true);
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <DriverProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
          </Stack>
        </DriverProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
