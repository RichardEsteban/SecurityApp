// SÁLVAME — Location Permission Screen (Onboarding Step 1)
// Ley 29733 compliant: explicit, informed consent before requesting permissions

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { requestLocationPermissions } from '../../services/locationService';
import { requestNotificationPermissions } from '../../services/backgroundService';

interface Props { navigation: any; }

function StepDot({ active = false }: { active?: boolean }) {
  return <View style={[styles.stepDot, active ? styles.stepDotActive : styles.stepDotInactive]} />;
}

function ExplanationItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.explanationItem}>
      <Text style={styles.explanationIcon}>{icon}</Text>
      <Text style={styles.explanationText}>{text}</Text>
    </View>
  );
}

export default function LocationPermissionScreen({ navigation }: Props) {
  const [isRequesting, setIsRequesting] = useState(false);

  async function handleGrantPermissions() {
    setIsRequesting(true);
    try {
      const locationGranted = await requestLocationPermissions();
      if (!locationGranted) {
        Alert.alert(
          'Permiso necesario',
          'SÁLVAME necesita acceso a tu ubicación para enviar tu posición exacta a tus contactos durante una emergencia.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Intentar de nuevo', onPress: handleGrantPermissions },
          ]
        );
        setIsRequesting(false);
        return;
      }
      await requestNotificationPermissions();
      navigation.navigate('AddFirstContact');
    } catch (error) {
      setIsRequesting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[Colors.background, '#001A0A', Colors.background]} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFillObject} />

      <View style={styles.stepIndicator}>
        <StepDot active />
        <StepDot />
        <StepDot />
      </View>

      <View style={styles.content}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.title}>Necesitamos tu ubicación</Text>
        <Text style={styles.subtitle}>Solo durante emergencias activas</Text>

        <View style={styles.explanationCard}>
          <Text style={styles.explanationTitle}>¿Por qué necesitamos esto?</Text>
          <ExplanationItem icon="✅" text="Tu ubicación GPS se activa SOLO cuando presionas el botón SOS" />
          <ExplanationItem icon="✅" text="Se comparte con tus contactos de emergencia en tiempo real" />
          <ExplanationItem icon="✅" text="Se desactiva automáticamente cuando cancelas la alerta" />
          <ExplanationItem icon="❌" text="NUNCA rastreamos tu ubicación en segundo plano sin alerta activa" />
        </View>

        <View style={styles.legalNote}>
          <Text style={styles.legalText}>
            🔒 Cumplimos con la Ley 29733 de Protección de Datos Personales del Perú. Tu ubicación nunca se vende ni comparte con terceros.
          </Text>
        </View>
      </View>

      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={[styles.primaryButton, isRequesting && styles.buttonDisabled]}
          onPress={handleGrantPermissions}
          disabled={isRequesting}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>{isRequesting ? 'Solicitando...' : 'Permitir ubicación'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('AddFirstContact')} style={styles.skipButton}>
          <Text style={styles.skipText}>Omitir por ahora</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.lg },
  stepIndicator: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  stepDot: { height: 8, borderRadius: BorderRadius.full },
  stepDotActive: { backgroundColor: Colors.primary, width: 24 },
  stepDotInactive: { backgroundColor: Colors.outline, width: 8 },
  content: { flex: 1, alignItems: 'center', paddingTop: Spacing.xl },
  icon: { fontSize: 64, marginBottom: Spacing.md },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.onBackground, textAlign: 'center', marginBottom: Spacing.xs },
  subtitle: { fontSize: Typography.md, color: Colors.onSurfaceVariant, textAlign: 'center', marginBottom: Spacing.xl },
  explanationCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    width: '100%', gap: Spacing.md, borderWidth: 1, borderColor: Colors.outline,
  },
  explanationTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.onBackground, marginBottom: Spacing.xs },
  explanationItem: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  explanationIcon: { fontSize: 16, width: 24 },
  explanationText: { flex: 1, fontSize: Typography.sm, color: Colors.onSurfaceVariant, lineHeight: Typography.sm * Typography.normal },
  legalNote: { marginTop: Spacing.md, padding: Spacing.md, backgroundColor: Colors.surfaceVariant, borderRadius: BorderRadius.md, width: '100%' },
  legalText: { fontSize: Typography.xs, color: Colors.onSurfaceDisabled, textAlign: 'center', lineHeight: Typography.xs * Typography.relaxed },
  ctaSection: { paddingBottom: Spacing['2xl'], gap: Spacing.md },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.white },
  skipButton: { alignItems: 'center', paddingVertical: Spacing.sm },
  skipText: { fontSize: Typography.sm, color: Colors.onSurfaceDisabled },
});
