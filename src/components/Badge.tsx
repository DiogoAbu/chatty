import React, { FC } from 'react';
import { StyleSheet, TextProps } from 'react-native';

import { Badge as BadgePaper } from 'react-native-paper';

import useTheme from '!/hooks/use-theme';

type Props = TextProps & {
  visible: boolean;
  size?: number;
  children: string | number | undefined;
};

const Badge: FC<Props> = ({ children, visible, style, ...rest }) => {
  const { colors } = useTheme();

  return (
    <BadgePaper
      visible={visible}
      {...rest}
      style={[styles.badge, { backgroundColor: colors.accent, color: colors.textOnAccent }, style]}
    >
      {children}
    </BadgePaper>
  );
};

const styles = StyleSheet.create({
  badge: {
    lineHeight: 16,
  },
});

export default Badge;
