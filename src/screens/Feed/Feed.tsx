import React, { FC } from 'react';

import { FAB as FabPaper, Text } from 'react-native-paper';

import useFocusEffect from '!/hooks/use-focus-effect';
import useTheme from '!/hooks/use-theme';
import { useStores } from '!/stores';
import { HomeTabNavigationProp } from '!/types';

import styles from './styles';

interface Props {
  navigation: HomeTabNavigationProp<'Feed'>;
}

const Feed: FC<Props> = () => {
  const { generalStore } = useStores();
  const { colors } = useTheme();

  useFocusEffect(() => {
    generalStore.setFab('camera');
  }, [generalStore]);

  return (
    <>
      <FabPaper
        color={colors.textOnPrimary}
        icon='pencil'
        small
        style={styles.fabUpper}
        theme={{ colors: { accent: colors.primary } }}
      />
      <Text style={styles.container}>Feed</Text>
    </>
  );
};

export default Feed;
