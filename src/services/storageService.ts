// SÁLVAME — Storage Service
// Local persistence: user profile, contacts, onboarding state

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { UserProfile, EmergencyContact } from '../types';

const KEYS = {
  USER_PROFILE: 'salvame_user_profile',
  CONTACTS: 'salvame_contacts',
  ONBOARDING_COMPLETE: 'salvame_onboarding_complete',
  AUTH_TOKEN: 'salvame_auth_token',
  NOTIFICATION_ID: 'salvame_notification_id',
} as const;

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
  return data ? JSON.parse(data) : null;
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  const current = await getUserProfile();
  if (current) await saveUserProfile({ ...current, ...updates });
}

export async function saveContacts(contacts: EmergencyContact[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.CONTACTS, JSON.stringify(contacts));
}

export async function getContacts(): Promise<EmergencyContact[]> {
  const data = await AsyncStorage.getItem(KEYS.CONTACTS);
  return data ? JSON.parse(data) : [];
}

export async function addContact(contact: EmergencyContact): Promise<EmergencyContact[]> {
  const contacts = await getContacts();
  const updated = [...contacts, contact];
  await saveContacts(updated);
  return updated;
}

export async function removeContact(contactId: string): Promise<EmergencyContact[]> {
  const contacts = await getContacts();
  const updated = contacts.filter((c) => c.id !== contactId);
  await saveContacts(updated);
  return updated;
}

export async function updateContact(
  contactId: string,
  updates: Partial<EmergencyContact>
): Promise<EmergencyContact[]> {
  const contacts = await getContacts();
  const updated = contacts.map((c) => (c.id === contactId ? { ...c, ...updates } : c));
  await saveContacts(updated);
  return updated;
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
}

export async function isOnboardingComplete(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
  return value === 'true';
}

export async function saveNotificationId(id: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.NOTIFICATION_ID, id);
}

export async function getNotificationId(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.NOTIFICATION_ID);
}

export async function saveAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(KEYS.AUTH_TOKEN, token);
}

export async function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(KEYS.AUTH_TOKEN);
}

export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.AUTH_TOKEN);
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove([
    KEYS.USER_PROFILE,
    KEYS.CONTACTS,
    KEYS.ONBOARDING_COMPLETE,
    KEYS.NOTIFICATION_ID,
  ]);
  await clearAuthToken();
}
