import {
  AddressingStyle,
  CycleProfile,
  CycleRecord,
  MedicalReminderCategory,
  MedicalReminderFormState,
  MedicalReminderItem,
  TrackingMode,
} from '../../data/cycleData';
import { differenceInDays, formatDateInputFr, getDatesInRange } from '../../lib/cycle';
import {
  CALENDAR_PERIOD_NOTE,
  medicalReminderOptions,
  SETUP_PERIOD_NOTE,
} from './constants';
import {
  EntryFormState,
  OnboardingStep,
  ProfileFormState,
  ResolvedDayMeta,
} from './types';

export function createEntryFormState(record?: CycleRecord): EntryFormState {
  return {
    flow: record?.flow ?? 'Absent',
    pain: record?.pain ?? 0,
    mood: record?.mood ?? '',
    sleepHours: record ? `${record.sleepHours}` : '',
    symptoms: record?.symptoms ?? [],
    notes: record?.notes ?? '',
  };
}

export function createProfileFormState(profile: CycleProfile): ProfileFormState {
  return {
    name: profile.name,
    trackingMode: profile.trackingMode ?? 'cycle',
    cycleLength: `${profile.cycleLength}`,
    periodLength: `${profile.periodLength}`,
    lastPeriodStart: profile.lastPeriodStart ? formatDateInputFr(profile.lastPeriodStart) : '',
    lastPeriodEnd: '',
    addressingStyle: profile.addressingStyle ?? 'nonBinary',
    pregnancyDueDate: profile.pregnancyDueDate ? formatDateInputFr(profile.pregnancyDueDate) : '',
  };
}

export function createEmptyProfileFormState(): ProfileFormState {
  return {
    name: '',
    trackingMode: 'cycle',
    cycleLength: '',
    periodLength: '',
    lastPeriodStart: '',
    lastPeriodEnd: '',
    addressingStyle: 'nonBinary',
    pregnancyDueDate: '',
  };
}

export function createEmptyMedicalReminderFormState(): MedicalReminderFormState {
  return {
    category: 'gynecologist',
    customTitle: '',
    appointmentDate: '',
    reminderDate: '',
    notes: '',
  };
}

export function getPeriodLengthFromRange(startDate: string, endDate: string) {
  return differenceInDays(endDate, startDate) + 1;
}

export function isEntryMeaningful(form: EntryFormState) {
  return Boolean(
    form.flow !== 'Absent' ||
      form.pain > 0 ||
      form.mood.trim() ||
      form.sleepHours.trim() ||
      form.symptoms.length ||
      form.notes.trim()
  );
}

export function sortRecords(records: CycleRecord[]) {
  return [...records].sort((left, right) => left.date.localeCompare(right.date));
}

export function parseStoredProfile(rawValue: string | null) {
  if (!rawValue) {
    return null;
  }

  const parsed = JSON.parse(rawValue) as Partial<CycleProfile>;
  if (
    typeof parsed.name === 'string' &&
    typeof parsed.cycleLength === 'number' &&
    typeof parsed.periodLength === 'number' &&
    typeof parsed.lastPeriodStart === 'string'
  ) {
    return {
      ...parsed,
      trackingMode: parsed.trackingMode === 'pregnancy' ? 'pregnancy' : 'cycle',
      addressingStyle:
        parsed.addressingStyle === 'masculine' ||
        parsed.addressingStyle === 'feminine' ||
        parsed.addressingStyle === 'nonBinary'
          ? parsed.addressingStyle
          : 'nonBinary',
      pregnancyDueDate: typeof parsed.pregnancyDueDate === 'string' ? parsed.pregnancyDueDate : '',
    } as CycleProfile;
  }

  return null;
}

export function getMedicalReminderCategoryLabel(category: MedicalReminderCategory) {
  return medicalReminderOptions.find((option) => option.value === category)?.label ?? 'Autre';
}

export function getMedicalReminderDefaultTitle(category: MedicalReminderCategory) {
  return medicalReminderOptions.find((option) => option.value === category)?.defaultTitle ?? '';
}

export function parseStoredMedicalReminders(rawValue: string | null) {
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<MedicalReminderItem>[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item) =>
          item &&
          typeof item.id === 'string' &&
          typeof item.title === 'string' &&
          typeof item.appointmentDate === 'string' &&
          typeof item.reminderDate === 'string' &&
          typeof item.notes === 'string' &&
          typeof item.createdAt === 'string'
      )
      .map((item) => ({
        id: item.id,
        category:
          item.category === 'gynecologist' ||
          item.category === 'vaccination' ||
          item.category === 'screening' ||
          item.category === 'papSmear' ||
          item.category === 'ultrasound' ||
          item.category === 'other'
            ? item.category
            : 'other',
        title: item.title,
        appointmentDate: item.appointmentDate,
        reminderDate: item.reminderDate,
        notes: item.notes,
        createdAt: item.createdAt,
        completed: Boolean(item.completed),
      })) as MedicalReminderItem[];
  } catch {
    return [];
  }
}

