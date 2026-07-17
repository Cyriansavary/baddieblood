import {
  addDays,
  buildMonthMatrix,
  differenceInDays,
  formatFrenchDateTyping,
  getCycleDay,
  getCyclePhase,
  getDatesInRange,
  getDaysUntilNextPeriod,
  getFertileWindow,
  getPeriodLengthAverage,
  getPeriodRuns,
  getUpcomingPeriodStart,
  isoDate,
  parseFrenchDateInput,
  toDate,
} from '../cycle';
import type { CycleRecord } from '../../data/cycleData';

function makeRecord(date: string, flow: CycleRecord['flow'] = 'Moyen', source: CycleRecord['source'] = 'manual'): CycleRecord {
  return { date, flow, pain: 0, mood: '', sleepHours: 0, symptoms: [], notes: '', source };
}

// ─── toDate / isoDate ────────────────────────────────────────────────────────

describe('toDate', () => {
  it('parses ISO string to local noon Date', () => {
    const d = toDate('2024-03-15');
    expect(d.getFullYear()).toBe(2024);
    expect(d.getMonth()).toBe(2); // 0-indexed
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(12);
  });

  it('returns same-day Date when given a Date object', () => {
    const input = new Date(2024, 5, 10, 8, 30);
    const d = toDate(input);
    expect(d.getFullYear()).toBe(2024);
    expect(d.getDate()).toBe(10);
  });
});

describe('isoDate', () => {
  it('returns YYYY-MM-DD from a Date', () => {
    expect(isoDate(new Date(2024, 0, 5))).toBe('2024-01-05');
  });

  it('roundtrips with toDate', () => {
    const iso = '2025-11-30';
    expect(isoDate(toDate(iso))).toBe(iso);
  });
});

// ─── differenceInDays ────────────────────────────────────────────────────────

describe('differenceInDays', () => {
  it('returns 0 for the same date', () => {
    expect(differenceInDays('2024-01-10', '2024-01-10')).toBe(0);
  });

  it('returns positive when a is after b', () => {
    expect(differenceInDays('2024-01-15', '2024-01-10')).toBe(5);
  });

  it('returns negative when a is before b', () => {
    expect(differenceInDays('2024-01-10', '2024-01-15')).toBe(-5);
  });

  it('handles month boundaries', () => {
    expect(differenceInDays('2024-02-01', '2024-01-31')).toBe(1);
  });

  it('handles leap years', () => {
    expect(differenceInDays('2024-03-01', '2024-02-01')).toBe(29);
  });
});

// ─── addDays ─────────────────────────────────────────────────────────────────

describe('addDays', () => {
  it('adds positive days', () => {
    expect(addDays('2024-01-28', 5)).toBe('2024-02-02');
  });

  it('subtracts negative days', () => {
    expect(addDays('2024-03-01', -1)).toBe('2024-02-29');
  });

  it('stays same day with 0', () => {
    expect(addDays('2024-06-15', 0)).toBe('2024-06-15');
  });
});

// ─── getCycleDay ─────────────────────────────────────────────────────────────

describe('getCycleDay', () => {
  const lastPeriodStart = '2024-01-01';
  const cycleLength = 28;

  it('returns 1 on the start day', () => {
    expect(getCycleDay('2024-01-01', lastPeriodStart, cycleLength)).toBe(1);
  });

  it('returns 28 one day before next cycle', () => {
    expect(getCycleDay('2024-01-28', lastPeriodStart, cycleLength)).toBe(28);
  });

  it('wraps around at cycle length', () => {
    expect(getCycleDay('2024-01-29', lastPeriodStart, cycleLength)).toBe(1);
  });

  it('works for dates before lastPeriodStart', () => {
    const day = getCycleDay('2023-12-18', lastPeriodStart, cycleLength);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(cycleLength);
  });
});

// ─── getCyclePhase ────────────────────────────────────────────────────────────

