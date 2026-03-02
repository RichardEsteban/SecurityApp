// SÁLVAME — SOS Countdown Screen
// 8-second countdown with cancel option
// Full-screen takeover: high contrast, large countdown, prominent cancel button

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { APP_CONFIG } from '../../types';

const { width } = Dimensions.get('window');
const RING_SIZE = width * 0.7;

export default function SOSCountdownScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [seconds, setSeconds] = useState(APP_CONFIG.COUNTDOWN_SECONDS);
  const [cancelled, setCancelled] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(async () => {
      setSeconds((prev) => {
        const next = prev - 1;
        if (next <= 3 && next > 0) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        if (next <= 0) {
          clearInterval(intervalRef.current!);
          navigation.replace('SOSActive', { sessionId: route.params?.sessionId });
        }
        return next;
      });
    }, 1000);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [seconds]);

  const handleCancel = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setCancelled(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(async () => { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }, 150);
    setTimeout(() => navigation.goBack(), 1200);
  }, [navigation]);

  if (cancelled) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.cancelledContainer}>
          <Text style={styles.cancelledIcon}>✅</Text>
          <Text style={styles.cancelledTitle}>Alerta cancelada</Text>
          <Text style={styles.cancelledSubtitle}>No se envió ningún mensaje</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isUrgent = seconds <= 3;

  return (
    <SafeAreaView style={[styles.container, isUrgent && styles.containerUrgent]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚠️ ALERTA EN PROGRESO</Text>
        <Text style={styles.headerSubtitle}>Toca CANCELAR si fue accidental</Text>
      </View>

      <View style={styles.ringContainer}>
        <View style={styles.ringBackground} />
        <Animated.View style={[styles.countdownCenter, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={[styles.countdownNumber, isUrgent && styles.countdownNumberUrgent]}>{seconds}</Text>
          <Text style={styles.countdownLabel}>segundos</Text>
        </Animated.View>
      </View>

      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>
          {isUrgent ? '🚨 ¡Enviando alerta ahora!' : 'Se enviará alerta a tus contactos de emergencia'}
        </Text>
      </View>

      <View style={styles.cancelContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} activeOpacity={0.85}>
          <Text style={styles.cancelButtonText}>✕ CANCELAR</Text>
        </TouchableOpacity>
        <Text style={styles.cancelHint}>Si no cancelas, la alerta se enviará automáticamente</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A0000', alignItems: 'center' },
  containerUrgent: { backgroundColor: '#2A0000' },
  header: { paddingTop: Spacing['2xl'], paddingHorizontal: Spacing.lg, alignItems: 'center', gap: Spacing.xs },
  headerTitle: { fontSize: Typography.xl, fontWeight: Typography.black, color: Colors.primary, letterSpacing: 2, textAlign: 'center' },
  headerSubtitle: { fontSize: Typography.base, color: Colors.onSurfaceVariant, textAlign: 'center' },
  ringContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', width: RING_SIZE },
  ringBackground: { position: 'absolute', width: RING_SIZE, height: RING_SIZE, borderRadius: RING_SIZE / 2, borderWidth: 12, borderColor: Colors.primaryContainer },
  countdownCenter: { alignItems: 'center', justifyContent: 'center' },
  countdownNumber: { fontSize: 120, fontWeight: Typography.black, color: Colors.primary, lineHeight: 120 },
  countdownNumberUrgent: { color: Colors.primaryLight },
  countdownLabel: { fontSize: Typography.lg, color: Colors.onSurfaceVariant, fontWeight: Typography.medium, marginTop: -Spacing.sm },
  messageContainer: { paddingHorizontal: Spacing.xl, paddingBottom: Spacing.xl },
  messageText: { fontSize: Typography.base, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: Typography.base * Typography.normal },
  cancelContainer: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing['3xl'], alignItems: 'center', gap: Spacing.md, width: '100%' },
  cancelButton: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.full, paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing['2xl'], width: '100%', alignItems: 'center', borderWidth: 2, borderColor: Colors.outline,
  },
  cancelButtonText: { fontSize: Typography.xl, fontWeight: Typography.black, color: Colors.onBackground, letterSpacing: 2 },
  cancelHint: { fontSize: Typography.xs, color: Colors.onSurfaceDisabled, textAlign: 'center' },
  cancelledContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  cancelledIcon: { fontSize: 80 },
  cancelledTitle: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.success },
  cancelledSubtitle: { fontSize: Typography.base, color: Colors.onSurfaceVariant },
});