export function buildUnconfiguredDayMeta(
  date: string,
  todayIso: string,
  record?: CycleRecord
): ResolvedDayMeta {
  return {
    kind: record && record.flow !== 'Absent' ? 'period' : 'default',
    isToday: date === todayIso,
    statusLabel: record && record.flow !== 'Absent' ? 'Règles enregistrées' : 'Profil non configuré',
    flowFallback: 'À configurer',
    painFallback: 'À configurer',
    suggestedSymptoms: ['Complète ton profil', 'Ajoute une entrée', 'Visualise ensuite tes tendances'],
  };
}

export function getOnboardingProgress(step: OnboardingStep) {
  return ((step + 1) / 3) * 100;
}

export function getAddressingStyleLabel(style: AddressingStyle) {
  if (style === 'masculine') {
    return 'Masculin';
  }

  if (style === 'feminine') {
    return 'Féminin';
  }

  return 'Non-binaire';
}

export function getGenderedAdjective(style: AddressingStyle, root: 'pret' | 'configur', withNeutral = true) {
  if (style === 'masculine') {
    return root === 'pret' ? 'Prêt' : 'configuré';
  }

  if (style === 'feminine') {
    return root === 'pret' ? 'Prête' : 'configurée';
  }

  return root === 'pret' ? (withNeutral ? 'Prêt·e' : 'Prêt' ) : 'configuré·e';
}

export function getStartCtaLabel(style: AddressingStyle) {
  if (style === 'masculine') {
    return 'Prêt à entrer dans l\'app';
  }

  if (style === 'feminine') {
    return 'Prête à entrer dans l\'app';
  }

  return 'Prêt·e à entrer dans l\'app';
}

export function getTrackingModeLabel(mode: TrackingMode) {
  return mode === 'pregnancy' ? 'Grossesse' : 'Cycle';
}

export function hasCustomEntryContent(record?: CycleRecord) {
  if (!record) {
    return false;
  }

  if (record.source === 'manual') {
    return true;
  }

  const hasMood = record.mood.trim() && record.mood !== 'Non renseignée' && record.mood !== 'À suivre';
  const hasSleep = record.sleepHours > 0;
  const hasSymptoms = record.symptoms.length > 0;
  const hasNotes =
    record.notes.trim() &&
    record.notes !== 'Aucune note' &&
    record.notes !== CALENDAR_PERIOD_NOTE &&
    record.notes !== SETUP_PERIOD_NOTE;

  return Boolean(hasMood || hasSleep || hasSymptoms || hasNotes);
}

export function sanitizeAutoGeneratedRecord(record: CycleRecord): CycleRecord {
  if (record.source === 'manual') {
    return record;
  }

  return {
    ...record,
    pain: 0,
    mood: '',
    sleepHours: 0,
    symptoms: [],
    notes: '',
  };
}

export function createCalendarPeriodRecord(date: string, existingRecord?: CycleRecord): CycleRecord {
  const safeExistingRecord = existingRecord ? sanitizeAutoGeneratedRecord(existingRecord) : undefined;

  return {
    date,
    flow:
      safeExistingRecord?.flow && safeExistingRecord.flow !== 'Absent'
        ? safeExistingRecord.flow
        : 'Moyen',
    pain: safeExistingRecord?.pain ?? 0,
    mood: safeExistingRecord?.mood ?? '',
    sleepHours: safeExistingRecord?.sleepHours ?? 0,
    symptoms: safeExistingRecord?.symptoms ?? [],
    notes: safeExistingRecord?.notes ?? '',
    source: safeExistingRecord?.source === 'manual' ? 'manual' : 'calendar',
  };
}

export function createConfiguredPeriodRecord(
  date: string,
  offset: number,
  existingRecord?: CycleRecord
): CycleRecord {
  const baseRecord = createCalendarPeriodRecord(date, existingRecord);

  return {
    ...baseRecord,
    flow:
      existingRecord?.flow && existingRecord.flow !== 'Absent'
        ? existingRecord.flow
        : offset < 2
          ? 'Abondant'
          : offset < 4
            ? 'Moyen'
            : 'Léger',
    source: existingRecord?.source === 'manual' ? 'manual' : 'setup',
  };
}

export function mergeConfiguredPeriodRecords(
  currentRecords: CycleRecord[],
  startDate: string,
  endDate?: string
) {
  const periodDates = getDatesInRange(startDate, endDate ?? startDate);
  const periodDateSet = new Set(periodDates);
  const recordMap = new Map(currentRecords.map((record) => [record.date, record]));
  const remainingRecords = currentRecords.filter((record) => !periodDateSet.has(record.date));
  const configuredRecords = periodDates.map((date, index) =>
    createConfiguredPeriodRecord(date, index, recordMap.get(date))
  );

  return [...remainingRecords, ...configuredRecords];
}
