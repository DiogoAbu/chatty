import React, { FC } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Appbar } from 'react-native-paper';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StackHeaderProps } from '@react-navigation/stack';

import { useCollapsibleHeader } from '!/contexts/collapsible-header';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import { HeaderOptions } from '!/types';

const Header: FC<StackHeaderProps> = ({ navigation, scene, previous }) => {
  const insets = useSafeAreaInsets();
  const { colors, dark } = useTheme();
  const { translateY } = useCollapsibleHeader();

  const { descriptor, route } = scene;

  const options = descriptor.options as HeaderOptions;

  const title = options?.headerTitle || options?.title || route.name;
  const isHomeScreen = route.name === 'Home';

  const textColor = dark ? colors.text : colors.textOnPrimary;

  const handlePressBack = usePress(() => {
    requestAnimationFrame(() => {
      navigation.goBack();
    });
  });

  const headerStyle = [];
  if (isHomeScreen) {
    headerStyle.push(styles.headerNoElevation);
  }
  if (options.headerTransparent) {
    // headerStyle.push(styles.headerTranslucent);
    // headerStyle.push({ marginTop: insets.top || (StatusBar.currentHeight ?? 20) });
  }
  if (options.skipInset === true) {
    headerStyle.push({ marginTop: 0 });
  }

  return (
    <Animated.View style={{ backgroundColor: colors.primary, transform: [{ translateY }] }}>
      <Appbar.Header style={headerStyle}>
        {options.handlePressBack || previous ? (
          <Appbar.BackAction color={textColor} onPress={options.handlePressBack ?? handlePressBack} />
        ) : null}

        {options.headerLeft ? options?.headerLeft({ tintColor: textColor }) : null}

        {options.headerCenter ? (
          <TouchableOpacity
            disabled={!options.handlePressCenter}
            onPress={options.handlePressCenter}
            style={styles.centerContainer}
          >
            {options.headerCenter({ tintColor: textColor })}
          </TouchableOpacity>
        ) : (
          <Appbar.Content
            color={textColor}
            onPress={options.handlePressCenter}
            style={styles.content}
            subtitle={options.subtitle}
            title={title}
          />
        )}

        {options.headerRight ? options?.headerRight({ tintColor: textColor }) : null}
      </Appbar.Header>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  headerNoElevation: {
    elevation: 0,
  },
  headerTranslucent: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  centerContainer: {
    flex: 1,
    paddingHorizontal: 12,
  },

  content: {
    marginLeft: 0,
  },
});

export default Header;
