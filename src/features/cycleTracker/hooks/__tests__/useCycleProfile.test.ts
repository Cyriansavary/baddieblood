import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';

import { useCycleProfile } from '../useCycleProfile';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('../../../../lib/notifications', () => ({
  schedulePeriodReminder: jest.fn().mockResolvedValue('notif-xyz'),
  cancelNotification: jest.fn().mockResolvedValue(undefined),
  cancelAllNotifications: jest.fn().mockResolvedValue(undefined),
}));

const TODAY = '2026-06-15';
const noop = async () => {};

const VALID_CYCLE_FORM = {
  name: 'Alice',
  trackingMode: 'cycle' as const,
  cycleLength: '28',
  periodLength: '5',
  lastPeriodStart: '01/06/2026',
  lastPeriodEnd: '05/06/2026',
  addressingStyle: 'feminine' as const,
  pregnancyDueDate: '',
};

function makeProfile(overrides = {}) {
  return {
    name: 'Léa',
    trackingMode: 'cycle' as const,
    cycleLength: 28,
    periodLength: 5,
    lastPeriodStart: '2026-06-01',
    addressingStyle: 'feminine' as const,
    pregnancyDueDate: '',
    ...overrides,
  };
}

describe('useCycleProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('démarre avec un profil nul et un formulaire vide', () => {
    const { result } = renderHook(() => useCycleProfile());
    expect(result.current.profile).toBeNull();
    expect(result.current.profileForm.name).toBe('');
    expect(result.current.onboardingStep).toBe(0);
    expect(result.current.hasConfirmedLastPeriodReference).toBe(false);
  });

  it('initialize charge le profil et construit le formulaire', () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => { result.current.initialize(makeProfile(), true); });
    expect(result.current.profile?.name).toBe('Léa');
    expect(result.current.profileForm.name).toBe('Léa');
    expect(result.current.hasConfirmedLastPeriodReference).toBe(true);
  });

  it('initialize avec null ne plante pas', () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => { result.current.initialize(null, false); });
    expect(result.current.profile).toBeNull();
    expect(result.current.hasConfirmedLastPeriodReference).toBe(false);
  });

  it('sauvegarde un profil cycle valide', async () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => { result.current.updateProfileForm(VALID_CYCLE_FORM); });
    const persistRecords = jest.fn().mockResolvedValue(undefined);
    await act(async () => {
      await result.current.saveProfile(TODAY, [], persistRecords);
    });
    expect(result.current.profile?.name).toBe('Alice');
    expect(result.current.profile?.cycleLength).toBe(28);
    expect(result.current.profileMessage).toBe('Profil enregistré.');
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('refuse de sauvegarder sans prénom', async () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => { result.current.updateProfileForm({ ...VALID_CYCLE_FORM, name: '' }); });
    await act(async () => { await result.current.saveProfile(TODAY, [], noop); });
    expect(result.current.profile).toBeNull();
    expect(result.current.profileMessage).toBeTruthy();
  });

  it('refuse un cycleLength hors plage (trop court)', async () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => { result.current.updateProfileForm({ ...VALID_CYCLE_FORM, cycleLength: '10' }); });
    await act(async () => { await result.current.saveProfile(TODAY, [], noop); });
    expect(result.current.profile).toBeNull();
    expect(result.current.profileMessage).toBeTruthy();
  });

  it('refuse un cycleLength hors plage (trop long)', async () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => { result.current.updateProfileForm({ ...VALID_CYCLE_FORM, cycleLength: '50' }); });
    await act(async () => { await result.current.saveProfile(TODAY, [], noop); });
    expect(result.current.profile).toBeNull();
  });

  it('sauvegarde un profil grossesse valide', async () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => {
      result.current.updateProfileForm({
        name: 'Sophie',
        trackingMode: 'pregnancy',
        cycleLength: '28',
        periodLength: '5',
        lastPeriodStart: '',
        lastPeriodEnd: '',
        addressingStyle: 'feminine',
        pregnancyDueDate: '01/10/2026',
      });
    });
    await act(async () => { await result.current.saveProfile(TODAY, [], noop); });
    expect(result.current.profile?.trackingMode).toBe('pregnancy');
    expect(result.current.profileMessage).toBe('Profil enregistré.');
  });

  it('refuse un profil grossesse sans date prévue', async () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => {
      result.current.updateProfileForm({
        name: 'Sophie',
        trackingMode: 'pregnancy',
        cycleLength: '28',
        periodLength: '5',
        lastPeriodStart: '',
        lastPeriodEnd: '',
        addressingStyle: 'feminine',
        pregnancyDueDate: '',
      });
    });
    await act(async () => { await result.current.saveProfile(TODAY, [], noop); });
    expect(result.current.profile).toBeNull();
    expect(result.current.profileMessage).toBeTruthy();
  });

  it('saveLastPeriodReference sauvegarde une référence valide', async () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => { result.current.initialize(makeProfile({ lastPeriodStart: '' }), false); });
    act(() => {
      result.current.updateProfileForm({ lastPeriodStart: '01/06/2026', lastPeriodEnd: '05/06/2026' });
    });
    const persistRecords = jest.fn().mockResolvedValue(undefined);
    await act(async () => {
      await result.current.saveLastPeriodReference([], persistRecords);
    });
    expect(result.current.hasConfirmedLastPeriodReference).toBe(true);
    expect(persistRecords).toHaveBeenCalled();
  });

  it('saveLastPeriodReference refuse une date de début vide', async () => {
    const { result } = renderHook(() => useCycleProfile());
    await act(async () => {
      await result.current.saveLastPeriodReference([], noop);
    });
    expect(result.current.trackingSetupMessage).toBeTruthy();
    expect(result.current.hasConfirmedLastPeriodReference).toBe(false);
  });

  it('saveLastPeriodReference refuse une fin antérieure au début', async () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => {
      result.current.updateProfileForm({ lastPeriodStart: '10/06/2026', lastPeriodEnd: '05/06/2026' });
    });
    await act(async () => {
      await result.current.saveLastPeriodReference([], noop);
    });
    expect(result.current.trackingSetupMessage).toBeTruthy();
    expect(result.current.hasConfirmedLastPeriodReference).toBe(false);
  });

  it('reset vide tout l\'état', () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => { result.current.initialize(makeProfile(), true); });
    act(() => { result.current.reset(); });
    expect(result.current.profile).toBeNull();
    expect(result.current.profileForm.name).toBe('');
    expect(result.current.hasConfirmedLastPeriodReference).toBe(false);
    expect(result.current.profileMessage).toBe('');
    expect(result.current.onboardingStep).toBe(0);
  });

  it('goToNextOnboardingStep avance de 0 à 1', () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => { result.current.goToNextOnboardingStep(TODAY); });
    expect(result.current.onboardingStep).toBe(1);
  });

  it('goToNextOnboardingStep avance de 1 à 2 avec un prénom valide', () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => {
      result.current.updateProfileForm({ name: 'Alice', lastPeriodStart: '', lastPeriodEnd: '' });
    });
    act(() => { result.current.goToNextOnboardingStep(TODAY); }); // 0→1
    act(() => { result.current.goToNextOnboardingStep(TODAY); }); // 1→2
    expect(result.current.onboardingStep).toBe(2);
  });

  it('goToNextOnboardingStep bloque à l\'étape 1 sans prénom', () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => { result.current.goToNextOnboardingStep(TODAY); }); // 0→1
    act(() => { result.current.updateProfileForm({ name: '' }); });
    act(() => { result.current.goToNextOnboardingStep(TODAY); }); // stays at 1
    expect(result.current.onboardingStep).toBe(1);
    expect(result.current.profileMessage).toBeTruthy();
  });

  it('goToPreviousOnboardingStep revient en arrière', () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => { result.current.goToNextOnboardingStep(TODAY); }); // 0→1
    act(() => { result.current.goToPreviousOnboardingStep(); }); // 1→0
    expect(result.current.onboardingStep).toBe(0);
  });

  it('ne descend pas en dessous de l\'étape 0', () => {
    const { result } = renderHook(() => useCycleProfile());
    act(() => { result.current.goToPreviousOnboardingStep(); });
    expect(result.current.onboardingStep).toBe(0);
  });
});
