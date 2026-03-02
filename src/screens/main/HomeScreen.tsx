// SÁLVAME — Home Screen
// THE most important screen: single prominent SOS button
// Double-click detection → countdown → alert activation
// Designed for stress: high contrast, large button, minimal UI

import React, { useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useSOSButton } from '../../hooks/useSOSButton';
import { useContacts } from '../../hooks/useContacts';
import { getCurrentLocation } from '../../services/locationService';
import { createAlertSession, sendSOSAlerts } from '../../services/alertService';
import { getUserProfile } from '../../services/storageService';
import { buildTrackingUrl } from '../../utils/helpers';

const { width } = Dimensions.get('window');
const BUTTON_SIZE = width * 0.65;

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { contacts } = useContacts();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  const handleSOSConfirmed = useCallback(async () => {
    try {
      const [profile, location] = await Promise.all([getUserProfile(), getCurrentLocation()]);
      const userName = profile?.name || 'Usuario';
      const userPhone = profile?.phone || '';

      const sessionId = await createAlertSession(
        profile?.uid || 'anonymous', userName, userPhone, contacts, location
      );

      navigation.navigate('SOSActive', { sessionId });

      const trackingUrl = buildTrackingUrl(sessionId);
      sendSOSAlerts(sessionId, userName, contacts, trackingUrl);
    } catch (error) {
      console.error('[HomeScreen] SOS activation failed:', error);
    }
  }, [contacts, navigation]);

  const { phase, countdownSeconds, handlePress, cancelSOS } = useSOSButton(handleSOSConfirmed);

  useEffect(() => {
    if (phase === 'countdown') {
      navigation.navigate('SOSCountdown', { countdownSeconds, onCancel: cancelSOS });
    }
  }, [phase]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1500, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.7, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const hasContacts = contacts.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background, '#1A0000', Colors.background]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <Text style={styles.appName}>🛡️ SÁLVAME</Text>
        <View style={[styles.statusBadge, hasContacts ? styles.statusActive : styles.statusWarning]}>
          <Text style={styles.statusText}>
            {hasContacts ? `${contacts.length} contacto${contacts.length > 1 ? 's' : ''}` : '⚠️ Sin contactos'}
          </Text>
        </View>
      </View>

      <View style={styles.buttonArea}>
        <Animated.View style={[styles.glowRing, { opacity: glowAnim, transform: [{ scale: pulseAnim }] }]} />
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.sosButton}
            onPress={handlePress}
            activeOpacity={0.9}
            accessibilityLabel="Botón SOS de emergencia"
            accessibilityHint="Presiona dos veces rápido para activar la alerta de emergencia"
          >
            <Text style={styles.sosButtonText}>SOS</Text>
            <Text style={styles.sosButtonSubtext}>2 clicks</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>¿Cómo activar?</Text>
        <View style={styles.instructionSteps}>
          <InstructionStep number="1" text="Presiona el botón SOS dos veces rápido" />
          <InstructionStep number="2" text="Tienes 8 segundos para cancelar si fue accidental" />
          <InstructionStep number="3" text="Tus contactos reciben tu ubicación en tiempo real" />
        </View>
      </View>

      {!hasContacts && (
        <TouchableOpacity style={styles.warningBanner} onPress={() => navigation.navigate('Contacts')}>
          <Text style={styles.warningText}>⚠️ Agrega contactos de emergencia para que la app funcione</Text>
          <Text style={styles.warningCta}>Agregar ahora →</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

function InstructionStep({ number, text }: { number: string; text: string }) {
  return (
    <View style={styles.instructionStep}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <Text style={styles.stepText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm,
  },
  appName: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.onBackground },
  statusBadge: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  statusActive: { backgroundColor: Colors.successContainer },
  statusWarning: { backgroundColor: Colors.warningContainer },
  statusText: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.white },
  buttonArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glowRing: {
    position: 'absolute', width: BUTTON_SIZE + 60, height: BUTTON_SIZE + 60,
    borderRadius: (BUTTON_SIZE + 60) / 2, backgroundColor: Colors.sosButtonGlow,
  },
  sosButton: {
    width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: BUTTON_SIZE / 2,
    backgroundColor: Colors.sosButton, alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.sosButtonShadow, shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8, shadowRadius: 24, elevation: 20,
    borderWidth: 4, borderColor: Colors.primaryLight,
  },
  sosButtonText: { fontSize: Typography['5xl'], fontWeight: Typography.black, color: Colors.white, letterSpacing: 4 },
  sosButtonSubtext: { fontSize: Typography.base, fontWeight: Typography.medium, color: 'rgba(255,255,255,0.8)', letterSpacing: 1, marginTop: -4 },
  instructions: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg },
  instructionTitle: {
    fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.onSurfaceDisabled,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: Spacing.md, textAlign: 'center',
  },
  instructionSteps: { gap: Spacing.sm },
  instructionStep: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepNumber: { width: 28, height: 28, borderRadius: BorderRadius.full, backgroundColor: Colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.onSurfaceVariant },
  stepText: { flex: 1, fontSize: Typography.sm, color: Colors.onSurfaceVariant },
  warningBanner: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    backgroundColor: Colors.warningContainer, borderRadius: BorderRadius.md, padding: Spacing.md, gap: Spacing.xs,
  },
  warningText: { fontSize: Typography.sm, color: Colors.white },
  warningCta: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.warning },
});
