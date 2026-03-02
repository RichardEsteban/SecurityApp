// SÁLVAME — useContacts Hook

import { useState, useEffect, useCallback } from 'react';
import { EmergencyContact, APP_CONFIG } from '../types';
import { getContacts, addContact, removeContact, updateContact } from '../services/storageService';
import { generateSessionId, getAvatarColor, formatPhoneNumber } from '../utils/helpers';

interface UseContactsReturn {
  contacts: EmergencyContact[];
  isLoading: boolean;
  canAddMore: boolean;
  isPremiumRequired: boolean;
  addNewContact: (name: string, phone: string) => Promise<EmergencyContact>;
  deleteContact: (id: string) => Promise<void>;
  verifyContact: (id: string) => Promise<void>;
  refreshContacts: () => Promise<void>;
}

export function useContacts(isPremium: boolean = false): UseContactsReturn {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const maxContacts = isPremium ? Infinity : APP_CONFIG.MAX_FREE_CONTACTS;
  const canAddMore = contacts.length < maxContacts;
  const isPremiumRequired = !isPremium && contacts.length >= APP_CONFIG.MAX_FREE_CONTACTS;

  const refreshContacts = useCallback(async () => {
    setIsLoading(true);
    try {
      const stored = await getContacts();
      setContacts(stored);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshContacts();
  }, [refreshContacts]);

  const addNewContact = useCallback(
    async (name: string, phone: string): Promise<EmergencyContact> => {
      if (!canAddMore) throw new Error('PREMIUM_REQUIRED');

      const formattedPhone = formatPhoneNumber(phone);
      const newContact: EmergencyContact = {
        id: generateSessionId(),
        name: name.trim(),
        phone: formattedPhone,
        verified: false,
        createdAt: Date.now(),
        avatarColor: getAvatarColor(name),
      };

      const updated = await addContact(newContact);
      setContacts(updated);
      return newContact;
    },
    [canAddMore]
  );

  const deleteContact = useCallback(async (id: string): Promise<void> => {
    const updated = await removeContact(id);
    setContacts(updated);
  }, []);

  const verifyContact = useCallback(async (id: string): Promise<void> => {
    const updated = await updateContact(id, { verified: true });
    setContacts(updated);
  }, []);

  return {
    contacts,
    isLoading,
    canAddMore,
    isPremiumRequired,
    addNewContact,
    deleteContact,
    verifyContact,
    refreshContacts,
  };
}
