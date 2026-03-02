// SÁLVAME — Welcome Screen (Onboarding Step 0)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface Props { navigation: any; }

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background, '#1A0000', Colors.background]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.heroSection}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🛡️</Text>
        </View>
        <Text style={styles.appName}>SÁLVAME</Text>
        <Text style={styles.tagline}>Tu seguridad en 2 clicks</Text>
      </View>

      <View style={styles.valueProps}>
        <ValueProp icon="⚡" title="2 clicks = alerta enviada" description="Incluso con la pantalla apagada y el teléfono en el bolsillo" />
        <ValueProp icon="📍" title="Ubicación en tiempo real" description="Tus contactos ven dónde estás en un mapa actualizado cada 10 segundos" />
        <ValueProp icon="📱" title="Sin instalar nada" description="Tus contactos reciben el link por SMS. No necesitan la app." />
      </View>

      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('LocationPermission')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Empezar — es gratis</Text>
        </TouchableOpacity>
        <Text style={styles.disclaimer}>Configuración en menos de 3 minutos</Text>
      </View>
    </SafeAreaView>
  );
}

function ValueProp({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <View style={styles.valuePropRow}>
      <Text style={styles.valuePropIcon}>{icon}</Text>
      <View style={styles.valuePropText}>
        <Text style={styles.valuePropTitle}>{title}</Text>
        <Text style={styles.valuePropDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.lg },
  heroSection: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing['2xl'] },
  logoContainer: {
    width: 100, height: 100, borderRadius: BorderRadius.full,
    backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md, borderWidth: 2, borderColor: Colors.primary,
  },
  logoEmoji: { fontSize: 48 },
  appName: { fontSize: Typography['4xl'], fontWeight: Typography.black, color: Colors.primary, letterSpacing: 4, marginBottom: Spacing.xs },
  tagline: { fontSize: Typography.lg, color: Colors.onSurfaceVariant, fontWeight: Typography.medium },
  valueProps: { flex: 1, justifyContent: 'center', gap: Spacing.lg },
  valuePropRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  valuePropIcon: { fontSize: 28, width: 40, textAlign: 'center' },
  valuePropText: { flex: 1 },
  valuePropTitle: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.onBackground, marginBottom: 2 },
  valuePropDescription: { fontSize: Typography.sm, color: Colors.onSurfaceVariant, lineHeight: Typography.sm * Typography.normal },
  ctaSection: { paddingBottom: Spacing['2xl'], alignItems: 'center', gap: Spacing.md },
  primaryButton: {
    backgroundColor: Colors.primary, borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md, paddingHorizontal: Spacing['2xl'], width: '100%', alignItems: 'center',
  },
  primaryButtonText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.white, letterSpacing: 0.5 },
  disclaimer: { fontSize: Typography.sm, color: Colors.onSurfaceDisabled },
});
