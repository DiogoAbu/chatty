import React, { FC, useCallback, useEffect, useState } from 'react';
import { ListRenderItemInfo, Platform } from 'react-native';

import { FlatList } from 'react-native-gesture-handler';
import { Appbar, Divider } from 'react-native-paper';
import { useDatabase } from '@nozbe/watermelondb/hooks';

import { User } from '!/generated/graphql';
import useFocusEffect from '!/hooks/use-focus-effect';
import usePress from '!/hooks/use-press';
import useTranslation from '!/hooks/use-translation';
import { createRoom } from '!/models/RoomModel';
import UserModel from '!/models/UserModel';
import { useStores } from '!/stores';
import { DeepPartial, MainNavigationProp, MainRouteProp, StackHeaderRightProps } from '!/types';

import DetailsForm from './DetailsForm';
import FriendItem from './FriendItem';
import styles from './styles';

interface Props {
  navigation: MainNavigationProp<'CreateGroup'>;
  route: MainRouteProp<'CreateGroup'>;
}

const handleKeyExtractor = (item: User) => item.id!;

const CreateGroup: FC<Props> = ({ navigation, route }) => {
  const database = useDatabase();
  const { authStore } = useStores();
  const { t } = useTranslation();

  const { members: initialMembers } = route.params;
  const [members, setMembers] = useState(initialMembers);

  const [roomName, setRoomName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const onChangeRoomName = useCallback((text: string) => {
    setErrorMessage('');
    setRoomName(text);
  }, []);

  const removeMember = useCallback((userId: string) => {
    setMembers((prev) => prev.filter((e) => e.id !== userId));
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<User>) => <FriendItem friend={item} removeMember={removeMember} />,
    [removeMember],
  );

  const handleCreateRoom = usePress<[], void>(async () => {
    const name = roomName.trim();
    if (!name) {
      setErrorMessage(t('error.invalid.roomName'));
      return;
    }

    const room = { name, isLocalOnly: false };
    const memberUsers: DeepPartial<UserModel>[] = members.map((friend) => ({
      id: friend.id,
      name: friend.name,
      pictureUri: friend.pictureUri,
      email: friend.email,
      role: friend.role,
      publicKey: friend.publicKey,
      isFollowingMe: friend.isFollowingMe,
      isFollowedByMe: friend.isFollowedByMe,
    }));
    const allMembers = [authStore.user, ...memberUsers];
    const roomId = await createRoom(database, authStore.user, room, allMembers);

    requestAnimationFrame(() => {
      // Make it so the first screen is Home and we're at the Chatting screen
      navigation.navigate('Chatting', { roomId });
    });
  }, 2000);

  useEffect(() => {
    if (members.length <= 0) {
      requestAnimationFrame(() => {
        navigation.goBack();
      });
      return;
    }
  }, [members, navigation]);

  useFocusEffect(() => {
    navigation.setOptions({
      headerRight: ({ tintColor }: StackHeaderRightProps) => (
        <Appbar.Action color={tintColor} icon='check-bold' onPress={handleCreateRoom} />
      ),
    });
  }, [handleCreateRoom, navigation]);

  return (
    <FlatList
      contentContainerStyle={styles.contentContainerStyle}
      contentInsetAdjustmentBehavior='automatic'
      data={members}
      initialNumToRender={10}
      ItemSeparatorComponent={Divider}
      keyboardShouldPersistTaps='handled'
      keyExtractor={handleKeyExtractor}
      ListHeaderComponent={
        <DetailsForm errorMessage={errorMessage} onChangeText={onChangeRoomName} value={roomName} />
      }
      maxToRenderPerBatch={2}
      removeClippedSubviews={Platform.OS === 'android'}
      renderItem={renderItem}
      updateCellsBatchingPeriod={100}
      windowSize={16}
    />
  );
};

export default CreateGroup;
