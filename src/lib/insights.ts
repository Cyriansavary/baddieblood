import { CycleProfile, CycleRecord } from '../data/cycleData';

export type MonthlyHistoryItem = {
  key: string;
  label: string;
  trackedDays: number;
  periodDays: number;
  averagePain: string;
  averageSleep: string;
};

export type PainTrendPoint = {
  date: string;
  label: string;
  pain: number;
  flowLevel: CycleRecord['flow'];
  flowScore: number;
};

export type FlowDistributionItem = {
  label: CycleRecord['flow'];
  count: number;
  color: string;
};

export type FlowAnomalyLevel = 'info' | 'watch' | 'alert';

export type FlowAnomalyItem = {
  key: string;
  title: string;
  detail: string;
  level: FlowAnomalyLevel;
  date?: string;
};

export type DominantSymptomItem = {
  symptom: string;
  count: number;
  share: number;
};

export type MonthComparisonStats = {
  current: MonthlyHistoryItem;
  previous: MonthlyHistoryItem;
  deltas: {
    trackedDays: number;
    periodDays: number;
    averagePain: number;
    averageSleep: number;
  };
};

const flowScoreMap: Record<CycleRecord['flow'], number> = {
  Absent: 0,
  Léger: 1,
  Moyen: 2,
  Abondant: 3,
};

const flowColorMap: Record<CycleRecord['flow'], string> = {
  Absent: '#f3dce8',
  Léger: '#ffbdd6',
  Moyen: '#ff85b7',
  Abondant: '#d94c95',
};

function sortRecords(records: CycleRecord[]) {
  return [...records].sort((left, right) => left.date.localeCompare(right.date));
}

function averageFlowScore(records: CycleRecord[]) {
  if (!records.length) {
    return 0;
  }

  const total = records.reduce((sum, record) => sum + flowScoreMap[record.flow], 0);
  return total / records.length;
}

function averagePainValue(records: CycleRecord[]) {
  if (!records.length) {
    return 0;
  }

  const total = records.reduce((sum, record) => sum + record.pain, 0);
  return total / records.length;
}

function averageSleepValue(records: CycleRecord[]) {
  if (!records.length) {
    return 0;
  }

  return records.reduce((sum, record) => sum + record.sleepHours, 0) / records.length;
}

function longestPeriodRun(records: CycleRecord[]) {
  let longest = 0;
  let current = 0;

  for (const record of sortRecords(records)) {
    if (record.flow === 'Absent') {
      current = 0;
      continue;
    }

    current += 1;
    longest = Math.max(longest, current);
  }

  return longest;
}

