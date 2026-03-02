// SÁLVAME — SOS Active Screen
// Shown when alert is active and contacts have been notified

import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Animated, Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { subscribeToAlert, resolveAlert } from '../../services/alertService';
import { startLocationTracking, stopLocationTracking } from '../../services/locationService';
import { AlertSession } from '../../types';

export default function SOSActiveScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { sessionId } = route.params;
  const [session, setSession] = useState<AlertSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const unsubscribe = subscribeToAlert(sessionId, (data) => {
      setSession(data);
      if (data.status === 'resolved' || data.status === 'cancelled') {
        setTimeout(() => navigation.navigate('Main'), 1500);
      }
    });
    return unsubscribe;
  }, [sessionId]);

  useEffect(() => {
    startLocationTracking(sessionId);
    return () => { stopLocationTracking(); };
  }, [sessionId]);

  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleResolve = useCallback(() => {
    Alert.alert(
      '¿Estás a salvo?',
      'Esto marcará la alerta como resuelta y dejará de compartir tu ubicación.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, estoy a salvo',
          onPress: async () => {
            await stopLocationTracking();
            await resolveAlert(sessionId);
            navigation.navigate('Main');
          },
        },
      ]
    );
  }, [sessionId, navigation]);

  const formatElapsed = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.alertHeader}>
        <View style={styles.alertIndicator}>
          <Animated.View style={[styles.pulseDot, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.solidDot} />
        </View>
        <Text style={styles.alertTitle}>ALERTA ACTIVA</Text>
        <Text style={styles.elapsedTime}>{formatElapsed(elapsedSeconds)}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.statusCard}>
          <Text style={styles.statusCardTitle}>Estado de la alerta</Text>
          <StatusRow icon="📨" label="SMS enviados" value={session ? `${session.smsSentCount} contacto${session.smsSentCount !== 1 ? 's' : ''}` : '...'} success={session ? session.smsSentCount > 0 : false} />
          <StatusRow icon="📍" label="Ubicación" value={session?.lastLocation ? 'Compartiendo en tiempo real' : 'Obteniendo GPS...'} success={!!session?.lastLocation} />
          <StatusRow icon={session?.smsFallbackUsed ? '📵' : '🌐'} label="Canal" value={session?.smsFallbackUsed ? 'SMS directo (sin internet)' : 'Twilio SMS'} success />
        </View>

        {session && session.contacts.length > 0 && (
          <View style={styles.contactsCard}>
            <Text style={styles.contactsTitle}>Contactos notificados</Text>
            {session.contacts.map((phone, index) => (
              <View key={index} style={styles.contactRow}>
                <Text style={styles.contactIcon}>✅</Text>
                <Text style={styles.contactPhone}>{phone}</Text>
              </View>
            ))}
          </View>
        )}

        {session?.trackingUrl && (
          <View style={styles.trackingCard}>
            <Text style={styles.trackingTitle}>🗺️ Link de seguimiento</Text>
            <Text style={styles.trackingUrl}>{session.trackingUrl}</Text>
            <Text style={styles.trackingNote}>Tus contactos pueden ver tu ubicación en tiempo real en este link</Text>
          </View>
        )}

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>¿Qué hacer ahora?</Text>
          <Text style={styles.instructionsText}>
            • Mantén el teléfono contigo{'\n'}
            • Tus contactos ya saben dónde estás{'\n'}
            • Si puedes, llama al 105 (PNP) o 116 (Bomberos){'\n'}
            • Cuando estés a salvo, presiona el botón de abajo
          </Text>
        </View>
      </ScrollView>

      <View style={styles.resolveContainer}>
        <TouchableOpacity style={styles.resolveButton} onPress={handleResolve} activeOpacity={0.85}>
          <Text style={styles.resolveButtonText}>✅ Estoy a salvo — Terminar alerta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function StatusRow({ icon, label, value, success }: { icon: string; label: string; value: string; success: boolean }) {
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusIcon}>{icon}</Text>
      <View style={styles.statusInfo}>
        <Text style={styles.statusLabel}>{label}</Text>
        <Text style={[styles.statusValue, success ? styles.statusSuccess : styles.statusPending]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D0000' },
  alertHeader: {
    backgroundColor: Colors.primaryContainer, paddingVertical: Spacing.lg, paddingHorizontal: Spacing.lg,
    alignItems: 'center', gap: Spacing.xs, borderBottomWidth: 2, borderBottomColor: Colors.primary,
  },
  alertIndicator: { position: 'relative', width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  pulseDot: { position: 'absolute', width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(232, 40, 26, 0.4)' },
  solidDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  alertTitle: { fontSize: Typography.xl, fontWeight: Typography.black, color: Colors.primary, letterSpacing: 3 },
  elapsedTime: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.onSurfaceVariant },
  content: { flex: 1 },
  contentContainer: { padding: Spacing.lg, gap: Spacing.md },
  statusCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md, borderWidth: 1, borderColor: Colors.outline },
  statusCardTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.onSurfaceDisabled, textTransform: 'uppercase', letterSpacing: 0.5 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  statusIcon: { fontSize: 20, width: 28 },
  statusInfo: { flex: 1 },
  statusLabel: { fontSize: Typography.xs, color: Colors.onSurfaceDisabled },
  statusValue: { fontSize: Typography.base, fontWeight: Typography.medium },
  statusSuccess: { color: Colors.success },
  statusPending: { color: Colors.warning },
  contactsCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.outline },
  contactsTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.onSurfaceDisabled, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.xs },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  contactIcon: { fontSize: 16 },
  contactPhone: { fontSize: Typography.base, color: Colors.onSurfaceVariant },
  trackingCard: { backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.sm, borderWidth: 1, borderColor: Colors.outline },
  trackingTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.onBackground },
  trackingUrl: { fontSize: Typography.sm, color: Colors.info, fontFamily: 'monospace' },
  trackingNote: { fontSize: Typography.xs, color: Colors.onSurfaceDisabled },
  instructionsCard: { backgroundColor: Colors.surfaceVariant, borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.sm },
  instructionsTitle: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.onBackground },
  instructionsText: { fontSize: Typography.sm, color: Colors.onSurfaceVariant, lineHeight: Typography.sm * Typography.relaxed },
  resolveContainer: { padding: Spacing.lg, paddingBottom: Spacing['2xl'] },
  resolveButton: { backgroundColor: Colors.successContainer, borderRadius: BorderRadius.full, paddingVertical: Spacing.lg, alignItems: 'center', borderWidth: 2, borderColor: Colors.success },
  resolveButtonText: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.success },
});
