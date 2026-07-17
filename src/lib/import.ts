import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { CycleRecord, FlowLevel } from '../data/cycleData';

const FLOW_LEVELS: FlowLevel[] = ['Absent', 'Léger', 'Moyen', 'Abondant'];
const RECORD_SOURCES: NonNullable<CycleRecord['source']>[] = [
  'manual',
  'calendar',
  'inferred',
  'setup',
];

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim().length > 0));
}

function rowToRecord(headers: string[], values: string[]): CycleRecord | null {
  const get = (name: string) => {
    const index = headers.indexOf(name);
    return index === -1 ? '' : (values[index] ?? '');
  };

  const date = get('date').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

  const flowRaw = get('flux').trim();
  const flow = (FLOW_LEVELS as string[]).includes(flowRaw) ? (flowRaw as FlowLevel) : 'Absent';

  const pain = Number.parseFloat(get('douleur'));
  const sleepHours = Number.parseFloat(get('sommeil_h'));
  const symptoms = get('symptomes')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  const sourceRaw = get('source').trim();
  const source = (RECORD_SOURCES as string[]).includes(sourceRaw)
    ? (sourceRaw as CycleRecord['source'])
    : 'manual';

  return {
    date,
    flow,
    pain: Number.isFinite(pain) ? pain : 0,
    mood: get('humeur').trim(),
    sleepHours: Number.isFinite(sleepHours) ? sleepHours : 0,
    symptoms,
    notes: get('notes').trim(),
    source,
  };
}

export type ImportResult = {
  records: CycleRecord[];
  importedCount: number;
  skippedCount: number;
};

export async function pickAndParseCsv(): Promise<ImportResult | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ['text/csv', 'text/comma-separated-values', 'text/plain'],
    copyToCacheDirectory: true,
  });

  if (picked.canceled || !picked.assets?.[0]) return null;

  const content = await FileSystem.readAsStringAsync(picked.assets[0].uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const rows = parseCsv(content);
  if (rows.length < 2) {
    return { records: [], importedCount: 0, skippedCount: 0 };
  }

  const headers = rows[0].map((h) => h.trim());
  const records: CycleRecord[] = [];
  let skippedCount = 0;

  for (const values of rows.slice(1)) {
    const record = rowToRecord(headers, values);
    if (record) {
      records.push(record);
    } else {
      skippedCount += 1;
    }
  }

  return { records, importedCount: records.length, skippedCount };
}