describe('getCyclePhase', () => {
  const cycleLength = 28;
  const periodLength = 5;

  it('returns period phase on day 1–5', () => {
    expect(getCyclePhase(1, cycleLength, periodLength).key).toBe('period');
    expect(getCyclePhase(5, cycleLength, periodLength).key).toBe('period');
  });

  it('returns follicular phase in mid-cycle before ovulation window', () => {
    expect(getCyclePhase(8, cycleLength, periodLength).key).toBe('follicular');
  });

  it('returns ovulation phase around ovulation day', () => {
    const ovulationDay = cycleLength - 14; // day 14
    expect(getCyclePhase(ovulationDay, cycleLength, periodLength).key).toBe('ovulation');
  });

  it('returns luteal phase after ovulation window', () => {
    expect(getCyclePhase(18, cycleLength, periodLength).key).toBe('luteal');
  });
});

// ─── getUpcomingPeriodStart ───────────────────────────────────────────────────

describe('getUpcomingPeriodStart', () => {
  it('returns lastPeriodStart when today is the start', () => {
    expect(getUpcomingPeriodStart('2024-01-01', '2024-01-01', 28)).toBe('2024-01-01');
  });

  it('returns next cycle start when today is past the start', () => {
    expect(getUpcomingPeriodStart('2024-01-15', '2024-01-01', 28)).toBe('2024-01-29');
  });

  it('returns next cycle start when today is mid-cycle', () => {
    // Day 5 of a 28-day cycle → next period starts on day 29 = 2024-01-29
    expect(getUpcomingPeriodStart('2024-01-05', '2024-01-01', 28)).toBe('2024-01-29');
  });
});

// ─── getDaysUntilNextPeriod ───────────────────────────────────────────────────

describe('getDaysUntilNextPeriod', () => {
  it('returns 0 on the start day', () => {
    expect(getDaysUntilNextPeriod('2024-01-01', '2024-01-01', 28)).toBe(0);
  });

  it('returns days until next cycle', () => {
    expect(getDaysUntilNextPeriod('2024-01-15', '2024-01-01', 28)).toBe(14);
  });
});

// ─── getFertileWindow ─────────────────────────────────────────────────────────

describe('getFertileWindow', () => {
  it('starts 4 days before ovulation and ends 1 day after', () => {
    // lastPeriodStart = 2024-01-01, cycleLength = 28
    // nextPeriodStart = 2024-01-29 (28 days later), ovulation = 2024-01-15 (14 days before)
    // fertile: 2024-01-11 to 2024-01-16
    const window = getFertileWindow('2024-01-10', '2024-01-01', 28);
    expect(window.start).toBe('2024-01-11');
    expect(window.end).toBe('2024-01-16');
  });
});

// ─── getPeriodRuns ────────────────────────────────────────────────────────────

describe('getPeriodRuns', () => {
  it('returns empty array when no records', () => {
    expect(getPeriodRuns([])).toEqual([]);
  });

  it('returns empty array when all flows are Absent', () => {
    expect(getPeriodRuns([makeRecord('2024-01-01', 'Absent')])).toEqual([]);
  });

  it('groups consecutive period days into one run', () => {
    const records = [
      makeRecord('2024-01-01', 'Abondant'),
      makeRecord('2024-01-02', 'Moyen'),
      makeRecord('2024-01-03', 'Léger'),
    ];
    const runs = getPeriodRuns(records);
    expect(runs).toHaveLength(1);
    expect(runs[0]).toEqual({ start: '2024-01-01', end: '2024-01-03', length: 3 });
  });

  it('splits non-consecutive days into multiple runs', () => {
    const records = [
      makeRecord('2024-01-01', 'Moyen'),
      makeRecord('2024-01-05', 'Moyen'),
    ];
    const runs = getPeriodRuns(records);
    expect(runs).toHaveLength(2);
    expect(runs[0].start).toBe('2024-01-01');
    expect(runs[1].start).toBe('2024-01-05');
  });

  it('ignores Absent records within a run', () => {
    const records = [
      makeRecord('2024-01-01', 'Moyen'),
      makeRecord('2024-01-02', 'Absent'),
      makeRecord('2024-01-03', 'Léger'),
    ];
    const runs = getPeriodRuns(records);
    expect(runs).toHaveLength(2);
  });
});

