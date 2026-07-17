import { createContext, useContext } from 'react';

import { CycleProfile, CycleRecord, MedicalReminderFormState, MedicalReminderItem, TrackingMode } from '../../../data/cycleData';
import { ThemeScheme } from '../../../styles/ThemeContext';
import {
  DominantSymptomItem,
  FlowAnomalyItem,
  FlowDistributionItem,
  MonthComparisonStats,
  MonthlyHistoryItem,
  PainTrendPoint,
} from '../../../lib/insights';
import { PregnancyStage } from '../pregnancy';
import {
  CalendarDayCell,
  CalendarFocusMode,
  CyclePhaseView,
  PeriodMarkMode,
  ProfileFormState,
  ResolvedDayMeta,
} from '../types';

export type AppData = {
  // Cycle / hero
  hasCycleReference: boolean;
  subtitle: string;
  todayCycleDay: number;
  todayCyclePhase: CyclePhaseView;
  nextPeriodValue: string;
  nextPeriodHint: string;
  fertileValue: string;
  fertileHint: string;
  isProfileConfigured: boolean;
  isPregnancyMode: boolean;
  pregnancyStage: PregnancyStage;
  pregnancyDueDateLabel: string;
  pregnancyWeeksRemainingLabel: string;
  nextPeriodStart: string;
  fertileWindow: { start: string; end: string };
  estimatedProfile: CycleProfile;
  displayedPeriodLength: number;
  avgPain: string;
  cyclePhase: CyclePhaseView;
  cycleDay: number;
  // Calendar
  monthLabel: string;
  isPeriodSelectionMode: boolean;
  periodMarkMode: PeriodMarkMode;
  calendarFocusMode: CalendarFocusMode;
  periodRangeAnchor: string | null;
  periodRangePreviewEnd: string | null;
  calendarWeeks: CalendarDayCell[][];
  selectedDate: string;
  selectedMeta: ResolvedDayMeta;
  selectedRecord?: CycleRecord;
  // Stats
  trackedDays: number;
  periodDays: number;
  avgSleep: string;
  dominantSymptoms: DominantSymptomItem[];
  flowDistribution: FlowDistributionItem[];
  flowAnomalies: FlowAnomalyItem[];
  monthComparison: MonthComparisonStats | null;
  painTrend: PainTrendPoint[];
  monthlyHistory: MonthlyHistoryItem[];
  recentRecords: CycleRecord[];
  // Profile form
  profileForm: ProfileFormState;
  profileMessage: string;
  trackingSetupMessage: string;
  shouldShowTrackingSetup: boolean;
  // Medical reminders
  medicalReminderForm: MedicalReminderFormState;
  medicalReminders: MedicalReminderItem[];
  medicalReminderMessage: string;
  // Handlers — calendar
  shiftMonth: (offset: number) => void;
  onToggleSelectionMode: () => void;
  onSelectPeriodMarkMode: (mode: PeriodMarkMode) => void;
  onSelectCalendarFocusMode: (mode: CalendarFocusMode) => void;
  onCalendarDayPress: (dayIso: string) => void;
  onConfirmRangePreview: () => void;
  onClearRangePreview: () => void;
  onSelectDay: (dayIso: string) => void;
  getRelativeEnergyLabel: (phaseKey: string) => string;
  // Handlers — tracking setup
  onLastPeriodStartChange: (value: string) => void;
  onLastPeriodEndChange: (value: string) => void;
  onContinueToTracking: () => void;
  // Handlers — profile
  onProfileFieldChange: (patch: Partial<ProfileFormState>) => void;
  onSwitchTrackingMode: (mode: TrackingMode) => void;
  onFormatDateFieldChange: (field: 'lastPeriodStart' | 'lastPeriodEnd', value: string) => void;
  onSaveProfile: () => void;
  onReset: () => void;
  formatDateTyping: (value: string) => string;
  // Prediction
  nextPeriodInDays: number;
  // Handlers — medical reminders
  onMedicalReminderFieldChange: (patch: Partial<MedicalReminderFormState>) => void;
  onSaveMedicalReminder: () => void;
  onDeleteMedicalReminder: (id: string) => void;
  onToggleMedicalReminderCompleted: (id: string) => void;
  // Data export
  onExportData: () => Promise<void>;
  // Theme
  themeScheme: ThemeScheme;
  onToggleTheme: () => void;
};

const AppDataContext = createContext<AppData | null>(null);

export function useAppData(): AppData {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}

export default AppDataContext;
