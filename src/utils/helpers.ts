// SÁLVAME — Utility Helpers

import { APP_CONFIG } from '../types';

export function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}`.toUpperCase();
}

export function formatAlertMessage(userName: string, trackingUrl: string): string {
  const time = new Date().toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `🆘 ${userName} necesita ayuda urgente (${time}). Ver ubicación en vivo: ${trackingUrl}`;
}

export function formatFallbackSMS(userName: string): string {
  const time = new Date().toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
  return `🆘 EMERGENCIA: ${userName} necesita ayuda urgente. Hora: ${time}. Llama inmediatamente. (Enviado por SÁLVAME)`;
}

export function formatTestMessage(userName: string): string {
  return `✅ Hola, ${userName} te ha agregado como contacto de emergencia en SÁLVAME. Si recibes un mensaje de SOS de esta app, significa que ${userName} necesita ayuda urgente. No necesitas instalar nada.`;
}

export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('51')) return `+${digits}`;
  if (digits.startsWith('9') && digits.length === 9) return `+51${digits}`;
  if (digits.length === 9) return `+51${digits}`;
  return `+${digits}`;
}

export function isValidPeruvianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 9 && digits.startsWith('9')) return true;
  if (digits.length === 11 && digits.startsWith('519')) return true;
  return false;
}

export function displayPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('51') ? digits.slice(2) : digits;
  if (local.length === 9) {
    return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  return phone;
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function getTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'hace un momento';
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} h`;
  return `hace ${Math.floor(seconds / 86400)} días`;
}

const AVATAR_COLORS = [
  '#E53935', '#D81B60', '#8E24AA', '#5E35B1',
  '#1E88E5', '#00897B', '#43A047', '#FB8C00',
];

export function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export function buildTrackingUrl(sessionId: string): string {
  return `${APP_CONFIG.TRACKING_BASE_URL}/${sessionId}`;
}

export function isValidName(name: string): boolean {
  return name.trim().length >= 2 && name.trim().length <= 50;
}
