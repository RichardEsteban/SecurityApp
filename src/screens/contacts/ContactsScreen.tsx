// SÁLVAME — Contacts Screen

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList,
  Alert, TextInput, Modal, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useContacts } from '../../hooks/useContacts';
import { EmergencyContact, APP_CONFIG } from '../../types';
import { displayPhone, isValidName, isValidPeruvianPhone } from '../../utils/helpers';
import { sendTestAlert } from '../../services/alertService';

export default function ContactsScreen() {
  const { contacts, isLoading, canAddMore, addNewContact, deleteContact } = useContacts(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleAdd() {
    let valid = true;
    if (!isValidName(newName)) { setNameError('Nombre inválido (mínimo 2 caracteres)'); valid = false; } else setNameError('');
    if (!isValidPeruvianPhone(newPhone)) { setPhoneError('Número peruano inválido (ej: 987 654 321)'); valid = false; } else setPhoneError('');
    if (!valid) return;

    setIsSaving(true);
    try {
      await addNewContact(newName, newPhone);
      setShowAddModal(false);
      setNewName('');
      setNewPhone('');
    } catch (error: any) {
      if (error.message === 'PREMIUM_REQUIRED') {
        Alert.alert('🔒 Plan Premium', `El plan gratuito permite hasta ${APP_CONFIG.MAX_FREE_CONTACTS} contactos.`, [{ text: 'Entendido' }]);
      }
    } finally {
      setIsSaving(false);
    }
  }

  function handleDelete(contact: EmergencyContact) {
    Alert.alert('Eliminar contacto', `¿Eliminar a ${contact.name}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteContact(contact.id) },
    ]);
  }

  async function handleSendTest(contact: EmergencyContact) {
    Alert.alert('Enviar mensaje de prueba', `Se enviará un SMS de prueba a ${contact.name}`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Enviar',
        onPress: async () => {
          const success = await sendTestAlert('Usuario', [contact]);
          Alert.alert(success ? '✅ Enviado' : '❌ Error', success ? `${contact.name} recibió el mensaje de prueba` : 'No se pudo enviar.');
        },
      },
    ]);
  }

  if (isLoading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator color={Colors.primary} style={{ flex: 1 }} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contactos de emergencia</Text>
        <Text style={styles.subtitle}>{contacts.length}/{APP_CONFIG.MAX_FREE_CONTACTS} (plan gratuito)</Text>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>Sin contactos aún</Text>
            <Text style={styles.emptySubtitle}>Agrega al menos un contacto para que SÁLVAME pueda enviar alertas</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ContactCard contact={item} onDelete={() => handleDelete(item)} onTest={() => handleSendTest(item)} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {canAddMore ? (
        <View style={styles.addButtonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)} activeOpacity={0.85}>
            <Text style={styles.addButtonText}>+ Agregar contacto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.premiumBanner}>
          <Text style={styles.premiumText}>🔒 Actualiza a Premium para agregar más contactos</Text>
          <TouchableOpacity style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>Ver Premium — S/. 9.90/mes</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAddModal(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nuevo contacto</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={[styles.input, nameError ? styles.inputError : null]}
                placeholder="Ej: Mamá, Juan García"
                placeholderTextColor={Colors.onSurfaceDisabled}
                value={newName}
                onChangeText={(t) => { setNewName(t); setNameError(''); }}
                autoCapitalize="words"
                autoFocus
              />
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Celular peruano</Text>
              <View style={[styles.phoneRow, phoneError ? styles.inputError : null]}>
                <Text style={styles.countryCode}>🇵🇪 +51</Text>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="987 654 321"
                  placeholderTextColor={Colors.onSurfaceDisabled}
                  value={newPhone}
                  onChangeText={(t) => { setNewPhone(t.replace(/\D/g, '')); setPhoneError(''); }}
                  keyboardType="phone-pad"
                  maxLength={9}
                />
              </View>
              {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
            </View>
            <TouchableOpacity style={[styles.saveButton, isSaving && styles.buttonDisabled]} onPress={handleAdd} disabled={isSaving}>
              {isSaving ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.saveButtonText}>Guardar contacto</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function ContactCard({ contact, onDelete, onTest }: { contact: EmergencyContact; onDelete: () => void; onTest: () => void }) {
  return (
    <View style={styles.contactCard}>
      <View style={[styles.avatar, { backgroundColor: contact.avatarColor || Colors.primary }]}>
        <Text style={styles.avatarText}>{contact.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{contact.name}</Text>
        <Text style={styles.contactPhone}>{displayPhone(contact.phone)}</Text>
        {contact.verified && <Text style={styles.verifiedBadge}>✅ Verificado</Text>}
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity style={styles.testButton} onPress={onTest}>
          <Text style={styles.testButtonText}>Probar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.outline },
  title: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.onBackground },
  subtitle: { fontSize: Typography.sm, color: Colors.onSurfaceVariant, marginTop: Spacing.xs },
  listContent: { padding: Spacing.lg, flexGrow: 1 },
  separator: { height: Spacing.sm },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing['3xl'], gap: Spacing.md },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.onBackground },
  emptySubtitle: { fontSize: Typography.base, color: Colors.onSurfaceVariant, textAlign: 'center', lineHeight: Typography.base * Typography.normal },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg, padding: Spacing.md, gap: Spacing.md, borderWidth: 1, borderColor: Colors.outline,
  },
  avatar: { width: 48, height: 48, borderRadius: BorderRadius.full, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.white },
  contactInfo: { flex: 1, gap: 2 },
  contactName: { fontSize: Typography.md, fontWeight: Typography.semibold, color: Colors.onBackground },
  contactPhone: { fontSize: Typography.sm, color: Colors.onSurfaceVariant },
  verifiedBadge: { fontSize: Typography.xs, color: Colors.success },
  contactActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  testButton: { backgroundColor: Colors.surfaceVariant, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  testButtonText: { fontSize: Typography.xs, color: Colors.onSurfaceVariant, fontWeight: Typography.medium },
  deleteButton: { padding: Spacing.xs },
  deleteButtonText: { fontSize: 18 },
  addButtonContainer: { padding: Spacing.lg, paddingBottom: Spacing['2xl'] },
  addButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.md, alignItems: 'center' },
  addButtonText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.white },
  premiumBanner: { margin: Spacing.lg, marginBottom: Spacing['2xl'], backgroundColor: Colors.surfaceVariant, borderRadius: BorderRadius.lg, padding: Spacing.lg, gap: Spacing.md, borderWidth: 1, borderColor: Colors.outline },
  premiumText: { fontSize: Typography.sm, color: Colors.onSurfaceVariant, textAlign: 'center' },
  premiumButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.sm, alignItems: 'center' },
  premiumButtonText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.white },
  modalContainer: { flex: 1, backgroundColor: Colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.outline },
  modalTitle: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.onBackground },
  modalClose: { fontSize: Typography.xl, color: Colors.onSurfaceVariant, padding: Spacing.xs },
  modalContent: { padding: Spacing.lg, gap: Spacing.lg },
  inputGroup: { gap: Spacing.xs },
  label: { fontSize: Typography.sm, fontWeight: Typography.semibold, color: Colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: Colors.surface, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.outline, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, fontSize: Typography.md, color: Colors.onBackground },
  inputError: { borderColor: Colors.error },
  phoneRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.outline, paddingHorizontal: Spacing.md },
  countryCode: { fontSize: Typography.md, color: Colors.onSurfaceVariant, marginRight: Spacing.sm, paddingVertical: Spacing.md },
  phoneInput: { flex: 1, fontSize: Typography.md, color: Colors.onBackground, paddingVertical: Spacing.md },
  errorText: { fontSize: Typography.xs, color: Colors.error },
  saveButton: { backgroundColor: Colors.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.md, alignItems: 'center', minHeight: 56, justifyContent: 'center', marginTop: Spacing.md },
  buttonDisabled: { opacity: 0.6 },
  saveButtonText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.white },
});
