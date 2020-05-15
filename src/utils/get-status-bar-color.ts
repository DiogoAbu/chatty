import { overlay } from 'react-native-paper';

import { Theme } from '!/services/theme';

export default function getStatusBarColor(
  elevation = 4,
  colors: Theme['colors'],
  dark: Theme['dark'],
  mode?: Theme['mode'],
): string {
  if (dark && mode === 'adaptive') {
    return overlay(elevation, colors.surface) as string;
  }
  return colors.statusBar;
}
