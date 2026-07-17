import {
  averageSleep,
  countPeriodEntries,
  getDominantSymptoms,
  getFlowAnomalies,
  getFlowDistribution,
  getMonthComparison,
  getMonthlyHistory,
  getPainTrend,
  getRecentRecords,
} from '../insights';
import type { CycleProfile, CycleRecord } from '../../data/cycleData';

function makeRecord(
  date: string,
  overrides: Partial<CycleRecord> = {}
): CycleRecord {
  return {
    date,
    flow: 'Absent',
    pain: 0,
    mood: '',
    sleepHours: 0,
    symptoms: [],
    notes: '',
    source: 'manual',
    ...overrides,
  };
}

const baseProfile: CycleProfile = {
  name: 'Test',
  trackingMode: 'cycle',
  cycleLength: 28,
  periodLength: 5,
  lastPeriodStart: '2024-01-01',
  addressingStyle: 'nonBinary',
  pregnancyDueDate: '',
};

// ─── averageSleep ─────────────────────────────────────────────────────────────

describe('averageSleep', () => {
  it('returns "0.0" for empty records', () => {
    expect(averageSleep([])).toBe('0.0');
  });

  it('computes average correctly', () => {
    const records = [
      makeRecord('2024-01-01', { sleepHours: 6 }),
      makeRecord('2024-01-02', { sleepHours: 8 }),
      makeRecord('2024-01-03', { sleepHours: 7 }),
    ];
    expect(averageSleep(records)).toBe('7.0');
  });

  it('rounds to one decimal place', () => {
    const records = [
      makeRecord('2024-01-01', { sleepHours: 6 }),
      makeRecord('2024-01-02', { sleepHours: 7 }),
    ];
    expect(averageSleep(records)).toBe('6.5');
  });
});

// ─── countPeriodEntries ───────────────────────────────────────────────────────

describe('countPeriodEntries', () => {
  it('returns 0 when no records', () => {
    expect(countPeriodEntries([])).toBe(0);
  });

  it('counts only non-Absent flows', () => {
    const records = [
      makeRecord('2024-01-01', { flow: 'Moyen' }),
      makeRecord('2024-01-02', { flow: 'Absent' }),
      makeRecord('2024-01-03', { flow: 'Léger' }),
      makeRecord('2024-01-04', { flow: 'Abondant' }),
    ];
    expect(countPeriodEntries(records)).toBe(3);
  });
});

// ─── getDominantSymptoms ──────────────────────────────────────────────────────

describe('getDominantSymptoms', () => {
  it('returns empty array for records with no symptoms', () => {
    expect(getDominantSymptoms([makeRecord('2024-01-01')])).toEqual([]);
  });

  it('ranks symptoms by frequency', () => {
    const records = [
      makeRecord('2024-01-01', { symptoms: ['Crampes', 'Fatigue'] }),
      makeRecord('2024-01-02', { symptoms: ['Crampes'] }),
      makeRecord('2024-01-03', { symptoms: ['Ballonnements'] }),
    ];
    const result = getDominantSymptoms(records);
    expect(result[0].symptom).toBe('Crampes');
    expect(result[0].count).toBe(2);
  });

  it('respects the limit parameter', () => {
    const records = [
      makeRecord('2024-01-01', { symptoms: ['A', 'B', 'C', 'D', 'E'] }),
    ];
    expect(getDominantSymptoms(records, 2)).toHaveLength(2);
  });

  it('computes share as percentage of total occurrences', () => {
    const records = [
      makeRecord('2024-01-01', { symptoms: ['A', 'A'] }),
      makeRecord('2024-01-02', { symptoms: ['B', 'B', 'B'] }),
    ];
    const result = getDominantSymptoms(records, 2);
    const b = result.find((r) => r.symptom === 'B')!;
    expect(b.share).toBe(60); // 3/5 = 60%
  });
});

// ─── getFlowDistribution ──────────────────────────────────────────────────────

describe('getFlowDistribution', () => {
  it('returns all 4 flow levels with counts', () => {
    const records = [
      makeRecord('2024-01-01', { flow: 'Absent' }),
      makeRecord('2024-01-02', { flow: 'Léger' }),
      makeRecord('2024-01-03', { flow: 'Moyen' }),
      makeRecord('2024-01-04', { flow: 'Abondant' }),
      makeRecord('2024-01-05', { flow: 'Abondant' }),
    ];
    const dist = getFlowDistribution(records);
    expect(dist).toHaveLength(4);

    const abondant = dist.find((d) => d.label === 'Abondant')!;
    expect(abondant.count).toBe(2);

    const absent = dist.find((d) => d.label === 'Absent')!;
    expect(absent.count).toBe(1);
  });

  it('returns zeros for missing flow levels', () => {
    const records = [makeRecord('2024-01-01', { flow: 'Moyen' })];
    const dist = getFlowDistribution(records);
    const absent = dist.find((d) => d.label === 'Absent')!;
    expect(absent.count).toBe(0);
  });
});

// ─── getPainTrend ─────────────────────────────────────────────────────────────

