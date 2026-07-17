import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';

import { FlowLevel, CycleRecord } from '../../../../data/cycleData';
import { useCycleRecords } from '../useCycleRecords';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

function makeRecord(
  date: string,
  flow: FlowLevel = 'Moyen',
  source: CycleRecord['source'] = 'manual',
): CycleRecord {
  return { date, flow, pain: 0, mood: '', sleepHours: 0, symptoms: [], notes: '', source };
}

describe('useCycleRecords', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  it('démarre avec une liste vide', () => {
    const { result } = renderHook(() => useCycleRecords());
    expect(result.current.records).toHaveLength(0);
    expect(result.current.recordMap.size).toBe(0);
  });

  it('initialise les records et construit la recordMap', () => {
    const { result } = renderHook(() => useCycleRecords());
    act(() => {
      result.current.initialize([
        makeRecord('2026-01-01'),
        makeRecord('2026-01-03'),
      ]);
    });
    expect(result.current.records).toHaveLength(2);
    expect(result.current.recordMap.has('2026-01-01')).toBe(true);
    expect(result.current.recordMap.has('2026-01-03')).toBe(true);
  });

  it('trie les records par date lors du persist', async () => {
    const { result } = renderHook(() => useCycleRecords());
    await act(async () => {
      await result.current.persistRecords([
        makeRecord('2026-01-03'),
        makeRecord('2026-01-01'),
        makeRecord('2026-01-02'),
      ]);
    });
    expect(result.current.records[0].date).toBe('2026-01-01');
    expect(result.current.records[2].date).toBe('2026-01-03');
  });

  it('sauvegarde une entrée valide', async () => {
    const { result } = renderHook(() => useCycleRecords());
    act(() => {
      result.current.updateEntryForm({ flow: 'Abondant', pain: 6 });
    });
    await act(async () => {
      await result.current.saveEntry('2026-01-15');
    });
    expect(result.current.records).toHaveLength(1);
    expect(result.current.records[0].flow).toBe('Abondant');
    expect(result.current.entryMessage).toContain('enregistré');
  });

  it('refuse de sauvegarder une entrée vide', async () => {
    const { result } = renderHook(() => useCycleRecords());
    await act(async () => {
      await result.current.saveEntry('2026-01-15');
    });
    expect(result.current.records).toHaveLength(0);
    expect(result.current.entryMessage).toBeTruthy();
  });

  it('supprime une entrée existante', async () => {
    const { result } = renderHook(() => useCycleRecords());
    act(() => { result.current.initialize([makeRecord('2026-01-15')]); });

    await act(async () => {
      await result.current.deleteEntry('2026-01-15');
    });

    expect(result.current.records).toHaveLength(0);
    expect(result.current.entryMessage).toContain('supprimé');
  });

  it('toggle period day — ajoute un jour absent', async () => {
    const { result } = renderHook(() => useCycleRecords());
    await act(async () => {
      await result.current.togglePeriodDay('2026-01-10');
    });
    const record = result.current.recordMap.get('2026-01-10');
    expect(record).toBeDefined();
    expect(record!.flow).toBe('Moyen');
  });

  it('toggle period day — retire un jour déjà marqué', async () => {
    const { result } = renderHook(() => useCycleRecords());
    act(() => {
      result.current.initialize([makeRecord('2026-01-10', 'Moyen', 'calendar')]);
    });
    await act(async () => {
      await result.current.togglePeriodDay('2026-01-10');
    });
    expect(result.current.recordMap.has('2026-01-10')).toBe(false);
  });

  it('syncEntryFormToDate charge le bon record', () => {
    const { result } = renderHook(() => useCycleRecords());
    const record = makeRecord('2026-01-05', 'Léger');
    act(() => { result.current.initialize([record]); });

    act(() => {
      result.current.syncEntryFormToDate('2026-01-05', result.current.recordMap);
    });

    expect(result.current.entryForm.flow).toBe('Léger');
  });

  it('reset vide tout l\'état', async () => {
    const { result } = renderHook(() => useCycleRecords());
    act(() => { result.current.initialize([makeRecord('2026-01-01')]); });
    act(() => { result.current.reset(); });
    expect(result.current.records).toHaveLength(0);
    expect(result.current.entryMessage).toBe('');
  });

  it('applyPeriodRange marque une plage de dates', async () => {
    const { result } = renderHook(() => useCycleRecords());
    await act(async () => {
      await result.current.applyPeriodRange('2026-01-10', '2026-01-12');
    });
    expect(result.current.records).toHaveLength(3);
    const flows = result.current.records.map((r) => r.flow);
    expect(flows).toContain('Abondant');
  });
});
