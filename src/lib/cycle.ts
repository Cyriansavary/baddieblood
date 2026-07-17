import { CycleProfile, CycleRecord } from '../data/cycleData';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function toDate(dateLike: string | Date) {
  if (dateLike instanceof Date) {
    return new Date(dateLike.getFullYear(), dateLike.getMonth(), dateLike.getDate(), 12);
  }

  const [year, month, day] = dateLike.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

export function isoDate(date: string | Date) {
  const normalized = toDate(date);
  const year = normalized.getFullYear();
  const month = `${normalized.getMonth() + 1}`.padStart(2, '0');
  const day = `${normalized.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(date: string | Date, amount: number) {
  const next = toDate(date);
  next.setDate(next.getDate() + amount);
  return isoDate(next);
}

export function differenceInDays(a: string | Date, b: string | Date) {
  return Math.round((toDate(a).getTime() - toDate(b).getTime()) / DAY_IN_MS);
}

export function monthOffset(baseDate: Date, offset: number) {
  return new Date(baseDate.getFullYear(), baseDate.getMonth() + offset, 1, 12);
}

export function buildMonthMatrix(monthDate: Date) {
  const start = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 12);
  const startWeekDay = (start.getDay() + 6) % 7;
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - startWeekDay);

  return Array.from({ length: 6 }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const next = new Date(gridStart);
      next.setDate(gridStart.getDate() + weekIndex * 7 + dayIndex);
      return next;
    })
  );
}

export function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatDateLong(date: string | Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
  }).format(toDate(date));
}

export function formatDateLongWithYear(date: string | Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(toDate(date));
}

export function formatDateInputFr(date: string | Date) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(toDate(date));
}

export function formatFrenchDateTyping(value: string) {
  const digitsOnly = value.replace(/\D/g, '').slice(0, 8);

  if (digitsOnly.length <= 2) {
    return digitsOnly;
  }

  if (digitsOnly.length <= 4) {
    return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  }

  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`;
}

export function parseFrenchDateInput(value: string) {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const isoValue = `${year}-${month}-${day}`;
  const parsedDate = toDate(isoValue);

  if (
    parsedDate.getFullYear() !== Number(year) ||
    parsedDate.getMonth() + 1 !== Number(month) ||
    parsedDate.getDate() !== Number(day)
  ) {
    return null;
  }

  return isoValue;
}

export function getDatesInRange(startDate: string, endDate: string) {
  const start = toDate(startDate);
  const end = toDate(endDate);
  const first = start <= end ? start : end;
  const last = start <= end ? end : start;
  const dates: string[] = [];
  const cursor = new Date(first);

  while (cursor <= last) {
    dates.push(isoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

export function getCycleDay(targetDate: string, lastPeriodStart: string, cycleLength: number) {
  const diff = differenceInDays(targetDate, lastPeriodStart);
  const normalized = ((diff % cycleLength) + cycleLength) % cycleLength;
  return normalized + 1;
}

export function getCyclePhase(
  cycleDay: number,
  cycleLength: number,
  periodLength: number
) {
  const ovulationDay = cycleLength - 14;

  if (cycleDay <= periodLength) {
    return {
      key: 'period',
      label: 'Phase menstruelle',
      shortLabel: 'Règles',
      background: '#fde1e8',
      foreground: '#a2325a',
    };
  }

  if (cycleDay < ovulationDay - 3) {
    return {
      key: 'follicular',
      label: 'Phase folliculaire',
      shortLabel: 'Folliculaire',
      background: '#fff0da',
      foreground: '#8b5f16',
    };
  }

  if (cycleDay <= ovulationDay + 2) {
    return {
      key: 'ovulation',
      label: 'Fenêtre ovulatoire',
      shortLabel: 'Ovulation',
      background: '#dcf5f1',
      foreground: '#166765',
    };
  }

  return {
    key: 'luteal',
    label: 'Phase lutéale',
    shortLabel: 'Lutéale',
    background: '#e6edf5',
    foreground: '#2d4b68',
  };
}

export function getRelativeEnergy(phaseKey: string) {
  if (phaseKey === 'period') {
    return 'Douce';
  }

  if (phaseKey === 'follicular') {
    return 'En hausse';
  }

  if (phaseKey === 'ovulation') {
    return 'Élevée';
  }

  return 'Variable';
}

export function getUpcomingPeriodStart(
  referenceDate: string,
  lastPeriodStart: string,
  cycleLength: number
) {
  const diff = differenceInDays(referenceDate, lastPeriodStart);
  const cyclesElapsed = Math.floor(diff / cycleLength);
  const candidate = addDays(lastPeriodStart, Math.max(cyclesElapsed, 0) * cycleLength);

  if (differenceInDays(candidate, referenceDate) >= 0) {
    return candidate;
  }

  return addDays(candidate, cycleLength);
}

export function getDaysUntilNextPeriod(
  todayIso: string,
  lastPeriodStart: string,
  cycleLength: number
) {
  return differenceInDays(
    getUpcomingPeriodStart(todayIso, lastPeriodStart, cycleLength),
    todayIso
  );
}

export function getFertileWindow(
  referenceDate: string,
  lastPeriodStart: string,
  cycleLength: number
) {
  const nextPeriodStart = getUpcomingPeriodStart(referenceDate, lastPeriodStart, cycleLength);
  const ovulationDate = addDays(nextPeriodStart, -14);
  return {
    start: addDays(ovulationDate, -4),
    end: addDays(ovulationDate, 1),
  };
}

export function isSameDay(a: string | Date, b: string | Date) {
  return isoDate(a) === isoDate(b);
}

export function getRecordForDate(records: CycleRecord[], date: string) {
  return records.find((record) => record.date === date);
}

export function resolveDayMetaForRecord(
  date: string,
  todayIso: string,
  lastPeriodStart: string,
  cycleLength: number,
  periodLength: number,
  record?: CycleRecord
) {
  const cycleDay = getCycleDay(date, lastPeriodStart, cycleLength);
  const ovulationDay = cycleLength - 14;

  let kind: 'default' | 'period' | 'predicted-period' | 'fertile' = 'default';
  let statusLabel = 'Jour standard';
  let flowFallback = 'À renseigner';
  let painFallback = 'À renseigner';
  let suggestedSymptoms = ['Hydratation', 'Repos', 'Observation'];

  if (record && record.flow !== 'Absent') {
    kind = 'period';
    statusLabel = 'Règles enregistrées';
  } else if (
    differenceInDays(date, lastPeriodStart) >= cycleLength &&
    cycleDay <= periodLength
  ) {
    kind = 'predicted-period';
    statusLabel = 'Règles prédites';
    flowFallback = 'Flux probable';
    painFallback = 'Moyen';
    suggestedSymptoms = ['Crampes', 'Fatigue', 'Ballonnements'];
  } else if (cycleDay >= ovulationDay - 4 && cycleDay <= ovulationDay + 1) {
    kind = 'fertile';
    statusLabel = 'Fenêtre fertile';
    flowFallback = 'Absent';
    painFallback = 'Faible';
    suggestedSymptoms = ['Énergie haute', 'Libido', 'Pertes claires'];
  }

  if (cycleDay <= periodLength && kind === 'default') {
    flowFallback = 'Léger à moyen';
    painFallback = 'Variable';
    suggestedSymptoms = ['Crampes', 'Fatigue', 'Besoin de repos'];
  }

  if (cycleDay > cycleLength - 7 && kind === 'default') {
    statusLabel = 'Phase prémenstruelle';
    suggestedSymptoms = ['Sensibilité poitrine', 'Envies sucrées', 'Irritabilité'];
  }

  return {
    kind,
    isToday: isSameDay(date, todayIso),
    statusLabel,
    flowFallback,
    painFallback,
    suggestedSymptoms,
  };
}

export function averagePain(records: CycleRecord[]) {
  if (!records.length) {
    return '0.0';
  }

  return (
    Math.round(
      (records.reduce((total, record) => total + record.pain, 0) / records.length) * 10
    ) / 10
  ).toFixed(1);
}

export function getPeriodLengthAverage(records: CycleRecord[]) {
  const runs = getPeriodRuns(records);
  if (!runs.length) {
    return 0;
  }

  return Math.round(runs.reduce((sum, run) => sum + run.length, 0) / runs.length);
}

export function getPeriodRuns(records: CycleRecord[]) {
  const periodDates = records
    .filter((record) => record.flow !== 'Absent')
    .map((record) => record.date)
    .sort();

  if (!periodDates.length) {
    return [] as Array<{ start: string; end: string; length: number }>;
  }

  const runs: Array<{ start: string; end: string; length: number }> = [];
  let currentStart = periodDates[0];
  let currentEnd = periodDates[0];
  let currentLength = 1;

  for (let index = 1; index < periodDates.length; index += 1) {
    const currentDate = periodDates[index];
    if (differenceInDays(currentDate, currentEnd) === 1) {
      currentEnd = currentDate;
      currentLength += 1;
      continue;
    }

    runs.push({ start: currentStart, end: currentEnd, length: currentLength });
    currentStart = currentDate;
    currentEnd = currentDate;
    currentLength = 1;
  }

  runs.push({ start: currentStart, end: currentEnd, length: currentLength });
  return runs;
}

export function deriveEstimatedProfile(baseProfile: CycleProfile, records: CycleRecord[]) {
  const runs = getPeriodRuns(records);
  if (!runs.length) {
    return baseProfile;
  }

  const cycleGaps: number[] = [];
  for (let index = 1; index < runs.length; index += 1) {
    cycleGaps.push(differenceInDays(runs[index].start, runs[index - 1].start));
  }

  const averageCycleLength = cycleGaps.length
    ? Math.round(cycleGaps.reduce((sum, value) => sum + value, 0) / cycleGaps.length)
    : baseProfile.cycleLength;
  const averagePeriodLength = Math.round(
    runs.reduce((sum, run) => sum + run.length, 0) / runs.length
  );

  return {
    name: baseProfile.name,
    trackingMode: baseProfile.trackingMode,
    cycleLength: clamp(averageCycleLength, 15, 45),
    periodLength: Math.max(0, averagePeriodLength),
    lastPeriodStart: runs[runs.length - 1].start,
    addressingStyle: baseProfile.addressingStyle,
    pregnancyDueDate: baseProfile.pregnancyDueDate,
  };
}

export function createElapsedPredictedPeriodRecords(
  todayIso: string,
  profile: CycleProfile,
  records: CycleRecord[]
) {
  if (profile.trackingMode === 'pregnancy') {
    return [];
  }

  const existingDates = new Set(records.map((record) => record.date));
  const createdRecords: CycleRecord[] = [];
  const nextKnownRun = getPeriodRuns(records).at(-1)?.start ?? profile.lastPeriodStart;
  let cycleStart = nextKnownRun;

  while (differenceInDays(todayIso, cycleStart) > 0) {
    const nextPredictedStart = getUpcomingPeriodStart(addDays(cycleStart, 1), cycleStart, profile.cycleLength);

    if (differenceInDays(nextPredictedStart, todayIso) >= 0) {
      break;
    }

    for (let offset = 0; offset < profile.periodLength; offset += 1) {
      const predictedDay = addDays(nextPredictedStart, offset);
      if (differenceInDays(todayIso, predictedDay) <= 0) {
        break;
      }

      if (!existingDates.has(predictedDay)) {
        createdRecords.push({
          date: predictedDay,
          flow: offset < 2 ? 'Abondant' : offset < 4 ? 'Moyen' : 'Léger',
          pain: 0,
          mood: '',
          sleepHours: 0,
          symptoms: [],
          notes: '',
          source: 'inferred',
        });
        existingDates.add(predictedDay);
      }
    }

    cycleStart = nextPredictedStart;
  }

  return createdRecords;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
