import { useTheme as useThemePaper } from 'react-native-paper';

import { Theme } from '!/services/theme';

export default function useTheme(): Theme {
  return useThemePaper() as Theme;
}
