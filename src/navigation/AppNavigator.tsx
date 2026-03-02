// SÁLVAME — App Navigator

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { isOnboardingComplete } from '../services/storageService';
import { Colors } from '../constants/theme';
import OnboardingNavigator from './OnboardingNavigator';
import MainNavigator from './MainNavigator';
import SOSCountdownScreen from '../screens/main/SOSCountdownScreen';
import SOSActiveScreen from '../screens/main/SOSActiveScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [onboardingDone, setOnboardingDone] = useState(false);

  useEffect(() => {
    isOnboardingComplete().then((done) => {
      setOnboardingDone(done);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: Colors.primary,
          background: Colors.background,
          card: Colors.surface,
          text: Colors.onBackground,
          border: Colors.outline,
          notification: Colors.primary,
        },
      }}
    >
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!onboardingDone ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainNavigator} />
            <Stack.Screen
              name="SOSCountdown"
              component={SOSCountdownScreen}
              options={{ animation: 'fade', gestureEnabled: false }}
            />
            <Stack.Screen
              name="SOSActive"
              component={SOSActiveScreen}
              options={{ animation: 'fade', gestureEnabled: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
