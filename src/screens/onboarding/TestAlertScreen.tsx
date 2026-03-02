// SÁLVAME — Test Alert Screen (Onboarding Step 3)

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { sendTestAlert } from '../../services/alertService';
import { setOnboardingComplete } from '../../services/storageService';
import { EmergencyContact } from '../../types';
import { displayPhone } from '../../utils/helpers';

interface Props {
  navigation: any;
  route: { params: { contact: EmergencyContact | null } };
}

function StepDot({ active = false, completed = false }: { active?: boolean; completed?: boolean }) {
  return (
    <View style={[styles.stepDot, active ? styles.stepDotActive : completed ? styles.stepDotCompleted : styles.stepDotInactive]} />
  );
}

function ReadyItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.readyItem}>
      <Text style={styles.readyIcon}>{icon}</Text>
      <Text style={styles.readyText}>{text}</Text>
    </View>
  );
}

export default function TestAlertScreen({ navigation, route }: Props) {
  const contact = route.params?.contact;
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSendTest() {
    if (!contact) { await finishOnboarding(); return; }
    setIsSending(true);
    try {
      await sendTestAlert('Usuario', [contact]);
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setIsSending(false);
    }
  }

  async function finishOnboarding() {
    await setOnboardingComplete();
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.stepIndicator}>
        <StepDot completed />
        <StepDot completed />
        <StepDot active />
      </View>

      <View style={styles.content}>
        {!sent ? (
          <>
            <Text style={styles.icon}>📨</Text>
            <Text style={styles.title}>Envía un mensaje de prueba</Text>
            <Text style={styles.subtitle}>
              Para que {contact?.name || 'tus contactos'} sepa que existe esta app antes de una emergencia real
            </Text>

            {contact && (
              <View style={styles.contactCard}>
                <View style={[styles.avatar, { backgroundColor: contact.avatarColor || Colors.primary }]}>
                  <Text style={styles.avatarText}>{contact.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactPhone}>{displayPhone(contact.phone)}</Text>
                </View>
              </View>
            )}

            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>Mensaje que recibirá:</Text>
              <Text style={styles.previewText}>
                ✅ Hola, te han agregado como contacto de emergencia en SÁLVAME. Si recibes un mensaje de SOS de esta app, significa que alguien necesita ayuda urgente. No necesitas instalar nada.
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.icon}>✅</Text>
            <Text style={styles.title}>¡Listo para protegerte!</Text>
            <Text style={styles.subtitle}>
              {contact ? `${contact.name} ya sabe que existe SÁLVAME y cómo responder si necesitas ayuda.` : 'Tu app está configurada y lista para usar.'}
            </Text>
            <View style={styles.readyCard}>
              <ReadyItem icon="⚡" text="Doble-click en el botón SOS para activar alerta" />
              <ReadyItem icon="⏱️" text="8 segundos para cancelar si fue accidental" />
              <ReadyItem icon="📍" text="Tu ubicación se comparte en tiempo real" />
            </View>
          </>
        )}
      </View>

      <View style={styles.ctaSection}>
        {!sent ? (
          <>
            <TouchableOpacity
              style={[styles.primaryButton, isSending && styles.buttonDisabled]}
              onPress={handleSendTest}
              disabled={isSending}
              activeOpacity={0.85}
            >
              {isSending ? <ActivityIndicator color={Colors.white} /> : (
                <Text style={styles.primaryButtonText}>{contact ? 'Enviar mensaje de prueba' : 'Continuar sin probar'}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={finishOnboarding} style={styles.skipButton}>
              <Text style={styles.skipText}>Omitir</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={finishOnboarding} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Ir a la app 🛡️</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: Spacing.lg },
  stepIndicator: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  stepDot: { height: 8, borderRadius: BorderRadius.full },
  stepDotActive: { backgroundColor: Colors.primary, width: 24 },
  stepDotCompleted: { backgroundColor: Colors.success, width: 8 },
  stepDotInactive: { backgroundColor: Colors.outline, width: 8 },
  content: { flex: 1, alignItems: 'center', paddingTop: Spacing.xl, gap: Spacing.lg },
  icon: { fontSize: 64 },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.onBackground, textAlign: 'center' },
  subtitle: { fontSize: Typography.base, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: Typography.base * Typography.normal },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md,
    width: '100%', borderWidth: 1, borderColor: Colors.outline,
  },
  avatar: { width: 48, height: 48, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.white },
  contactName: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.onBackground },
  contactPhone: { fontSize: Typography.sm, color: Colors.onSurfaceVariant },
  previewCard: { backgroundColor: Colors.surfaceVariant, borderRadius: BorderRadius.md, padding: Spacing.md, width: '100%', gap: Spacing.xs },
  previewLabel: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.onSurfaceDisabled, textTransform: 'uppercase', letterSpacing: 0.5 },
  previewText: { fontSize: Typography.sm, color: Colors.onSurfaceVariant, lineHeight: Typography.sm * Typography.normal },
  readyCard: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, padding: Spacing.lg,
    width: '100%', gap: Spacing.md, borderWidth: 1, borderColor: Colors.successContainer,
  },
  readyItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  readyIcon: { fontSize: 20, width: 28 },
  readyText: { flex: 1, fontSize: Typography.sm, color: Colors.onSurfaceVariant },
  ctaSection: { paddingBottom: Spacing['2xl'], gap: Spacing.md },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.md, alignItems: 'center', minHeight: 56, justifyContent: 'center' },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.white },
  skipButton: { alignItems: 'center', paddingVertical: Spacing.sm },
  skipText: { fontSize: Typography.sm, color: Colors.onSurfaceDisabled },
});
