import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { CycleProfile, CycleRecord } from '../data/cycleData';

function escapeCsv(value: string | number): string {
  const str = String(value);
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str;
}

function recordsToCsv(records: CycleRecord[]): string {
  const headers = ['date', 'flux', 'douleur', 'humeur', 'sommeil_h', 'symptomes', 'notes', 'source'];
  const rows = records.map((r) =>
    [
      r.date,
      r.flow,
      r.pain,
      r.mood,
      r.sleepHours,
      (r.symptoms ?? []).join(';'),
      r.notes,
      r.source ?? '',
    ]
      .map(escapeCsv)
      .join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

export async function exportCycleData(
  records: CycleRecord[],
  _profile: CycleProfile | null
): Promise<void> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) return;

  const csv = recordsToCsv(records);
  const fileName = `baddieblood_${new Date().toISOString().slice(0, 10)}.csv`;
  const path = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(path, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(path, {
    mimeType: 'text/csv',
    dialogTitle: 'Exporter mes données cycle',
  });
}
