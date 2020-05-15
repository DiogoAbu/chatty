import React, { FC } from 'react';

import useFocusEffect from '!/hooks/use-focus-effect';
import { useStores } from '!/stores';
import { MainNavigationProp } from '!/types';

import RoomList from './RoomList';

interface Props {
  navigation: MainNavigationProp<'ChatsArchived'>;
}

const ChatsArchived: FC<Props> = () => {
  const { authStore, generalStore } = useStores();

  useFocusEffect(() => {
    generalStore.setFab('');
  }, [generalStore]);

  return <RoomList archivedOnly user={authStore.user} />;
};

export default ChatsArchived;
