import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { THEME_PREFERENCE_KEY } from '../lib/storage';

export type ThemeScheme = 'light' | 'dark';

type ThemeCtx = {
  scheme: ThemeScheme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeCtx>({
  scheme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [scheme, setScheme] = useState<ThemeScheme>(system === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    AsyncStorage.getItem(THEME_PREFERENCE_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'light') setScheme(saved);
    });
  }, []);

  function toggleTheme() {
    setScheme((current) => {
      const next: ThemeScheme = current === 'dark' ? 'light' : 'dark';
      void AsyncStorage.setItem(THEME_PREFERENCE_KEY, next);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ scheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