describe('getPainTrend', () => {
  it('returns empty array for no records', () => {
    expect(getPainTrend([])).toEqual([]);
  });

  it('returns at most limit records in chronological order', () => {
    const records = Array.from({ length: 10 }, (_, i) =>
      makeRecord(`2024-01-${String(i + 1).padStart(2, '0')}`, { pain: i })
    );
    const trend = getPainTrend(records, 5);
    expect(trend).toHaveLength(5);
    expect(trend[0].date).toBe('2024-01-06');
    expect(trend[4].date).toBe('2024-01-10');
  });

  it('includes pain and flowScore in each point', () => {
    const records = [makeRecord('2024-01-01', { pain: 7, flow: 'Abondant' })];
    const trend = getPainTrend(records);
    expect(trend[0].pain).toBe(7);
    expect(trend[0].flowScore).toBe(3);
  });
});

// ─── getRecentRecords ─────────────────────────────────────────────────────────

describe('getRecentRecords', () => {
  it('returns the most recent records sorted descending', () => {
    const records = [
      makeRecord('2024-01-01'),
      makeRecord('2024-01-03'),
      makeRecord('2024-01-02'),
    ];
    const recent = getRecentRecords(records, 2);
    expect(recent).toHaveLength(2);
    expect(recent[0].date).toBe('2024-01-03');
    expect(recent[1].date).toBe('2024-01-02');
  });

  it('returns all records when limit exceeds length', () => {
    const records = [makeRecord('2024-01-01')];
    expect(getRecentRecords(records, 10)).toHaveLength(1);
  });
});

// ─── getMonthlyHistory ────────────────────────────────────────────────────────

describe('getMonthlyHistory', () => {
  it('groups records by month', () => {
    const records = [
      makeRecord('2024-01-10', { flow: 'Moyen' }),
      makeRecord('2024-01-15', { pain: 5 }),
      makeRecord('2024-02-05'),
    ];
    const history = getMonthlyHistory(records, 4);
    expect(history).toHaveLength(2);
    const feb = history.find((h) => h.key === '2024-02')!;
    expect(feb.trackedDays).toBe(1);
    const jan = history.find((h) => h.key === '2024-01')!;
    expect(jan.periodDays).toBe(1);
  });

  it('sorts months descending', () => {
    const records = [
      makeRecord('2024-01-01'),
      makeRecord('2024-03-01'),
      makeRecord('2024-02-01'),
    ];
    const history = getMonthlyHistory(records, 4);
    expect(history[0].key).toBe('2024-03');
    expect(history[1].key).toBe('2024-02');
    expect(history[2].key).toBe('2024-01');
  });
});

// ─── getMonthComparison ───────────────────────────────────────────────────────

describe('getMonthComparison', () => {
  it('returns null when fewer than 2 months of data', () => {
    const records = [makeRecord('2024-01-01')];
    expect(getMonthComparison(records)).toBeNull();
  });

  it('returns comparison with deltas between two most recent months', () => {
    const records = [
      makeRecord('2024-01-10', { flow: 'Moyen', pain: 4, sleepHours: 7 }),
      makeRecord('2024-02-10', { flow: 'Léger', pain: 6, sleepHours: 6 }),
    ];
    const comparison = getMonthComparison(records);
    expect(comparison).not.toBeNull();
    expect(comparison!.current.key).toBe('2024-02');
    expect(comparison!.previous.key).toBe('2024-01');
    expect(comparison!.deltas.averagePain).toBeCloseTo(2, 1);
  });
});

// ─── getFlowAnomalies ─────────────────────────────────────────────────────────

describe('getFlowAnomalies', () => {
  it('returns empty array for no records', () => {
    expect(getFlowAnomalies([])).toEqual([]);
  });

  it('detects heavy-flow + high-pain day', () => {
    const records = [
      makeRecord('2024-01-01', { flow: 'Abondant', pain: 8 }),
    ];
    const anomalies = getFlowAnomalies(records, baseProfile);
    expect(anomalies.some((a) => a.key === 'heavy-flow-day')).toBe(true);
  });

  it('detects period run longer than expected', () => {
    const records = Array.from({ length: 8 }, (_, i) =>
      makeRecord(`2024-01-${String(i + 1).padStart(2, '0')}`, { flow: 'Léger' })
    );
    const anomalies = getFlowAnomalies(records, { ...baseProfile, periodLength: 5 });
    expect(anomalies.some((a) => a.key === 'long-period-run')).toBe(true);
  });

  it('returns at most 4 anomalies', () => {
    // Heavy flow + long run + flow spike + pain spike + repeated abundant
    const records = [
      ...Array.from({ length: 10 }, (_, i) =>
        makeRecord(`2024-01-${String(i + 1).padStart(2, '0')}`, { flow: 'Abondant', pain: 9 })
      ),
      ...Array.from({ length: 14 }, (_, i) =>
        makeRecord(`2024-02-${String(i + 1).padStart(2, '0')}`, { flow: 'Abondant', pain: 9 })
      ),
    ];
    const anomalies = getFlowAnomalies(records, baseProfile);
    expect(anomalies.length).toBeLessThanOrEqual(4);
  });
});
