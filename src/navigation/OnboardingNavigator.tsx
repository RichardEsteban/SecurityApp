// SÁLVAME — Onboarding Navigator

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import LocationPermissionScreen from '../screens/onboarding/LocationPermissionScreen';
import AddFirstContactScreen from '../screens/onboarding/AddFirstContactScreen';
import TestAlertScreen from '../screens/onboarding/TestAlertScreen';

const Stack = createNativeStackNavigator();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="LocationPermission" component={LocationPermissionScreen} />
      <Stack.Screen name="AddFirstContact" component={AddFirstContactScreen} />
      <Stack.Screen name="TestAlert" component={TestAlertScreen} />
    </Stack.Navigator>
  );
}
