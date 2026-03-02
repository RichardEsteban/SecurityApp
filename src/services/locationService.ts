// SÁLVAME — Location Service
// GPS tracking ONLY during active alerts — never passive background tracking
// Privacy-first: Ley 29733 compliant

import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { GeoLocation, APP_CONFIG } from '../types';
import { updateAlertLocation } from './alertService';

let activeSessionId: string | null = null;
let locationSubscription: Location.LocationSubscription | null = null;

// ─── Background Location Task ─────────────────────────────────────────────────

TaskManager.defineTask(APP_CONFIG.LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('[LocationService] Background task error:', error);
    return;
  }

  if (data && activeSessionId) {
    const { locations } = data as { locations: Location.LocationObject[] };
    const latest = locations[locations.length - 1];

    if (latest) {
      const geoLocation: GeoLocation = {
        latitude: latest.coords.latitude,
        longitude: latest.coords.longitude,
        accuracy: latest.coords.accuracy || 0,
        timestamp: latest.timestamp,
        speed: latest.coords.speed || undefined,
        heading: latest.coords.heading || undefined,
      };
      await updateAlertLocation(activeSessionId, geoLocation);
    }
  }
});

export async function requestLocationPermissions(): Promise<boolean> {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') return false;

  const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
  return backgroundStatus === 'granted';
}

export async function checkLocationPermissions(): Promise<{
  foreground: boolean;
  background: boolean;
}> {
  const { status: foreground } = await Location.getForegroundPermissionsAsync();
  const { status: background } = await Location.getBackgroundPermissionsAsync();
  return {
    foreground: foreground === 'granted',
    background: background === 'granted',
  };
}

export async function getCurrentLocation(): Promise<GeoLocation | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy || 0,
      timestamp: location.timestamp,
      speed: location.coords.speed || undefined,
      heading: location.coords.heading || undefined,
    };
  } catch (error) {
    console.error('[LocationService] Failed to get current location:', error);
    return null;
  }
}

export async function startLocationTracking(sessionId: string): Promise<void> {
  activeSessionId = sessionId;

  try {
    await Location.startLocationUpdatesAsync(APP_CONFIG.LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: APP_CONFIG.TRACKING_UPDATE_INTERVAL_MS,
      distanceInterval: 10,
      foregroundService: {
        notificationTitle: '🆘 SÁLVAME — Alerta activa',
        notificationBody: 'Tu ubicación está siendo compartida con tus contactos de emergencia.',
        notificationColor: '#E8281A',
      },
      pausesUpdatesAutomatically: false,
      showsBackgroundLocationIndicator: true,
    });
  } catch (error) {
    console.error('[LocationService] Failed to start background tracking, using foreground:', error);

    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: APP_CONFIG.TRACKING_UPDATE_INTERVAL_MS,
        distanceInterval: 10,
      },
      async (location) => {
        if (activeSessionId) {
          await updateAlertLocation(activeSessionId, {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            timestamp: location.timestamp,
          });
        }
      }
    );
  }
}

export async function stopLocationTracking(): Promise<void> {
  activeSessionId = null;

  try {
    const isTracking = await Location.hasStartedLocationUpdatesAsync(APP_CONFIG.LOCATION_TASK_NAME);
    if (isTracking) {
      await Location.stopLocationUpdatesAsync(APP_CONFIG.LOCATION_TASK_NAME);
    }
  } catch (error) {
    console.error('[LocationService] Failed to stop background tracking:', error);
  }

  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
}

export function formatCoordinates(location: GeoLocation): string {
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
}

export function getGoogleMapsUrl(location: GeoLocation): string {
  return `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
}
