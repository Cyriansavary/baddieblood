import { differenceInDays, formatDateLongWithYear, parseFrenchDateInput } from '../../lib/cycle';

export type PregnancyStage = {
  week: number;
  trimester: 1 | 2 | 3;
  title: string;
  fruitEmoji: string;
  fruitLabel: string;
  sizeLabel: string;
  detail: string;
};

const pregnancyStages: Array<{
  minWeek: number;
  maxWeek: number;
  title: string;
  fruitEmoji: string;
  fruitLabel: string;
  sizeLabel: string;
  detail: string;
}> = [
  {
    minWeek: 1,
    maxWeek: 4,
    title: 'Tout début',
    fruitEmoji: '🌱',
    fruitLabel: 'Grain de sésame',
    sizeLabel: 'quelques millimètres',
    detail: 'Le développement commence, c’est encore le tout premier stade.',
  },
  {
    minWeek: 5,
    maxWeek: 7,
    title: 'Embryon très précoce',
    fruitEmoji: '🫐',
    fruitLabel: 'Myrtille',
    sizeLabel: 'environ 5 à 12 mm',
    detail: 'Les structures principales commencent à se mettre en place.',
  },
  {
    minWeek: 8,
    maxWeek: 10,
    title: 'Début du 1er trimestre',
    fruitEmoji: '🍓',
    fruitLabel: 'Fraise',
    sizeLabel: 'environ 2 à 3 cm',
    detail: 'Les traits du visage et les membres se dessinent progressivement.',
  },
  {
    minWeek: 11,
    maxWeek: 13,
    title: 'Fin du 1er trimestre',
    fruitEmoji: '🍋',
    fruitLabel: 'Citron',
    sizeLabel: 'environ 5 à 7 cm',
    detail: 'La croissance s’accélère et les repères deviennent plus stables.',
  },
  {
    minWeek: 14,
    maxWeek: 17,
    title: '2e trimestre',
    fruitEmoji: '🥑',
    fruitLabel: 'Avocat',
    sizeLabel: 'environ 10 à 15 cm',
    detail: 'La majorité des organes se développent et les mouvements s’affirment.',
  },
  {
    minWeek: 18,
    maxWeek: 21,
    title: 'Mouvements plus nets',
    fruitEmoji: '🍌',
    fruitLabel: 'Banane',
    sizeLabel: 'environ 16 à 27 cm',
    detail: 'Les mouvements deviennent généralement plus perceptibles.',
  },
  {
    minWeek: 22,
    maxWeek: 26,
    title: 'Croissance rapide',
    fruitEmoji: '🥭',
    fruitLabel: 'Mangue',
    sizeLabel: 'environ 27 à 35 cm',
    detail: 'La croissance est soutenue et les repères visuels changent vite.',
  },
  {
    minWeek: 27,
    maxWeek: 31,
    title: '3e trimestre',
    fruitEmoji: '🍍',
    fruitLabel: 'Ananas',
    sizeLabel: 'environ 35 à 42 cm',
    detail: 'Le corps se prépare progressivement à la suite du suivi.',
  },
  {
    minWeek: 32,
    maxWeek: 36,
    title: 'Dernière ligne droite',
    fruitEmoji: '🍈',
    fruitLabel: 'Melon',
    sizeLabel: 'environ 42 à 47 cm',
    detail: 'Le suivi devient plus rapproché et la croissance continue.',
  },
  {
    minWeek: 37,
    maxWeek: 40,
    title: 'Terme proche',
    fruitEmoji: '🍉',
    fruitLabel: 'Pastèque',
    sizeLabel: 'environ 48 à 52 cm',
    detail: 'Le terme approche et le suivi reste centré sur les dernières semaines.',
  },
];

export function getPregnancyWeekFromDueDate(dueDateIso: string, todayIso: string) {
  const dueDate = parseFrenchDateInput(dueDateIso) ?? dueDateIso;
  const daysUntilDue = differenceInDays(dueDate, todayIso);
  const estimatedGestationalDays = 280 - daysUntilDue;
  const week = Math.max(1, Math.min(40, Math.floor(estimatedGestationalDays / 7) + 1));

  return week;
}

export function getPregnancyTrimester(week: number): 1 | 2 | 3 {
  if (week <= 13) {
    return 1;
  }

  if (week <= 26) {
    return 2;
  }

  return 3;
}

export function getPregnancyStage(week: number): PregnancyStage {
  const stage =
    pregnancyStages.find((item) => week >= item.minWeek && week <= item.maxWeek) ??
    pregnancyStages[pregnancyStages.length - 1];

  return {
    week,
    trimester: getPregnancyTrimester(week),
    title: stage.title,
    fruitEmoji: stage.fruitEmoji,
    fruitLabel: stage.fruitLabel,
    sizeLabel: stage.sizeLabel,
    detail: stage.detail,
  };
}

export function getPregnancyDueDateLabel(dueDateIso: string) {
  return dueDateIso ? formatDateLongWithYear(dueDateIso) : 'À renseigner';
}

export function getPregnancyWeeksRemainingLabel(dueDateIso: string, todayIso: string) {
  if (!dueDateIso) {
    return 'À renseigner';
  }

  const daysUntilDue = differenceInDays(dueDateIso, todayIso);

  if (daysUntilDue <= 0) {
    return 'Terme proche';
  }

  const weeks = Math.max(1, Math.ceil(daysUntilDue / 7));

  return `${weeks} semaine${weeks > 1 ? 's' : ''}`;
}
