import { Platform } from 'react-native';

import { FlowLevel } from '../../data/cycleData';

export const baseFontFamily = Platform.select({
  ios: 'Avenir Next',
  android: 'sans-serif',
  default: 'sans-serif',
});

export const trackingOptions = [
  'Flux',
  'Douleur',
  'Humeur',
  'Sommeil',
  'Énergie',
  'Pertes',
  'Libido',
  'Température',
  'Spotting',
  'Rapports',
  'Médicaments',
  'Notes',
];

export const premiumRoadmap = [
  'Rappels intelligents',
  'Sauvegarde cloud',
  'Statistiques avancées',
  'Export PDF pour gynécologue',
  'Mode fertilité',
  'Partage partenaire',
];

export const medicalReminderOptions = [
  {
    value: 'gynecologist',
    label: 'Gynécologue',
    defaultTitle: 'Rendez-vous gynécologue',
  },
  {
    value: 'vaccination',
    label: 'Rappel vaccin',
    defaultTitle: 'Rappel vaccin',
  },
  {
    value: 'screening',
    label: 'Rappel dépistage',
    defaultTitle: 'Rappel dépistage',
  },
  {
    value: 'papSmear',
    label: 'Rappel frottis',
    defaultTitle: 'Rappel frottis',
  },
  {
    value: 'ultrasound',
    label: 'Rappel échographie',
    defaultTitle: 'Rappel échographie',
  },
  {
    value: 'other',
    label: 'Autre',
    defaultTitle: '',
  },
] as const;

export const flowOptions: FlowLevel[] = ['Absent', 'Léger', 'Moyen', 'Abondant'];
export const painOptions = [0, 2, 4, 6, 8, 10];
export const moodPresets = ['Calme', 'Fatiguée', 'Stable', 'Irritable', 'Dynamique', 'Sensible'];
export const symptomCatalog = [
  'Crampes',
  'Ballonnements',
  'Migraine',
  'Fatigue',
  'Bas du dos',
  'Sensibilité poitrine',
  'Pertes',
  'Libido haute',
];

export const CALENDAR_PERIOD_NOTE = 'Jour marqué depuis le calendrier.';
export const SETUP_PERIOD_NOTE = 'Règles indiquées lors de la configuration.';
