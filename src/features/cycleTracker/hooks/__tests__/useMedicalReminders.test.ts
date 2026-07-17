import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';

import { useMedicalReminders } from '../useMedicalReminders';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../../../../lib/notifications', () => ({
  scheduleAppointmentReminder: jest.fn().mockResolvedValue('notif-123'),
  cancelNotification: jest.fn().mockResolvedValue(undefined),
  cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
}));

const BASE_FORM = {
  category: 'gynecologist' as const,
  customTitle: '',
  appointmentDate: '01/06/2026',
  reminderDate: '30/05/2026',
  notes: 'Bilan annuel',
};

describe('useMedicalReminders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('démarre avec une liste vide', () => {
    const { result } = renderHook(() => useMedicalReminders());
    expect(result.current.medicalReminders).toHaveLength(0);
    expect(result.current.sortedMedicalReminders).toHaveLength(0);
  });

  it('initialise les reminders depuis la persistance', () => {
    const { result } = renderHook(() => useMedicalReminders());
    const existing = [
      {
        id: 'abc',
        category: 'gynecologist' as const,
        title: 'Gynéco',
        appointmentDate: '2026-06-01',
        reminderDate: '2026-05-30',
        notes: '',
        createdAt: new Date().toISOString(),
        completed: false,
      },
    ];
    act(() => { result.current.initialize(existing); });
    expect(result.current.medicalReminders).toHaveLength(1);
  });

  it('sauvegarde un rendez-vous valide', async () => {
    const { result } = renderHook(() => useMedicalReminders());

    act(() => {
      result.current.updateMedicalReminderForm(BASE_FORM);
    });

    await act(async () => {
      await result.current.saveMedicalReminder();
    });

    expect(result.current.medicalReminders).toHaveLength(1);
    expect(result.current.medicalReminders[0].title).toBe('Rendez-vous gynécologue');
    expect(result.current.medicalReminderMessage).toBe('Rendez-vous enregistré.');
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('refuse de sauvegarder sans titre', async () => {
    const { result } = renderHook(() => useMedicalReminders());

    act(() => {
      result.current.updateMedicalReminderForm({ ...BASE_FORM, category: 'other', customTitle: '' });
    });

    await act(async () => {
      await result.current.saveMedicalReminder();
    });

    expect(result.current.medicalReminders).toHaveLength(0);
    expect(result.current.medicalReminderMessage).toBeTruthy();
  });

  it('supprime un reminder existant', async () => {
    const { result } = renderHook(() => useMedicalReminders());
    const reminder = {
      id: 'del-1',
      category: 'gynecologist' as const,
      title: 'Test',
      appointmentDate: '',
      reminderDate: '',
      notes: '',
      createdAt: new Date().toISOString(),
      completed: false,
    };

    act(() => { result.current.initialize([reminder]); });
    expect(result.current.medicalReminders).toHaveLength(1);

    await act(async () => {
      await result.current.deleteMedicalReminder('del-1');
    });

    expect(result.current.medicalReminders).toHaveLength(0);
  });

  it('bascule le statut complété', async () => {
    const { result } = renderHook(() => useMedicalReminders());
    const reminder = {
      id: 'tog-1',
      category: 'gynecologist' as const,
      title: 'Test',
      appointmentDate: '',
      reminderDate: '',
      notes: '',
      createdAt: new Date().toISOString(),
      completed: false,
    };

    act(() => { result.current.initialize([reminder]); });
    expect(result.current.medicalReminders[0].completed).toBe(false);

    await act(async () => {
      await result.current.toggleMedicalReminderCompleted('tog-1');
    });

    expect(result.current.medicalReminders[0].completed).toBe(true);

    await act(async () => {
      await result.current.toggleMedicalReminderCompleted('tog-1');
    });

    expect(result.current.medicalReminders[0].completed).toBe(false);
  });

  it('trie les reminders par date de rappel ascendante', () => {
    const { result } = renderHook(() => useMedicalReminders());
    act(() => {
      result.current.initialize([
        { id: 'b', category: 'gynecologist', title: 'B', appointmentDate: '', reminderDate: '2026-06-10', notes: '', createdAt: '2026-01-01T00:00:00Z', completed: false },
        { id: 'a', category: 'gynecologist', title: 'A', appointmentDate: '', reminderDate: '2026-05-01', notes: '', createdAt: '2026-01-01T00:00:00Z', completed: false },
      ]);
    });
    expect(result.current.sortedMedicalReminders[0].id).toBe('a');
    expect(result.current.sortedMedicalReminders[1].id).toBe('b');
  });

  it('reset vide tout l\'état', () => {
    const { result } = renderHook(() => useMedicalReminders());
    act(() => {
      result.current.initialize([
        { id: 'x', category: 'gynecologist', title: 'X', appointmentDate: '', reminderDate: '', notes: '', createdAt: '', completed: false },
      ]);
    });
    act(() => { result.current.reset(); });
    expect(result.current.medicalReminders).toHaveLength(0);
    expect(result.current.medicalReminderMessage).toBe('');
  });
});
