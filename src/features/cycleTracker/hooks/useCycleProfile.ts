import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

import { CycleProfile, CycleRecord } from '../../../data/cycleData';
import {
  addDays,
  differenceInDays,
  getDaysUntilNextPeriod,
  getUpcomingPeriodStart,
  parseFrenchDateInput,
} from '../../../lib/cycle';
import { cancelNotification, schedulePeriodReminder } from '../../../lib/notifications';
import {
  CYCLE_PROFILE_STORAGE_KEY,
  LAST_PERIOD_REFERENCE_CONFIRMED_STORAGE_KEY,
} from '../../../lib/storage';
import {
  createEmptyProfileFormState,
  createProfileFormState,
  getPeriodLengthFromRange,
  mergeConfiguredPeriodRecords,
} from '../helpers';
import { OnboardingStep, ProfileFormState } from '../types';

export function useCycleProfile() {
  const [profile, setProfile] = useState<CycleProfile | null>(null);
  const [periodNotificationId, setPeriodNotificationId] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(createEmptyProfileFormState());
  const [profileMessage, setProfileMessage] = useState('');
  const [hasConfirmedLastPeriodReference, setHasConfirmedLastPeriodReference] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>(0);
  const [trackingSetupMessage, setTrackingSetupMessage] = useState('');

  function updateProfileForm(patch: Partial<ProfileFormState>) {
    setProfileForm((current) => ({ ...current, ...patch }));

    if (patch.trackingMode && profile && patch.trackingMode !== profile.trackingMode) {
      const nextTrackingMode = patch.trackingMode;
      const nextProfile: CycleProfile = { ...profile, trackingMode: nextTrackingMode };

      void (async () => {
        try {
          setProfile(nextProfile);
          await AsyncStorage.setItem(CYCLE_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
          await AsyncStorage.setItem(
            LAST_PERIOD_REFERENCE_CONFIRMED_STORAGE_KEY,
            nextTrackingMode === 'cycle' && Boolean(nextProfile.lastPeriodStart) ? 'true' : 'false'
          );
          setHasConfirmedLastPeriodReference(
            nextTrackingMode === 'cycle' && Boolean(nextProfile.lastPeriodStart)
          );
          setProfileMessage('');
        } catch {
          setProfileMessage(
            "Le changement de mode n'a pas pu être sauvegardé. Réessaie dans quelques instants."
          );
        }
      })();
    }
  }

  function goToNextOnboardingStep(todayIso: string) {
    if (onboardingStep === 1) {
      const normalizedLastPeriodStart = parseFrenchDateInput(profileForm.lastPeriodStart);
      const normalizedLastPeriodEnd = parseFrenchDateInput(profileForm.lastPeriodEnd);

      if (!profileForm.name.trim()) {
        setProfileMessage('Ajoute au moins ton prénom pour continuer.');
        return;
      }

      if (profileForm.lastPeriodStart.trim() && !normalizedLastPeriodStart) {
        setProfileMessage('Ajoute une date valide au format JJ/MM/AAAA ou laisse ce champ vide.');
        return;
      }

      if (profileForm.lastPeriodEnd.trim() && !normalizedLastPeriodEnd) {
        setProfileMessage(
          'Ajoute une date de fin valide au format JJ/MM/AAAA ou laisse ce champ vide.'
        );
        return;
      }

      if (normalizedLastPeriodEnd && !normalizedLastPeriodStart) {
        setProfileMessage("Ajoute d'abord la date de début des dernières règles.");
        return;
      }

      if (
        normalizedLastPeriodStart &&
        normalizedLastPeriodEnd &&
        differenceInDays(normalizedLastPeriodEnd, normalizedLastPeriodStart) < 0
      ) {
        setProfileMessage('La date de fin doit être le même jour ou après la date de début.');
        return;
      }
    }

    setProfileMessage('');
    setOnboardingStep((current) => (current < 2 ? ((current + 1) as OnboardingStep) : current));
  }

  function goToPreviousOnboardingStep() {
    setProfileMessage('');
    setOnboardingStep((current) => (current > 0 ? ((current - 1) as OnboardingStep) : current));
  }

  async function saveProfile(
    todayIso: string,
    records: CycleRecord[],
    persistRecords: (records: CycleRecord[]) => Promise<void>
  ) {
    const trackingMode = profileForm.trackingMode === 'pregnancy' ? 'pregnancy' : 'cycle';
    const cycleLength = Number.parseInt(profileForm.cycleLength, 10);
    const periodLength = Number.parseInt(profileForm.periodLength, 10);
    const normalizedLastPeriodStart = parseFrenchDateInput(profileForm.lastPeriodStart);
    const normalizedLastPeriodEnd = parseFrenchDateInput(profileForm.lastPeriodEnd);
    const normalizedPregnancyDueDate = parseFrenchDateInput(profileForm.pregnancyDueDate);

    if (!profileForm.name.trim()) {
      setProfileMessage('Renseigne ton prénom pour continuer.');
      return;
    }

    if (trackingMode === 'pregnancy') {
      if (!normalizedPregnancyDueDate) {
        setProfileMessage(
          "Ajoute une date prévue d'accouchement valide au format JJ/MM/AAAA."
        );
        return;
      }
    } else {
      if (
        !Number.isFinite(cycleLength) ||
        !Number.isFinite(periodLength) ||
        cycleLength < 15 ||
        cycleLength > 45 ||
        periodLength < 0
      ) {
        setProfileMessage(
          'Renseigne un cycle entre 15 et 45 jours et une durée moyenne du saignement égale ou supérieure à 0.'
        );
        return;
      }

      if (profileForm.lastPeriodStart.trim() && !normalizedLastPeriodStart) {
        setProfileMessage('Ajoute une date valide au format JJ/MM/AAAA ou laisse ce champ vide.');
        return;
      }

      if (profileForm.lastPeriodEnd.trim() && !normalizedLastPeriodEnd) {
        setProfileMessage(
          'Ajoute une date de fin valide au format JJ/MM/AAAA ou laisse ce champ vide.'
        );
        return;
      }

      if (normalizedLastPeriodEnd && !normalizedLastPeriodStart) {
        setProfileMessage("Ajoute d'abord la date de début des dernières règles.");
        return;
      }

      if (
        normalizedLastPeriodStart &&
        normalizedLastPeriodEnd &&
        differenceInDays(normalizedLastPeriodEnd, normalizedLastPeriodStart) < 0
      ) {
        setProfileMessage('La date de fin doit être le même jour ou après la date de début.');
        return;
      }
    }

    const resolvedPeriodLength =
      trackingMode === 'pregnancy'
        ? Math.max(0, Number.isFinite(periodLength) ? periodLength : 5)
        : normalizedLastPeriodStart && normalizedLastPeriodEnd
          ? getPeriodLengthFromRange(normalizedLastPeriodStart, normalizedLastPeriodEnd)
          : periodLength;

    const resolvedCycleLength =
      trackingMode === 'pregnancy'
        ? Math.max(15, Number.isFinite(cycleLength) ? cycleLength : 28)
        : cycleLength;

    const nextProfile: CycleProfile = {
      name: profileForm.name.trim(),
      trackingMode,
      cycleLength: resolvedCycleLength,
      periodLength: resolvedPeriodLength,
      lastPeriodStart:
        trackingMode === 'cycle'
          ? normalizedLastPeriodStart ?? ''
          : addDays(normalizedPregnancyDueDate ?? todayIso, -280),
      addressingStyle: profileForm.addressingStyle,
      pregnancyDueDate:
        trackingMode === 'pregnancy' ? normalizedPregnancyDueDate ?? '' : '',
    };

    const nextRecords =
      trackingMode === 'cycle' && normalizedLastPeriodStart
        ? mergeConfiguredPeriodRecords(
            records,
            normalizedLastPeriodStart,
            normalizedLastPeriodEnd ?? normalizedLastPeriodStart
          )
        : records;

    try {
      setProfile(nextProfile);
      setProfileForm(createProfileFormState(nextProfile));
      await AsyncStorage.setItem(CYCLE_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
      await AsyncStorage.setItem(
        LAST_PERIOD_REFERENCE_CONFIRMED_STORAGE_KEY,
        trackingMode === 'cycle' && normalizedLastPeriodStart ? 'true' : 'false'
      );
      setHasConfirmedLastPeriodReference(
        trackingMode === 'cycle' && Boolean(normalizedLastPeriodStart)
      );
      if (nextRecords !== records) {
        await persistRecords(nextRecords);
      }

      if (trackingMode === 'cycle' && nextProfile.lastPeriodStart) {
        const todayForNotif = todayIso;
        const nextPeriod = getUpcomingPeriodStart(
          todayForNotif,
          nextProfile.lastPeriodStart,
          nextProfile.cycleLength
        );
        const daysUntil = getDaysUntilNextPeriod(
          todayForNotif,
          nextProfile.lastPeriodStart,
          nextProfile.cycleLength
        );
        if (daysUntil > 2) {
          await cancelNotification(periodNotificationId);
          const newId = await schedulePeriodReminder(nextPeriod);
          setPeriodNotificationId(newId);
        }
      }

      setProfileMessage('Profil enregistré.');
      setOnboardingStep(0);
    } catch {
      setProfileMessage("Le profil n'a pas pu être sauvegardé. Réessaie dans quelques instants.");
    }
  }

  async function saveLastPeriodReference(
    records: CycleRecord[],
    persistRecords: (records: CycleRecord[]) => Promise<void>
  ) {
    const normalizedLastPeriodStart = parseFrenchDateInput(profileForm.lastPeriodStart);
    const normalizedLastPeriodEnd = parseFrenchDateInput(profileForm.lastPeriodEnd);

    if (!normalizedLastPeriodStart) {
      setTrackingSetupMessage('Ajoute une date de début valide au format JJ/MM/AAAA.');
      return;
    }

    if (profileForm.lastPeriodEnd.trim() && !normalizedLastPeriodEnd) {
      setTrackingSetupMessage(
        'Ajoute une date de fin valide au format JJ/MM/AAAA ou laisse ce champ vide.'
      );
      return;
    }

    if (
      normalizedLastPeriodEnd &&
      differenceInDays(normalizedLastPeriodEnd, normalizedLastPeriodStart) < 0
    ) {
      setTrackingSetupMessage('La date de fin doit être le même jour ou après la date de début.');
      return;
    }

    const resolvedPeriodLength = normalizedLastPeriodEnd
      ? getPeriodLengthFromRange(normalizedLastPeriodStart, normalizedLastPeriodEnd)
      : Number.parseInt(profileForm.periodLength, 10) || profile?.periodLength || 0;

    if (resolvedPeriodLength < 0) {
      setTrackingSetupMessage('La durée des règles ne peut pas être négative.');
      return;
    }

    const nextProfile: CycleProfile = {
      name: profile?.name || profileForm.name.trim() || 'Toi',
      trackingMode: profile?.trackingMode || profileForm.trackingMode || 'cycle',
      cycleLength: profile?.cycleLength || Number.parseInt(profileForm.cycleLength, 10) || 28,
      periodLength: resolvedPeriodLength,
      lastPeriodStart: normalizedLastPeriodStart,
      addressingStyle: profileForm.addressingStyle || profile?.addressingStyle || 'nonBinary',
      pregnancyDueDate: profile?.pregnancyDueDate || profileForm.pregnancyDueDate || '',
    };

    const nextRecords = mergeConfiguredPeriodRecords(
      records,
      normalizedLastPeriodStart,
      normalizedLastPeriodEnd ?? normalizedLastPeriodStart
    );

    try {
      setProfile(nextProfile);
      setProfileForm(createProfileFormState(nextProfile));
      await AsyncStorage.setItem(CYCLE_PROFILE_STORAGE_KEY, JSON.stringify(nextProfile));
      await AsyncStorage.setItem(LAST_PERIOD_REFERENCE_CONFIRMED_STORAGE_KEY, 'true');
      setHasConfirmedLastPeriodReference(true);
      await persistRecords(nextRecords);
      setTrackingSetupMessage('');
    } catch {
      setTrackingSetupMessage("La sauvegarde a échoué. Réessaie dans quelques instants.");
    }
  }

  function initialize(
    initialProfile: CycleProfile | null,
    initialHasConfirmed: boolean
  ) {
    if (initialProfile) {
      setProfile(initialProfile);
      setProfileForm(createProfileFormState(initialProfile));
    }
    setHasConfirmedLastPeriodReference(initialHasConfirmed);
  }

  function reset() {
    void cancelNotification(periodNotificationId);
    setPeriodNotificationId(null);
    setProfile(null);
    setProfileForm(createEmptyProfileFormState());
    setProfileMessage('');
    setHasConfirmedLastPeriodReference(false);
    setOnboardingStep(0);
    setTrackingSetupMessage('');
  }

  return {
    profile,
    profileForm,
    profileMessage,
    setProfileMessage,
    hasConfirmedLastPeriodReference,
    setHasConfirmedLastPeriodReference,
    onboardingStep,
    trackingSetupMessage,
    updateProfileForm,
    goToNextOnboardingStep,
    goToPreviousOnboardingStep,
    saveProfile,
    saveLastPeriodReference,
    initialize,
    reset,
  };
}
