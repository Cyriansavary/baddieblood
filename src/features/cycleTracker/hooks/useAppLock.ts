import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';

import { APP_LOCK_ENABLED_STORAGE_KEY } from '../../../lib/storage';

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

async function getLocalAuthentication() {
  if (!isMobile) return null;
  return import('expo-local-authentication');
}

export function useAppLock() {
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const [isLockSupported, setIsLockSupported] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    async function init() {
      const [stored, LocalAuthentication] = await Promise.all([
        AsyncStorage.getItem(APP_LOCK_ENABLED_STORAGE_KEY),
        getLocalAuthentication(),
      ]);
      const enabled = stored === 'true';

      let supported = false;
      if (LocalAuthentication) {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        supported = hasHardware && isEnrolled;
      }

      setIsLockSupported(supported);
      const effectivelyEnabled = enabled && supported;
      setIsLockEnabled(effectivelyEnabled);
      setIsLocked(effectivelyEnabled);
    }
    void init();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const wasActive = appState.current === 'active';
      const goingToBackground = nextState === 'background' || nextState === 'inactive';
      if (wasActive && goingToBackground && isLockEnabled) {
        setIsLocked(true);
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [isLockEnabled]);

  const authenticate = useCallback(async (): Promise<boolean> => {
    const LocalAuthentication = await getLocalAuthentication();
    if (!LocalAuthentication) {
      setIsLocked(false);
      return true;
    }
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Déverrouille BaddieBlood',
        cancelLabel: 'Annuler',
      });
      if (result.success) {
        setIsLocked(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const setLockEnabled = useCallback(async (enabled: boolean) => {
    setIsLockEnabled(enabled);
    await AsyncStorage.setItem(APP_LOCK_ENABLED_STORAGE_KEY, enabled ? 'true' : 'false');
  }, []);

  return {
    isLockEnabled,
    isLockSupported,
    isLocked,
    authenticate,
    setLockEnabled,
  };
}
