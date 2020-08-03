import React, { FC, memo } from 'react';
import { StyleSheet } from 'react-native';

import { FAB as FabPaper } from 'react-native-paper';
import { useObserver } from 'mobx-react-lite';

import useTheme from '!/hooks/use-theme';
import { useStores } from '!/stores';

const Fab: FC<unknown> = () => {
  const { generalStore } = useStores();
  const { colors } = useTheme();

  return useObserver(() => {
    const fabStyle = { ...generalStore.fabStyle };

    return (
      <FabPaper
        color={colors.textOnPrimary}
        icon={generalStore.fabIcon || 'message-text'}
        onPress={generalStore.handleFabPress}
        style={[styles.fab, fabStyle]}
        theme={{ colors: { accent: colors.primary } }}
        visible={!!generalStore.fabIcon}
      />
    );
  });
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
  },
});

export default memo(Fab);
