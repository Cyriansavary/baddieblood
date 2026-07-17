import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo, useState } from 'react';

import { MedicalReminderFormState, MedicalReminderItem } from '../../../data/cycleData';
import { parseFrenchDateInput } from '../../../lib/cycle';
import {
  cancelNotification,
  cancelAllNotifications,
  scheduleAppointmentReminder,
} from '../../../lib/notifications';
import { MEDICAL_REMINDERS_STORAGE_KEY } from '../../../lib/storage';
import {
  createEmptyMedicalReminderFormState,
  getMedicalReminderDefaultTitle,
} from '../helpers';

export function useMedicalReminders() {
  const [medicalReminders, setMedicalReminders] = useState<MedicalReminderItem[]>([]);
  const [medicalReminderForm, setMedicalReminderForm] = useState<MedicalReminderFormState>(
    createEmptyMedicalReminderFormState()
  );
  const [medicalReminderMessage, setMedicalReminderMessage] = useState('');

  const sortedMedicalReminders = useMemo(
    () =>
      medicalReminders
        .map((item) => ({
          item,
          key:
            parseFrenchDateInput(item.reminderDate) ??
            parseFrenchDateInput(item.appointmentDate),
        }))
        .sort((left, right) => {
          if (left.key && right.key) return left.key.localeCompare(right.key);
          if (left.key) return -1;
          if (right.key) return 1;
          return right.item.createdAt.localeCompare(left.item.createdAt);
        })
        .map(({ item }) => item),
    [medicalReminders]
  );

  function updateMedicalReminderForm(patch: Partial<MedicalReminderFormState>) {
    setMedicalReminderForm((current) => ({ ...current, ...patch }));
  }

  async function saveMedicalReminder() {
    const title =
      medicalReminderForm.category === 'other'
        ? medicalReminderForm.customTitle.trim()
        : getMedicalReminderDefaultTitle(medicalReminderForm.category);
    const appointmentDate = parseFrenchDateInput(medicalReminderForm.appointmentDate);
    const reminderDate = parseFrenchDateInput(medicalReminderForm.reminderDate);
    const notes = medicalReminderForm.notes.trim();

    if (!title) {
      setMedicalReminderMessage("Ajoute un intitulé ou choisis une catégorie.");
      return;
    }

    if (medicalReminderForm.category === 'other' && !medicalReminderForm.customTitle.trim()) {
      setMedicalReminderMessage("Ajoute un intitulé personnalisé pour le champ Autre.");
      return;
    }

    if (medicalReminderForm.appointmentDate.trim() && !appointmentDate) {
      setMedicalReminderMessage('La date du rendez-vous doit être au format JJ/MM/AAAA.');
      return;
    }

    if (medicalReminderForm.reminderDate.trim() && !reminderDate) {
      setMedicalReminderMessage('La date de rappel doit être au format JJ/MM/AAAA.');
      return;
    }

    const notificationId = await scheduleAppointmentReminder(
      reminderDate ?? appointmentDate ?? '',
      title,
      notes || undefined
    );

    const nextReminder: MedicalReminderItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category: medicalReminderForm.category,
      title,
      appointmentDate: appointmentDate ?? '',
      reminderDate: reminderDate ?? '',
      notes,
      createdAt: new Date().toISOString(),
      completed: false,
      notificationId: notificationId ?? undefined,
    };

    try {
      const nextReminders = [...medicalReminders, nextReminder];
      setMedicalReminders(nextReminders);
      await AsyncStorage.setItem(
        MEDICAL_REMINDERS_STORAGE_KEY,
        JSON.stringify(nextReminders)
      );
      setMedicalReminderForm(createEmptyMedicalReminderFormState());
      setMedicalReminderMessage('Rendez-vous enregistré.');
    } catch {
      setMedicalReminderMessage(
        "Le rendez-vous n'a pas pu être sauvegardé. Réessaie dans quelques instants."
      );
    }
  }

  async function deleteMedicalReminder(id: string) {
    try {
      const target = medicalReminders.find((item) => item.id === id);
      await cancelNotification(target?.notificationId);
      const nextReminders = medicalReminders.filter((item) => item.id !== id);
      setMedicalReminders(nextReminders);
      await AsyncStorage.setItem(
        MEDICAL_REMINDERS_STORAGE_KEY,
        JSON.stringify(nextReminders)
      );
    } catch {
      setMedicalReminderMessage("La suppression a échoué. Réessaie dans quelques instants.");
    }
  }

  function initialize(initialReminders: MedicalReminderItem[]) {
    setMedicalReminders(initialReminders);
  }

  async function toggleMedicalReminderCompleted(id: string) {
    try {
      const nextReminders = medicalReminders.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      setMedicalReminders(nextReminders);
      await AsyncStorage.setItem(MEDICAL_REMINDERS_STORAGE_KEY, JSON.stringify(nextReminders));
    } catch {
      setMedicalReminderMessage("La mise à jour a échoué. Réessaie dans quelques instants.");
    }
  }

  function reset() {
    void cancelAllNotifications();
    setMedicalReminders([]);
    setMedicalReminderForm(createEmptyMedicalReminderFormState());
    setMedicalReminderMessage('');
  }

  return {
    medicalReminders,
    sortedMedicalReminders,
    medicalReminderForm,
    medicalReminderMessage,
    updateMedicalReminderForm,
    saveMedicalReminder,
    deleteMedicalReminder,
    toggleMedicalReminderCompleted,
    initialize,
    reset,
  };
}
