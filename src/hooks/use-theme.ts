import { useTheme as useThemePaper } from 'react-native-paper';

import { Theme } from '!/services/theme';

export default function useTheme() {
  return useThemePaper() as Theme;
}
