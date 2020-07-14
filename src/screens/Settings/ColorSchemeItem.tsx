import React, { FC, useEffect } from 'react';
import { StatusBar } from 'react-native';

import { List, Menu, Text } from 'react-native-paper';
import { Observer } from 'mobx-react-lite';

import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { useStores } from '!/stores';
import getStatusBarColor from '!/utils/get-status-bar-color';

import styles from './styles';

const ColorSchemeItem: FC<unknown> = () => {
  const { themeStore } = useStores();
  const { colors, dark, mode } = useTheme();
  const { t } = useTranslation();

  const [colorSchemeMenuVisible, setColorSchemeMenuVisible] = React.useState(false);

  const handleOpenColorSchemeMenu = usePress(() => {
    requestAnimationFrame(() => {
      setColorSchemeMenuVisible(true);
    });
  });

  const handleCloseColorSchemeMenu = usePress(() => {
    requestAnimationFrame(() => {
      setColorSchemeMenuVisible(false);
    });
  });

  const handleSetColorSchemeAuto = usePress(() => {
    requestAnimationFrame(() => {
      handleCloseColorSchemeMenu();
      themeStore.setColorSchemePreferred('auto');
    });
  });
  const handleSetColorSchemeDark = usePress(() => {
    requestAnimationFrame(() => {
      handleCloseColorSchemeMenu();
      themeStore.setColorSchemePreferred('dark');
    });
  });
  const handleSetColorSchemeLight = usePress(() => {
    requestAnimationFrame(() => {
      handleCloseColorSchemeMenu();
      themeStore.setColorSchemePreferred('light');
    });
  });

  useEffect(() => {
    const elevation = 4;
    const bgColor = getStatusBarColor(elevation, colors, dark, mode);

    StatusBar.setHidden(false);
    StatusBar.setBackgroundColor(bgColor, true);
    StatusBar.setBarStyle(colors.statusBarText);
    StatusBar.setTranslucent(false);
  }, [colors, dark, mode]);

  return (
    <List.Item
      left={(props) => <List.Icon {...props} icon='lightbulb' style={[props.style, styles.noMarginRight]} />}
      onPress={handleOpenColorSchemeMenu}
      right={(props) => (
        <Observer>
          {() => (
            <Menu
              anchor={
                <Text {...props} style={[props.style, styles.rightText]}>
                  {t(`label.colorScheme.${themeStore.colorSchemePreferred}`)}
                  {themeStore.colorSchemePreferred === 'auto'
                    ? ` (${t(`label.colorScheme.${themeStore.colorSchemeCurrent}`)})`
                    : null}
                </Text>
              }
              onDismiss={handleCloseColorSchemeMenu}
              visible={colorSchemeMenuVisible}
            >
              <Menu.Item onPress={handleSetColorSchemeAuto} title={t('label.colorScheme.auto')} />
              <Menu.Item onPress={handleSetColorSchemeDark} title={t('label.colorScheme.dark')} />
              <Menu.Item onPress={handleSetColorSchemeLight} title={t('label.colorScheme.light')} />
            </Menu>
          )}
        </Observer>
      )}
      title={t('label.colorScheme')}
    />
  );
};

export default ColorSchemeItem;
