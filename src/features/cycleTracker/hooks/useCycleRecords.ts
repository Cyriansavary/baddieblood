import AsyncStorage from '@react-native-async-storage/async-storage';
import { startTransition, useCallback, useMemo, useState } from 'react';

import { CycleRecord } from '../../../data/cycleData';
import { getDatesInRange } from '../../../lib/cycle';
import { CYCLE_RECORDS_STORAGE_KEY } from '../../../lib/storage';
import {
  createEntryFormState,
  hasCustomEntryContent,
  isEntryMeaningful,
  sortRecords,
} from '../helpers';
import { EntryFormState } from '../types';

export function useCycleRecords() {
  const [records, setRecords] = useState<CycleRecord[]>([]);
  const [entryForm, setEntryForm] = useState<EntryFormState>(createEntryFormState());
  const [entryMessage, setEntryMessage] = useState('');

  const recordMap = useMemo(
    () => new Map(records.map((record) => [record.date, record])),
    [records]
  );

  const persistRecords = useCallback(async (nextRecords: CycleRecord[]) => {
    const sorted = sortRecords(nextRecords);
    startTransition(() => setRecords(sorted));
    await AsyncStorage.setItem(CYCLE_RECORDS_STORAGE_KEY, JSON.stringify(sorted));
  }, []);

  function updateEntryForm(patch: Partial<EntryFormState>) {
    setEntryForm((current) => ({ ...current, ...patch }));
  }

  function toggleSymptom(symptom: string) {
    setEntryForm((current) => {
      const exists = current.symptoms.includes(symptom);
      return {
        ...current,
        symptoms: exists
          ? current.symptoms.filter((s) => s !== symptom)
          : [...current.symptoms, symptom],
      };
    });
  }

  const syncEntryFormToDate = useCallback(
    (date: string, map: Map<string, CycleRecord>) => {
      setEntryForm(createEntryFormState(map.get(date)));
      setEntryMessage('');
    },
    []
  );

  async function saveEntry(selectedDate: string) {
    if (!isEntryMeaningful(entryForm)) {
      setEntryMessage('Ajoute au moins une information avant de sauvegarder.');
      return;
    }

    const sleepHours = Number.parseFloat(entryForm.sleepHours.replace(',', '.'));
    const nextRecord: CycleRecord = {
      date: selectedDate,
      flow: entryForm.flow,
      pain: entryForm.pain,
      mood: entryForm.mood.trim() || 'Non renseignée',
      sleepHours: Number.isFinite(sleepHours) ? sleepHours : 0,
      symptoms: entryForm.symptoms,
      notes: entryForm.notes.trim() || 'Aucune note',
      source: 'manual',
    };

    try {
      await persistRecords([...records.filter((r) => r.date !== selectedDate), nextRecord]);
      setEntryMessage('Suivi enregistré localement sur cet appareil.');
    } catch {
      setEntryMessage("La sauvegarde a échoué. Réessaie dans quelques instants.");
    }
  }

  async function deleteEntry(selectedDate: string) {
    try {
      await persistRecords(records.filter((r) => r.date !== selectedDate));
      setEntryForm(createEntryFormState());
      setEntryMessage('Enregistrement supprimé pour cette date.');
    } catch {
      setEntryMessage("La suppression a échoué. Réessaie dans quelques instants.");
    }
  }

  async function togglePeriodDay(dayIso: string) {
    const existingRecord = recordMap.get(dayIso);
    const isExistingPeriod = Boolean(existingRecord && existingRecord.flow !== 'Absent');

    try {
      if (isExistingPeriod) {
        const withoutCurrent = records.filter((r) => r.date !== dayIso);
        if (existingRecord?.source === 'manual' && hasCustomEntryContent(existingRecord)) {
          await persistRecords([...withoutCurrent, { ...existingRecord, flow: 'Absent' }]);
        } else {
          await persistRecords(withoutCurrent);
        }
        setEntryMessage('Jour de règles retiré depuis le calendrier.');
        return;
      }

      await persistRecords([
        ...records.filter((r) => r.date !== dayIso),
        {
          date: dayIso,
          flow: 'Moyen',
          pain: 0,
          mood: '',
          sleepHours: 0,
          symptoms: [],
          notes: '',
          source: 'calendar',
        },
      ]);
      setEntryMessage('Jour de règles ajouté depuis le calendrier.');
    } catch {
      setEntryMessage("La mise à jour du calendrier a échoué. Réessaie dans quelques instants.");
    }
  }

  async function applyPeriodRange(startDate: string, endDate: string) {
    const selectedDates = getDatesInRange(startDate, endDate);
    const selectedSet = new Set(selectedDates);
    const recordsInRange = records.filter((r) => selectedSet.has(r.date));
    const areAllMarked = selectedDates.every((date) =>
      recordsInRange.some((r) => r.date === date && r.flow !== 'Absent')
    );
    const remainingRecords = records.filter((r) => !selectedSet.has(r.date));

    if (areAllMarked) {
      const preservedRecords = recordsInRange
        .filter((r) => r.source === 'manual' && hasCustomEntryContent(r))
        .map((r) => ({ ...r, flow: 'Absent' as const }));
      await persistRecords([...remainingRecords, ...preservedRecords]);
      setEntryMessage('Plage de règles retirée depuis le calendrier.');
      return;
    }

    const nextRangeRecords = selectedDates.map((date, index) => {
      const existing = recordsInRange.find((r) => r.date === date);
      return {
        date,
        flow:
          existing?.flow && existing.flow !== 'Absent'
            ? existing.flow
            : index < 2
              ? 'Abondant'
              : index < 4
                ? 'Moyen'
                : 'Léger',
        pain: existing?.source === 'manual' ? existing.pain : 0,
        mood: existing?.source === 'manual' ? existing.mood : '',
        sleepHours: existing?.source === 'manual' ? existing.sleepHours : 0,
        symptoms: existing?.source === 'manual' ? existing.symptoms : [],
        notes: existing?.source === 'manual' ? existing.notes : '',
        source: existing?.source === 'manual' ? 'manual' : 'calendar',
      } as CycleRecord;
    });

    await persistRecords([...remainingRecords, ...nextRangeRecords]);
    setEntryMessage('Plage de règles ajoutée depuis le calendrier.');
  }

  function initialize(initialRecords: CycleRecord[]) {
    setRecords(initialRecords);
  }

  function reset() {
    setRecords([]);
    setEntryForm(createEntryFormState());
    setEntryMessage('');
  }

  return {
    records,
    recordMap,
    entryForm,
    setEntryForm,
    entryMessage,
    setEntryMessage,
    persistRecords,
    updateEntryForm,
    toggleSymptom,
    syncEntryFormToDate,
    saveEntry,
    deleteEntry,
    togglePeriodDay,
    applyPeriodRange,
    initialize,
    reset,
  };
}