function formatCompactDate(dateIso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${dateIso}T12:00:00`));
}

function formatMonthLabelFromKey(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, 1, 12));
}

function toMonthlyItem(key: string, monthRecords: CycleRecord[]): MonthlyHistoryItem {
  return {
    key,
    label: formatMonthLabelFromKey(key),
    trackedDays: monthRecords.length,
    periodDays: monthRecords.filter((record) => record.flow !== 'Absent').length,
    averagePain: averagePainValue(monthRecords).toFixed(1),
    averageSleep: averageSleepValue(monthRecords).toFixed(1),
  };
}

export function averageSleep(records: CycleRecord[]) {
  if (!records.length) {
    return '0.0';
  }

  const total = records.reduce((sum, record) => sum + record.sleepHours, 0);
  return (Math.round((total / records.length) * 10) / 10).toFixed(1);
}

export function countPeriodEntries(records: CycleRecord[]) {
  return records.filter((record) => record.flow !== 'Absent').length;
}

export function getDominantSymptoms(records: CycleRecord[], limit = 3): DominantSymptomItem[] {
  const symptomMap = new Map<string, number>();

  records.forEach((record) => {
    record.symptoms.forEach((symptom) => {
      symptomMap.set(symptom, (symptomMap.get(symptom) ?? 0) + 1);
    });
  });

  const totalSymptoms = [...symptomMap.values()].reduce((sum, count) => sum + count, 0) || 1;

  return [...symptomMap.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([symptom, count]) => ({
      symptom,
      count,
      share: Math.round((count / totalSymptoms) * 100),
    }));
}

export function getRecentRecords(records: CycleRecord[], limit = 5) {
  return [...records]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, limit);
}

export function getFlowDistribution(records: CycleRecord[]): FlowDistributionItem[] {
  const counts: Record<CycleRecord['flow'], number> = {
    Absent: 0,
    Léger: 0,
    Moyen: 0,
    Abondant: 0,
  };

  records.forEach((record) => {
    counts[record.flow] += 1;
  });

  return (Object.keys(counts) as CycleRecord['flow'][]).map((label) => ({
    label,
    count: counts[label],
    color: flowColorMap[label],
  }));
}

export function getPainTrend(records: CycleRecord[], limit = 7): PainTrendPoint[] {
  return [...records]
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(-limit)
    .map((record) => ({
      date: record.date,
      label: new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
      }).format(new Date(`${record.date}T12:00:00`)),
      pain: record.pain,
      flowLevel: record.flow,
      flowScore: flowScoreMap[record.flow],
    }));
}

export function getMonthlyHistory(records: CycleRecord[], limit = 4): MonthlyHistoryItem[] {
  const monthMap = new Map<string, CycleRecord[]>();

  records.forEach((record) => {
    const monthKey = record.date.slice(0, 7);
    const bucket = monthMap.get(monthKey) ?? [];
    bucket.push(record);
    monthMap.set(monthKey, bucket);
  });

  return [...monthMap.entries()]
    .sort((left, right) => right[0].localeCompare(left[0]))
    .slice(0, limit)
    .map(([key, monthRecords]) => toMonthlyItem(key, monthRecords));
}

export function getMonthComparison(records: CycleRecord[]): MonthComparisonStats | null {
  const monthMap = new Map<string, CycleRecord[]>();

  sortRecords(records).forEach((record) => {
    const monthKey = record.date.slice(0, 7);
    const bucket = monthMap.get(monthKey) ?? [];
    bucket.push(record);
    monthMap.set(monthKey, bucket);
  });

  const monthEntries = [...monthMap.entries()].sort((left, right) => right[0].localeCompare(left[0]));

  if (monthEntries.length < 2) {
    return null;
  }

  const [currentKey, currentRecords] = monthEntries[0];
  const [previousKey, previousRecords] = monthEntries[1];
  const current = toMonthlyItem(currentKey, currentRecords);
  const previous = toMonthlyItem(previousKey, previousRecords);

  return {
    current,
    previous,
    deltas: {
      trackedDays: current.trackedDays - previous.trackedDays,
      periodDays: current.periodDays - previous.periodDays,
      averagePain: Number(current.averagePain) - Number(previous.averagePain),
      averageSleep: Number(current.averageSleep) - Number(previous.averageSleep),
    },
  };
}

export function getFlowAnomalies(records: CycleRecord[], profile?: CycleProfile): FlowAnomalyItem[] {
  const sortedRecords = sortRecords(records);

  if (!sortedRecords.length) {
    return [];
  }

  const recentWindow = sortedRecords.slice(-14);
  const baselineWindow =
    sortedRecords.length > recentWindow.length ? sortedRecords.slice(0, -recentWindow.length) : sortedRecords;

  const baselineReference = baselineWindow.length ? baselineWindow : sortedRecords;
  const baselineFlow = averageFlowScore(baselineReference);
  const recentFlow = averageFlowScore(recentWindow);
  const baselinePain = averagePainValue(baselineReference);
  const recentPain = averagePainValue(recentWindow);
  const longestRun = longestPeriodRun(sortedRecords);
  const expectedPeriodLength = profile?.periodLength ?? 5;
  const anomalies: FlowAnomalyItem[] = [];

  const latestHeavyRecord = [...sortedRecords]
    .reverse()
    .find((record) => record.flow === 'Abondant' && record.pain >= 6);

  if (latestHeavyRecord) {
    anomalies.push({
      key: 'heavy-flow-day',
      level: 'alert',
      title: 'Jour de flux très intense',
      detail: `Le ${formatCompactDate(latestHeavyRecord.date)}, le flux était abondant avec une douleur de ${latestHeavyRecord.pain}/10.`,
      date: latestHeavyRecord.date,
    });
  }

  if (longestRun > expectedPeriodLength + 1) {
    anomalies.push({
      key: 'long-period-run',
      level: 'watch',
      title: 'Règles plus longues que prévu',
      detail: `Une série de ${longestRun} jours de règles dépasse la durée moyenne configurée (${expectedPeriodLength} jours).`,
    });
  }

  if (recentWindow.length >= 4 && recentFlow - baselineFlow >= 0.8) {
    anomalies.push({
      key: 'recent-flow-spike',
      level: 'watch',
      title: 'Flux plus fort récemment',
      detail: `Le score moyen du flux sur les 14 derniers jours est passé de ${baselineFlow.toFixed(1)} à ${recentFlow.toFixed(1)}.`,
    });
  }

  if (recentWindow.length >= 4 && recentPain - baselinePain >= 1.5) {
    anomalies.push({
      key: 'pain-spike',
      level: 'info',
      title: 'Douleur plus haute que d’habitude',
      detail: `La douleur moyenne récente est montée de ${baselinePain.toFixed(1)}/10 à ${recentPain.toFixed(1)}/10.`,
    });
  }

  const frequentAbundantDays = sortedRecords.filter((record) => record.flow === 'Abondant').length;
  if (frequentAbundantDays >= 3) {
    anomalies.push({
      key: 'repeated-abundant-days',
      level: 'info',
      title: 'Plusieurs jours abondants',
      detail: `Tu as enregistré ${frequentAbundantDays} jours de flux abondant. Cela vaut le coup de surveiller si ce rythme se répète.`,
    });
  }

  return anomalies.slice(0, 4);
}
