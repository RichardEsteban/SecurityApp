// SÁLVAME — Background Service (Android)
// Double-click SOS trigger with screen off via Android Foreground Service
// Uses expo-task-manager + expo-notifications for persistent notification action

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import { APP_CONFIG } from '../types';

const BACKGROUND_TASK = APP_CONFIG.BACKGROUND_TASK_NAME;

let lastClickTime = 0;
let clickCount = 0;

// ─── Background Task (keeps app alive) ───────────────────────────────────────

TaskManager.defineTask(BACKGROUND_TASK, async () => {
  console.log('[BackgroundService] Heartbeat tick');
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

// ─── Notification Actions (SOS trigger from notification) ────────────────────

export async function setupNotificationActions(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  await Notifications.setNotificationCategoryAsync('SOS_READY', [
    {
      identifier: 'SOS_TRIGGER',
      buttonTitle: '🆘 ACTIVAR SOS',
      options: {
        isDestructive: true,
        isAuthenticationRequired: false,
        opensAppToForeground: true,
      },
    },
  ]);
}

export async function showSOSReadyNotification(): Promise<string> {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🛡️ SÁLVAME activo',
      body: 'Toca "ACTIVAR SOS" en caso de emergencia',
      categoryIdentifier: 'SOS_READY',
      color: '#E8281A',
      sticky: true,
      autoDismiss: false,
      data: { type: 'SOS_READY' },
    },
    trigger: null,
  });
  return notificationId;
}

export async function dismissSOSNotification(notificationId: string): Promise<void> {
  await Notifications.dismissNotificationAsync(notificationId);
}

// ─── Double-Click Detection ───────────────────────────────────────────────────

export function handleSOSButtonPress(onDoubleClick: () => void): void {
  const now = Date.now();
  const timeSinceLastClick = now - lastClickTime;

  if (timeSinceLastClick <= APP_CONFIG.DOUBLE_CLICK_WINDOW_MS) {
    clickCount = 0;
    lastClickTime = 0;
    onDoubleClick();
  } else {
    clickCount = 1;
    lastClickTime = now;

    setTimeout(() => {
      if (clickCount === 1) {
        clickCount = 0;
        lastClickTime = 0;
      }
    }, APP_CONFIG.DOUBLE_CLICK_WINDOW_MS + 100);
  }
}

// ─── Register Background Fetch ────────────────────────────────────────────────

export async function registerBackgroundService(): Promise<void> {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK, {
      minimumInterval: 60,
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (error) {
    console.error('[BackgroundService] Registration failed:', error);
  }
}

export async function unregisterBackgroundService(): Promise<void> {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TASK);
  } catch (error) {
    console.error('[BackgroundService] Unregistration failed:', error);
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: false,
    },
  });
  return status === 'granted';
}
