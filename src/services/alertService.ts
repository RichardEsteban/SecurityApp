// SÁLVAME — Alert Service
// Core service: Firestore session creation, Twilio SMS via Cloud Functions, fallback SMS

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import * as SMS from 'expo-sms';
import * as Haptics from 'expo-haptics';
import { db, functions } from './firebase';
import { AlertSession, GeoLocation, EmergencyContact, APP_CONFIG } from '../types';
import { generateSessionId, formatFallbackSMS, buildTrackingUrl } from '../utils/helpers';

export async function createAlertSession(
  userId: string,
  userName: string,
  userPhone: string,
  contacts: EmergencyContact[],
  location: GeoLocation | null
): Promise<string> {
  const sessionId = generateSessionId();
  const trackingUrl = buildTrackingUrl(sessionId);
  const now = Date.now();

  const session: AlertSession = {
    id: sessionId,
    userId,
    userName,
    userPhone,
    status: 'active',
    triggeredAt: now,
    contacts: contacts.map((c) => c.phone),
    smsSentCount: 0,
    smsFallbackUsed: false,
    trackingUrl,
    lastLocation: location || undefined,
    locationHistory: location ? [location] : [],
  };

  await setDoc(doc(db, 'alerts', sessionId), {
    ...session,
    triggeredAt: serverTimestamp(),
    expiresAt: new Date(now + APP_CONFIG.TRACKING_EXPIRY_HOURS * 60 * 60 * 1000),
  });

  return sessionId;
}

export async function sendSOSAlerts(
  sessionId: string,
  userName: string,
  contacts: EmergencyContact[],
  trackingUrl: string
): Promise<{ success: boolean; fallbackUsed: boolean }> {
  const phoneNumbers = contacts.map((c) => c.phone);

  try {
    const sendSMS = httpsCallable(functions, 'sendSOSAlert');
    await sendSMS({ sessionId, userName, phoneNumbers, trackingUrl });

    await updateDoc(doc(db, 'alerts', sessionId), {
      smsSentCount: phoneNumbers.length,
      smsFallbackUsed: false,
    });

    return { success: true, fallbackUsed: false };
  } catch (error) {
    console.warn('[AlertService] Twilio failed, trying native SMS fallback:', error);
    return await sendFallbackSMS(sessionId, userName, contacts);
  }
}

async function sendFallbackSMS(
  sessionId: string,
  userName: string,
  contacts: EmergencyContact[]
): Promise<{ success: boolean; fallbackUsed: boolean }> {
  const isAvailable = await SMS.isAvailableAsync();
  if (!isAvailable) return { success: false, fallbackUsed: false };

  const phoneNumbers = contacts.map((c) => c.phone);
  const message = formatFallbackSMS(userName);

  try {
    await SMS.sendSMSAsync(phoneNumbers, message);

    await updateDoc(doc(db, 'alerts', sessionId), {
      smsFallbackUsed: true,
      smsSentCount: phoneNumbers.length,
    });

    return { success: true, fallbackUsed: true };
  } catch (error) {
    console.error('[AlertService] Fallback SMS also failed:', error);
    return { success: false, fallbackUsed: false };
  }
}

export async function updateAlertLocation(
  sessionId: string,
  location: GeoLocation
): Promise<void> {
  try {
    await updateDoc(doc(db, 'alerts', sessionId), {
      lastLocation: location,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('[AlertService] Failed to update location:', error);
  }
}

export async function cancelAlert(sessionId: string): Promise<void> {
  await updateDoc(doc(db, 'alerts', sessionId), {
    status: 'cancelled',
    cancelledAt: serverTimestamp(),
  });
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
}

export async function resolveAlert(sessionId: string): Promise<void> {
  await updateDoc(doc(db, 'alerts', sessionId), {
    status: 'resolved',
    resolvedAt: serverTimestamp(),
  });
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}

export function subscribeToAlert(
  sessionId: string,
  callback: (session: AlertSession) => void
): Unsubscribe {
  return onSnapshot(doc(db, 'alerts', sessionId), (snap) => {
    if (snap.exists()) callback(snap.data() as AlertSession);
  });
}

export async function sendTestAlert(
  userName: string,
  contacts: EmergencyContact[]
): Promise<boolean> {
  try {
    const sendTest = httpsCallable(functions, 'sendTestAlert');
    await sendTest({
      userName,
      phoneNumbers: contacts.map((c) => c.phone),
    });
    return true;
  } catch (error) {
    console.error('[AlertService] Test alert failed:', error);
    return false;
  }
}
