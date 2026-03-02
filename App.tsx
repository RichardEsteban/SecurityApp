// SÁLVAME — App Entry Point
// Sets up gesture handler, reanimated, and navigation

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import {
  setupNotificationActions,
  registerBackgroundService,
} from './src/services/backgroundService';

export default function App() {
  useEffect(() => {
    // Initialize background services on app start
    setupNotificationActions();
    registerBackgroundService();
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
