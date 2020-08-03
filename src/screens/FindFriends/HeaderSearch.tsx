import React, { FC } from 'react';
import { StyleProp, StyleSheet, TextStyle, View, ViewStyle } from 'react-native';

import { Appbar, Badge, Searchbar } from 'react-native-paper';
import { StackHeaderProps } from '@react-navigation/stack';

import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';

interface Props extends StackHeaderProps {
  value: string;
  onChangeText: (text: string) => void;
  badge?: number;
  onGroupIconPress?: () => any;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

const HeaderSearch: FC<Props> = ({
  navigation,
  value,
  badge,
  onGroupIconPress,
  style,
  inputStyle,
  ...rest
}) => {
  const { dark, colors } = useTheme();
  const { t } = useTranslation();

  const textColor = dark ? colors.text : colors.textOnPrimary;

  const handleGoBack = usePress(() => {
    requestAnimationFrame(() => {
      navigation.goBack();
    });
  });

  return (
    <Appbar.Header>
      <Searchbar
        icon='arrow-left'
        inputStyle={[styles.input, inputStyle]}
        onIconPress={handleGoBack}
        placeholder={t('headerSearch.placeholder')}
        style={[styles.searchbar, style]}
        value={value}
        {...rest}
      />
      <View style={styles.iconContainer}>
        <Appbar.Action color={textColor} icon='account-group' onPress={onGroupIconPress} />
        <Badge
          style={[styles.badge, { backgroundColor: colors.accent, color: colors.textOnAccent }]}
          visible={!!badge}
        >
          {badge}
        </Badge>
      </View>
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  searchbar: {
    elevation: 0,
    flex: 1,
  },
  input: {
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    lineHeight: 16,
  },
});

export default HeaderSearch;