// ─── getPeriodLengthAverage ───────────────────────────────────────────────────

describe('getPeriodLengthAverage', () => {
  it('returns 0 for empty records', () => {
    expect(getPeriodLengthAverage([])).toBe(0);
  });

  it('returns average length across runs', () => {
    const records = [
      makeRecord('2024-01-01', 'Moyen'),
      makeRecord('2024-01-02', 'Moyen'),
      makeRecord('2024-02-01', 'Moyen'),
      makeRecord('2024-02-02', 'Moyen'),
      makeRecord('2024-02-03', 'Moyen'),
      makeRecord('2024-02-04', 'Moyen'),
    ];
    // run 1: 2 days, run 2: 4 days → average = 3
    expect(getPeriodLengthAverage(records)).toBe(3);
  });
});

// ─── getDatesInRange ──────────────────────────────────────────────────────────

describe('getDatesInRange', () => {
  it('returns single date when start equals end', () => {
    expect(getDatesInRange('2024-01-05', '2024-01-05')).toEqual(['2024-01-05']);
  });

  it('returns all dates in a range', () => {
    expect(getDatesInRange('2024-01-01', '2024-01-03')).toEqual([
      '2024-01-01',
      '2024-01-02',
      '2024-01-03',
    ]);
  });

  it('handles reversed order (end before start)', () => {
    expect(getDatesInRange('2024-01-03', '2024-01-01')).toEqual([
      '2024-01-01',
      '2024-01-02',
      '2024-01-03',
    ]);
  });
});

// ─── parseFrenchDateInput ─────────────────────────────────────────────────────

describe('parseFrenchDateInput', () => {
  it('parses valid DD/MM/YYYY', () => {
    expect(parseFrenchDateInput('15/03/2024')).toBe('2024-03-15');
  });

  it('accepts existing ISO format', () => {
    expect(parseFrenchDateInput('2024-03-15')).toBe('2024-03-15');
  });

  it('returns null for invalid date', () => {
    expect(parseFrenchDateInput('32/01/2024')).toBeNull();
    expect(parseFrenchDateInput('15/13/2024')).toBeNull();
    expect(parseFrenchDateInput('30/02/2024')).toBeNull();
  });

  it('returns null for incomplete input', () => {
    expect(parseFrenchDateInput('15/03')).toBeNull();
    expect(parseFrenchDateInput('')).toBeNull();
  });
});

// ─── formatFrenchDateTyping ───────────────────────────────────────────────────

describe('formatFrenchDateTyping', () => {
  it('returns digits as-is for ≤2 chars', () => {
    expect(formatFrenchDateTyping('1')).toBe('1');
    expect(formatFrenchDateTyping('15')).toBe('15');
  });

  it('inserts first slash after day digits', () => {
    expect(formatFrenchDateTyping('153')).toBe('15/3');
  });

  it('inserts second slash after month digits', () => {
    expect(formatFrenchDateTyping('15032')).toBe('15/03/2');
  });

  it('formats a full date', () => {
    expect(formatFrenchDateTyping('15032024')).toBe('15/03/2024');
  });

  it('strips non-digit characters', () => {
    expect(formatFrenchDateTyping('15/03/2024')).toBe('15/03/2024');
    expect(formatFrenchDateTyping('ab15cd03ef2024')).toBe('15/03/2024');
  });
});

// ─── buildMonthMatrix ─────────────────────────────────────────────────────────

describe('buildMonthMatrix', () => {
  it('returns 6 weeks of 7 days', () => {
    const matrix = buildMonthMatrix(new Date(2024, 0, 1));
    expect(matrix).toHaveLength(6);
    matrix.forEach((week) => expect(week).toHaveLength(7));
  });

  it('includes the first day of the month', () => {
    const matrix = buildMonthMatrix(new Date(2024, 2, 1)); // March 2024
    const allDays = matrix.flat();
    const march1 = allDays.find((d) => d.getMonth() === 2 && d.getDate() === 1);
    expect(march1).toBeDefined();
  });
});
