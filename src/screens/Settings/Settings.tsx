import React, { FC, useEffect, useState } from 'react';
import { ScrollView } from 'react-native';

import FastImage from 'react-native-fast-image';
import { Avatar, Divider, List } from 'react-native-paper';
import { Q } from '@nozbe/watermelondb';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import Bottleneck from 'bottleneck';

import useFocusEffect from '!/hooks/use-focus-effect';
import usePress from '!/hooks/use-press';
import RoomModel, { removeRoomsCascade } from '!/models/RoomModel';
import { useStores } from '!/stores';
import { MainNavigationProp, MainRouteProp, Tables } from '!/types';
import transformUri from '!/utils/transform-uri';

import ColorSchemeItem from './ColorSchemeItem';
import styles from './styles';

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

interface Props {
  navigation: MainNavigationProp<'Settings'>;
  route: MainRouteProp<'Settings'>;
}

const Settings: FC<Props> = ({ navigation, route }) => {
  const database = useDatabase();
  const { authStore, generalStore } = useStores();

  const [, setReload] = useState(false);

  const handleCreateProfile = usePress(() => {
    requestAnimationFrame(() => {
      navigation.navigate('CreateProfile', {
        isEditing: true,
      });
    });
  });

  useEffect(() => {
    generalStore.setFab();
  }, [generalStore]);

  useFocusEffect(() => {
    if (route.params?.reload) {
      setReload((prev) => !prev);
    }
  }, [route.params?.reload]);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} contentInsetAdjustmentBehavior='automatic'>
      <List.Item
        left={({ style }) => (
          <Avatar.Image
            ImageComponent={FastImage}
            size={60}
            source={{ uri: transformUri(authStore.user.pictureUri!, { width: 128 }) }}
            style={[style, styles.avatar]}
          />
        )}
        onPress={handleCreateProfile}
        style={styles.avatarContainer}
        title={authStore.user.name}
        titleStyle={styles.avatarTitle}
      />

      <Divider />

      <ColorSchemeItem />

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
                const allRooms = await roomTable.query(Q.where('isLocalOnly', true)).fetch();

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
