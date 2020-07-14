import React, { FC } from 'react';
import { View } from 'react-native';

import { Text } from 'react-native-paper';

import useTheme from '!/hooks/use-theme';
import { MainNavigationProp, MainRouteProp } from '!/types';

import styles from './styles';

interface Props {
  navigation: MainNavigationProp<'__name__'>;
  route: MainRouteProp<'__name__'>;
}

const __name__: FC<Props> = ({ navigation, route }) => {
  const { colors } = useTheme();

  return (
    <View style={[{ backgroundColor: colors.background }, styles.container]}>
      <Text>__name__</Text>
    </View>
  );
};

export default __name__;
