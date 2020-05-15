import React, { FC } from 'react';

import useFocusEffect from '!/hooks/use-focus-effect';
import usePress from '!/hooks/use-press';
import { useStores } from '!/stores';
import { HomeTabNavigationProp } from '!/types';

import RoomList from './RoomList';

interface Props {
  navigation: HomeTabNavigationProp<'Chats'>;
}

const Chats: FC<Props> = ({ navigation }) => {
  const { authStore, generalStore } = useStores();

  const handleFabPress = usePress(() => {
    requestAnimationFrame(() => {
      navigation.navigate('FindFriends');
    });
  });

  useFocusEffect(() => {
    generalStore.setFab('message-text', handleFabPress);
  }, [generalStore, handleFabPress]);

  return <RoomList user={authStore.user} />;
};

export default Chats;
