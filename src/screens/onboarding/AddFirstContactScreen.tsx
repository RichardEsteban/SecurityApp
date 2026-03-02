// SÁLVAME — Add First Contact Screen (Onboarding Step 2)

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { addContact } from '../../services/storageService';
import { generateSessionId, getAvatarColor, formatPhoneNumber, isValidPeruvianPhone, isValidName } from '../../utils/helpers';
import { EmergencyContact } from '../../types';

interface Props { navigation: any; }

function StepDot({ active = false, completed = false }: { active?: boolean; completed?: boolean }) {
  return (
    <View style={[styles.stepDot, active ? styles.stepDotActive : completed ? styles.stepDotCompleted : styles.stepDotInactive]} />
  );
}

export default function AddFirstContactScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  function validateForm(): boolean {
    let valid = true;
    if (!isValidName(name)) { setNameError('Ingresa un nombre válido (mínimo 2 caracteres)'); valid = false; } else setNameError('');
    if (!isValidPeruvianPhone(phone)) { setPhoneError('Ingresa un número peruano válido (ej: 987 654 321)'); valid = false; } else setPhoneError('');
    return valid;
  }

  async function handleAddContact() {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const contact: EmergencyContact = {
        id: generateSessionId(),
        name: name.trim(),
        phone: formatPhoneNumber(phone),
        verified: false,
        createdAt: Date.now(),
        avatarColor: getAvatarColor(name),
      };
      await addContact(contact);
      navigation.navigate('TestAlert', { contact });
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el contacto. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.stepIndicator}>
            <StepDot completed />
            <StepDot active />
            <StepDot />
          </View>

          <View style={styles.header}>
            <Text style={styles.icon}>👥</Text>
            <Text style={styles.title}>Agrega tu primer contacto</Text>
            <Text style={styles.subtitle}>Esta persona recibirá tu alerta de emergencia con tu ubicación en tiempo real</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput
                style={[styles.input, nameError ? styles.inputError : null]}
                placeholder="Ej: Mamá, Juan García"
                placeholderTextColor={Colors.onSurfaceDisabled}
                value={name}
                onChangeText={(t) => { setName(t); setNameError(''); }}
                autoCapitalize="words"
              />
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número de celular</Text>
              <View style={[styles.phoneInputContainer, phoneError ? styles.inputError : null]}>
                <Text style={styles.countryCode}>🇵🇪 +51</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="987 654 321"
                  placeholderTextColor={Colors.onSurfaceDisabled}
                  value={phone}
                  onChangeText={(t) => { setPhone(t.replace(/\D/g, '')); setPhoneError(''); }}
                  keyboardType="phone-pad"
                  maxLength={9}
                />
              </View>
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoText}>💡 Elige a alguien de confianza que pueda responder rápido: un familiar, pareja o amigo cercano.</Text>
            </View>
          </View>

          <View style={styles.ctaSection}>
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleAddContact}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>{isLoading ? 'Guardando...' : 'Continuar'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('TestAlert', { contact: null })} style={styles.skipButton}>
              <Text style={styles.skipText}>Omitir por ahora</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.lg, paddingBottom: Spacing['2xl'] },
  stepIndicator: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, paddingTop: Spacing.xl, paddingBottom: Spacing.md },
  stepDot: { height: 8, borderRadius: BorderRadius.full },
  stepDotActive: { backgroundColor: Colors.primary, width: 24 },
  stepDotCompleted: { backgroundColor: Colors.success, width: 8 },
  stepDotInactive: { backgroundColor: Colors.outline, width: 8 },
  header: { alignItems: 'center', paddingVertical: Spacing.xl },
  icon: { fontSize: 56, marginBottom: Spacing.md },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.onBackground, textAlign: 'center', marginBottom: Spacing.sm },
  subtitle: { fontSize: Typography.base, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: Typography.base * Typography.normal },
  form: { gap: Spacing.lg, marginBottom: Spacing.xl },
  inputGroup: { gap: Spacing.xs },
  label: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: Colors.surface, borderRadius: BorderRadius.md, borderWidth: 1,
    borderColor: Colors.outline, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    fontSize: Typography.md, color: Colors.onBackground,
  },
  inputError: { borderColor: Colors.error },
  phoneInputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.outline, paddingHorizontal: Spacing.md,
  },
  countryCode: { fontSize: Typography.md, color: Colors.onSurfaceVariant, marginRight: Spacing.sm, paddingVertical: Spacing.md },
  phoneInput: { flex: 1, fontSize: Typography.md, color: Colors.onBackground, paddingVertical: Spacing.md },
  errorText: { fontSize: Typography.xs, color: Colors.error },
  infoCard: { backgroundColor: Colors.surfaceVariant, borderRadius: BorderRadius.md, padding: Spacing.md },
  infoText: { fontSize: Typography.sm, color: Colors.onSurfaceVariant, lineHeight: Typography.sm * Typography.normal },
  ctaSection: { gap: Spacing.md },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.md, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  primaryButtonText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.white },
  skipButton: { alignItems: 'center', paddingVertical: Spacing.sm },
  skipText: { fontSize: Typography.sm, color: Colors.onSurfaceDisabled },
});
