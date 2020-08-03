import React, { FC } from 'react';
import { StyleSheet, View } from 'react-native';

import { ActivityIndicator } from 'react-native-paper';

const Loading: FC<unknown> = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loading;
