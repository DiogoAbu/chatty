import { StatusBarStyle } from 'react-native';

import { DarkTheme, DefaultTheme, Theme as ThemePaper } from 'react-native-paper';

interface ThemeCustom {
  grid: number;
  gridSmaller: number;
  gridBigger: number;
  colors: {
    textOnPrimary: string;
    textOnAccent: string;
    statusBar: string;
    statusBarText: StatusBarStyle;
  };
}

// Used on react-navigation
interface ThemeNavigation {
  colors: {
    card: string;
    border: string;
  };
}

export type Theme = ThemePaper & ThemeNavigation & ThemeCustom;

const lightTheme: Theme = {
  ...DefaultTheme,
  grid: 8,
  get gridSmaller() {
    return this.grid / 2;
  },
  get gridBigger() {
    return this.grid * 2;
  },
  colors: {
    ...DefaultTheme.colors,

    background: '#f3f8ff',
    primary: '#7c80ee',
    accent: '#f46e6e',
    text: '#000',
    textOnPrimary: '#fff',
    textOnAccent: '#fff',

    statusBar: '#7c80ee',
    statusBarText: 'light-content',

    get card(): string {
      return this.background;
    },
    get border(): string {
      return this.background;
    },
  },
};

const darkTheme: Theme = {
  ...DarkTheme,
  grid: 8,
  get gridSmaller() {
    return this.grid / 2;
  },
  get gridBigger() {
    return this.grid * 2;
  },
  colors: {
    ...DarkTheme.colors,

    background: '#121212',
    primary: '#7c80ee',
    accent: '#f79393',
    text: '#dedede',
    textOnPrimary: '#dedede',
    textOnAccent: '#fff',

    statusBar: '#121212',
    statusBarText: 'light-content',

    get card(): string {
      return this.background;
    },
    get border(): string {
      return this.background;
    },
  },
};

export { lightTheme, darkTheme };
