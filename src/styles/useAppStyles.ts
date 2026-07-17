import { darkStyles, lightStyles } from './appStyles';
import { dark, light } from './colors';
import { useTheme } from './ThemeContext';

export function useAppStyles() {
  const { scheme } = useTheme();
  return scheme === 'dark' ? darkStyles : lightStyles;
}

export function useColors() {
  const { scheme } = useTheme();
  return scheme === 'dark' ? dark : light;
}
