import React, { FC, useEffect } from 'react';
import { ScrollView } from 'react-native';

import FastImage from 'react-native-fast-image';
import { Avatar, Divider, List } from 'react-native-paper';
import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import Bottleneck from 'bottleneck';
import { Observer } from 'mobx-react-lite';

import usePress from '!/hooks/use-press';
import RoomModel, { removeRoomsCascade } from '!/models/RoomModel';
import { useStores } from '!/stores';
import { Tables } from '!/types';

import styles from './styles';

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

type Props = any;

const Settings: FC<Props> = () => {
  const database = useDatabase();
  const { authStore, generalStore, themeStore } = useStores();

  useEffect(() => {
    generalStore.setFab();
  }, [generalStore]);

  const handleToggleDarkMode = usePress(() => {
    requestAnimationFrame(() => {
      themeStore.toggleDarkMode();
    });
  });

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} contentInsetAdjustmentBehavior='automatic'>
      <List.Item
        left={({ style }) => (
          <Avatar.Image
            ImageComponent={FastImage}
            size={60}
            source={{ uri: authStore.user.pictureUri! }}
            style={[style, styles.avatar]}
          />
        )}
        style={styles.avatarContainer}
        title={authStore.user.name}
        titleStyle={styles.avatarTitle}
      />

      <Divider />

      <List.Item
        left={(props) => (
          <Observer>
            {() => (
              <List.Icon
                {...props}
                icon={themeStore.isDarkMode ? 'lightbulb-off' : 'lightbulb'}
                style={[props.style, styles.noMarginRight]}
              />
            )}
          </Observer>
        )}
        onPress={handleToggleDarkMode}
        title='Toggle dark mode'
      />

      <Divider />

      {__DEV__ ? (
        <>
          <List.Item
            left={(props) => (
              <List.Icon {...props} icon='delete' style={[props.style, styles.noMarginRight]} />
            )}
            onPress={() => {
              void (async () => {
                const roomTable = database.collections.get<RoomModel>(Tables.rooms);
                const allRooms = await roomTable.query(Q.where('is_local_only', true)).fetch();

                const wrapped = limiter.wrap(async (each: RoomModel) => {
                  return removeRoomsCascade(database, [each.id], authStore.user.id);
                });

                return Promise.all(allRooms.map(wrapped));
              })();
            }}
            title='Remove local rooms cascade'
          />

          <Divider />

          <List.Item
            left={(props) => (
              <List.Icon {...props} icon='delete' style={[props.style, styles.noMarginRight]} />
            )}
            onPress={() => {
              void (async () => {
                const roomTable = database.collections.get<RoomModel>(Tables.rooms);
                const allRooms = await roomTable.query().fetch();

                const wrapped = limiter.wrap(async (each: RoomModel) => {
                  return removeRoomsCascade(database, [each.id], authStore.user.id);
                });

                return Promise.all(allRooms.map(wrapped));
              })();
            }}
            title='Remove all rooms cascade'
          />
        </>
      ) : null}
    </ScrollView>
  );
};

export default Settings;
