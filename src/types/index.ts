// SÁLVAME — Core TypeScript Types

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string; // E.164 format: +51XXXXXXXXX
  verified: boolean;
  createdAt: number;
  avatarColor?: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  isPremium: boolean;
  createdAt: number;
  onboardingCompleted: boolean;
  contacts: EmergencyContact[];
}

export interface AlertSession {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  status: 'active' | 'cancelled' | 'resolved' | 'expired';
  triggeredAt: number;
  cancelledAt?: number;
  resolvedAt?: number;
  contacts: string[]; // phone numbers
  smsSentCount: number;
  smsFallbackUsed: boolean;
  trackingUrl: string;
  lastLocation?: GeoLocation;
  locationHistory: GeoLocation[];
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number;
  heading?: number;
}

export interface SOSState {
  phase: 'idle' | 'countdown' | 'active' | 'cancelled';
  sessionId?: string;
  countdownSeconds: number;
  triggeredAt?: number;
}

export interface SMSPayload {
  to: string[];
  userName: string;
  trackingUrl: string;
  timestamp: number;
}

// Navigation types
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  SOSCountdown: { sessionId: string };
  SOSActive: { sessionId: string };
  Contacts: undefined;
  AddContact: undefined;
  Settings: undefined;
  TestAlert: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  LocationPermission: undefined;
  AddFirstContact: undefined;
  TestAlert: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Contacts: undefined;
  Settings: undefined;
};

// App config
export const APP_CONFIG = {
  DOUBLE_CLICK_WINDOW_MS: 800,
  COUNTDOWN_SECONDS: 8,
  TRACKING_EXPIRY_HOURS: 2,
  TRACKING_UPDATE_INTERVAL_MS: 10000,
  MAX_FREE_CONTACTS: 3,
  TRACKING_BASE_URL: 'https://maps.salvame.app/track',
  BACKGROUND_TASK_NAME: 'SALVAME_SOS_BACKGROUND',
  LOCATION_TASK_NAME: 'SALVAME_LOCATION_TRACKING',
} as const;
