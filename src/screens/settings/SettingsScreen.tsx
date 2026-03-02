// SÁLVAME — Settings Screen

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
  ScrollView, Alert, TextInput,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { getUserProfile, saveUserProfile, clearAllData } from '../../services/storageService';
import { UserProfile } from '../../types';
import { isValidName, isValidPeruvianPhone, formatPhoneNumber } from '../../utils/helpers';

export default function SettingsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempPhone, setTempPhone] = useState('');

  useEffect(() => {
    getUserProfile().then((p) => {
      setProfile(p);
      if (p) { setTempName(p.name || ''); setTempPhone(p.phone || ''); }
    });
  }, []);

  async function saveName() {
    if (!isValidName(tempName)) { Alert.alert('Error', 'Nombre inválido'); return; }
    const updated = { ...(profile || {}), name: tempName.trim() } as UserProfile;
    await saveUserProfile(updated);
    setProfile(updated);
    setEditingName(false);
  }

  async function savePhone() {
    if (!isValidPeruvianPhone(tempPhone)) { Alert.alert('Error', 'Número peruano inválido'); return; }
    const updated = { ...(profile || {}), phone: formatPhoneNumber(tempPhone) } as UserProfile;
    await saveUserProfile(updated);
    setProfile(updated);
    setEditingPhone(false);
  }

  function handleResetApp() {
    Alert.alert('⚠️ Restablecer app', 'Esto eliminará todos tus datos locales. ¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Restablecer', style: 'destructive', onPress: async () => { await clearAllData(); Alert.alert('Listo', 'App restablecida. Reinicia la aplicación.'); } },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Ajustes</Text>
        </View>

        <Text style={styles.sectionHeader}>MI PERFIL</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Nombre</Text>
              {editingName ? (
                <TextInput style={styles.inlineInput} value={tempName} onChangeText={setTempName} autoFocus autoCapitalize="words" onSubmitEditing={saveName} />
              ) : (
                <Text style={styles.settingValue}>{profile?.name || 'Sin nombre'}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => editingName ? saveName() : setEditingName(true)} style={styles.editButton}>
              <Text style={styles.editButtonText}>{editingName ? 'Guardar' : 'Editar'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Celular</Text>
              {editingPhone ? (
                <TextInput style={styles.inlineInput} value={tempPhone} onChangeText={(t) => setTempPhone(t.replace(/\D/g, ''))} keyboardType="phone-pad" autoFocus maxLength={9} onSubmitEditing={savePhone} />
              ) : (
                <Text style={styles.settingValue}>{profile?.phone || 'Sin número'}</Text>
              )}
            </View>
            <TouchableOpacity onPress={() => editingPhone ? savePhone() : setEditingPhone(true)} style={styles.editButton}>
              <Text style={styles.editButtonText}>{editingPhone ? 'Guardar' : 'Editar'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionHeader}>PLAN</Text>
        <View style={styles.card}>
          <View style={styles.planRow}>
            <View>
              <Text style={styles.planName}>Plan Gratuito</Text>
              <Text style={styles.planFeatures}>3 contactos · SMS · GPS básico</Text>
            </View>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>Premium</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
          <View style={styles.premiumFeatures}>
            <Text style={styles.premiumTitle}>🔒 Premium — S/. 9.90/mes</Text>
            {['Contactos ilimitados', 'Alertas por WhatsApp', 'Check-in automático', 'Historial de alertas'].map((f) => (
              <View key={f} style={styles.premiumFeatureRow}>
                <Text style={styles.premiumFeatureIcon}>✨</Text>
                <Text style={styles.premiumFeatureText}>{f}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionHeader}>ACERCA DE</Text>
        <View style={styles.card}>
          <InfoRow label="Versión" value="1.0.0 (MVP)" />
          <View style={styles.divider} />
          <InfoRow label="Mercado" value="Perú 🇵🇪" />
          <View style={styles.divider} />
          <InfoRow label="Soporte" value="soporte@salvame.app" />
        </View>

        <Text style={styles.sectionHeader}>LEGAL</Text>
        <View style={styles.card}>
          {['Política de privacidad', 'Términos de uso', 'Ley 29733 — Protección de datos'].map((item, i) => (
            <React.Fragment key={item}>
              {i > 0 && <View style={styles.divider} />}
              <TouchableOpacity style={styles.linkRow}>
                <Text style={styles.linkText}>{item}</Text>
                <Text style={styles.linkArrow}>→</Text>
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>

        <Text style={styles.sectionHeader}>ZONA DE PELIGRO</Text>
        <TouchableOpacity style={styles.dangerButton} onPress={handleResetApp}>
          <Text style={styles.dangerButtonText}>Restablecer aplicación</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing['2xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Text style={styles.settingValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing['2xl'] },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.outline },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.onBackground },
  sectionHeader: { fontSize: Typography.xs, fontWeight: Typography.semibold, color: Colors.onSurfaceDisabled, letterSpacing: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl, paddingBottom: Spacing.sm },
  card: { marginHorizontal: Spacing.lg, backgroundColor: Colors.surface, borderRadius: BorderRadius.lg, borderWidth: 1, borderColor: Colors.outline, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  settingInfo: { flex: 1, gap: 2 },
  settingLabel: { fontSize: Typography.xs, color: Colors.onSurfaceDisabled, textTransform: 'uppercase', letterSpacing: 0.5 },
  settingValue: { fontSize: Typography.base, color: Colors.onBackground, fontWeight: Typography.medium },
  inlineInput: { fontSize: Typography.base, color: Colors.onBackground, borderBottomWidth: 1, borderBottomColor: Colors.primary, paddingVertical: 2, minWidth: 150 },
  editButton: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  editButtonText: { fontSize: Typography.sm, color: Colors.primary, fontWeight: Typography.semibold },
  divider: { height: 1, backgroundColor: Colors.outline, marginHorizontal: Spacing.md },
  planRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  planName: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.onBackground },
  planFeatures: { fontSize: Typography.xs, color: Colors.onSurfaceVariant, marginTop: 2 },
  upgradeButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
  upgradeButtonText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.white },
  premiumFeatures: { padding: Spacing.md, gap: Spacing.sm },
  premiumTitle: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.onSurfaceVariant, marginBottom: Spacing.xs },
  premiumFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  premiumFeatureIcon: { fontSize: 14 },
  premiumFeatureText: { fontSize: Typography.sm, color: Colors.onSurfaceVariant },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  linkText: { fontSize: Typography.base, color: Colors.onBackground },
  linkArrow: { fontSize: Typography.base, color: Colors.onSurfaceDisabled },
  dangerButton: { marginHorizontal: Spacing.lg, backgroundColor: Colors.errorContainer, borderRadius: BorderRadius.lg, paddingVertical: Spacing.md, alignItems: 'center', borderWidth: 1, borderColor: Colors.error },
  dangerButtonText: { fontSize: Typography.base, fontWeight: Typography.semibold, color: Colors.error },
});
