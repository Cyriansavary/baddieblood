import { FlowLevel, AddressingStyle, TrackingMode } from '../../data/cycleData';

export type TabKey = 'suivi' | 'stats' | 'profil' | 'rdv';
export type OnboardingStep = 0 | 1 | 2;
export type PeriodMarkMode = 'single' | 'range';
export type CalendarFocusMode = 'all' | 'rules' | 'notes' | 'alerts';
export type InfoAccent = 'rose' | 'sand' | 'gold' | 'blue';

export type EntryFormState = {
  flow: FlowLevel;
  pain: number;
  mood: string;
  sleepHours: string;
  symptoms: string[];
  notes: string;
};

export type ProfileFormState = {
  name: string;
  trackingMode: TrackingMode;
  cycleLength: string;
  periodLength: string;
  lastPeriodStart: string;
  lastPeriodEnd: string;
  addressingStyle: AddressingStyle;
  pregnancyDueDate: string;
};

export type ResolvedDayMeta = {
  kind: 'default' | 'period' | 'predicted-period' | 'fertile';
  isToday: boolean;
  statusLabel: string;
  flowFallback: string;
  painFallback: string;
  suggestedSymptoms: string[];
};

export type CyclePhaseView = {
  key: string;
  label: string;
  shortLabel: string;
  background: string;
  foreground: string;
};

export type CalendarDayCell = {
  dayIso: string;
  dayNumber: number;
  displayMeta: ResolvedDayMeta;
  isCurrentMonth: boolean;
  matchesFocus: boolean;
  hasRecordDetails: boolean;
  isRangeAnchor: boolean;
  isRangePreview: boolean;
  isRangePreviewStart: boolean;
  isRangePreviewEnd: boolean;
  isSelected: boolean;
};
