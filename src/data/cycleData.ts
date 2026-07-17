export type FlowLevel = 'Absent' | 'Léger' | 'Moyen' | 'Abondant';

export type AddressingStyle = 'masculine' | 'feminine' | 'nonBinary';
export type TrackingMode = 'cycle' | 'pregnancy';
export type MedicalReminderCategory =
  | 'gynecologist'
  | 'vaccination'
  | 'screening'
  | 'papSmear'
  | 'ultrasound'
  | 'other';

export type MedicalReminderItem = {
  id: string;
  category: MedicalReminderCategory;
  title: string;
  appointmentDate: string;
  reminderDate: string;
  notes: string;
  createdAt: string;
  completed: boolean;
  notificationId?: string;
};

export type MedicalReminderFormState = {
  category: MedicalReminderCategory;
  customTitle: string;
  appointmentDate: string;
  reminderDate: string;
  notes: string;
};

export type CycleRecord = {
  date: string;
  flow: FlowLevel;
  pain: number;
  mood: string;
  sleepHours: number;
  symptoms: string[];
  notes: string;
  source?: 'manual' | 'calendar' | 'inferred' | 'setup';
};

export type CycleProfile = {
  name: string;
  trackingMode: TrackingMode;
  cycleLength: number;
  periodLength: number;
  lastPeriodStart: string;
  addressingStyle: AddressingStyle;
  pregnancyDueDate: string;
};

export const sampleProfile: CycleProfile = {
  name: 'Nadia',
  trackingMode: 'cycle',
  cycleLength: 28,
  periodLength: 5,
  lastPeriodStart: '2026-04-05',
  addressingStyle: 'nonBinary',
  pregnancyDueDate: '',
};

export const sampleRecords: CycleRecord[] = [
  {
    date: '2026-04-05',
    flow: 'Abondant',
    pain: 7,
    mood: 'Fatiguée',
    sleepHours: 7,
    symptoms: ['Crampes', 'Ballonnements', 'Bas du dos'],
    notes: 'Debut des regles. Une bouillotte et une hydratation reguliere ont aide.',
    source: 'manual',
  },
  {
    date: '2026-04-06',
    flow: 'Abondant',
    pain: 6,
    mood: 'Sensibilité',
    sleepHours: 6,
    symptoms: ['Crampes', 'Migraine'],
    notes: 'Jour intense. Pensee utile: prevoir un rappel anti-douleur et repos.',
    source: 'manual',
  },
  {
    date: '2026-04-07',
    flow: 'Moyen',
    pain: 5,
    mood: 'Calme',
    sleepHours: 8,
    symptoms: ['Fatigue'],
    notes: 'Le flux commence a baisser, l energie remonte doucement.',
    source: 'manual',
  },
  {
    date: '2026-04-08',
    flow: 'Moyen',
    pain: 3,
    mood: 'Stable',
    sleepHours: 8,
    symptoms: ['Légères crampes'],
    notes: 'Bonne journée. Marche douce et hydratation.',
    source: 'manual',
  },
  {
    date: '2026-04-09',
    flow: 'Léger',
    pain: 2,
    mood: 'Soulagee',
    sleepHours: 8,
    symptoms: ['Aucun symptome fort'],
    notes: 'Fin de cycle menstruel presque terminee.',
    source: 'manual',
  },
  {
    date: '2026-04-16',
    flow: 'Absent',
    pain: 1,
    mood: 'Dynamique',
    sleepHours: 7.5,
    symptoms: ['Peau plus nette', 'Bonne concentration'],
    notes: 'Phase plutot energique avec charge mentale plus facile a gerer.',
    source: 'manual',
  },
  {
    date: '2026-04-19',
    flow: 'Absent',
    pain: 0,
    mood: 'Sociale',
    sleepHours: 8,
    symptoms: ['Libido plus haute'],
    notes: 'Jour favorable aux activites sportives et a la planification.',
    source: 'manual',
  },
  {
    date: '2026-04-21',
    flow: 'Absent',
    pain: 2,
    mood: 'Irritable',
    sleepHours: 6.5,
    symptoms: ['Sensibilité poitrine', 'Envies sucrées'],
    notes: 'Possibles signes de phase lutheale. Ajouter un rappel de sommeil.',
    source: 'manual',
  },
];
