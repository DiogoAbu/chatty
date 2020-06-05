import React, { FC } from 'react';
import { View } from 'react-native';

import { Text } from 'react-native-paper';

import useTheme from '!/hooks/use-theme';
import { MainNavigationProp } from '!/types';

import styles from './styles';

interface Props {
  navigation: MainNavigationProp<'__name__'>;
}

const __name__: FC<Props> = () => {
  const { colors } = useTheme();

  return (
    <View style={[{ backgroundColor: colors.background }, styles.container]}>
      <Text>__name__</Text>
    </View>
  );
};

export default __name__;
