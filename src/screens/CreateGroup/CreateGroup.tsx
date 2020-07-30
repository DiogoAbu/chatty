import React, { FC, useCallback, useEffect, useState } from 'react';
import { Alert, InteractionManager, ListRenderItemInfo, Platform } from 'react-native';

import { FlatList } from 'react-native-gesture-handler';
import { Appbar, Divider } from 'react-native-paper';
import { useDatabase } from '@nozbe/watermelondb/hooks';

import { ROOM_NAME_MAX_LENGTH } from '!/config';
import { User } from '!/generated/graphql';
import useFocusEffect from '!/hooks/use-focus-effect';
import useInput from '!/hooks/use-input';
import useMethod from '!/hooks/use-method';
import usePress from '!/hooks/use-press';
import useTranslation from '!/hooks/use-translation';
import { createRoom } from '!/models/RoomModel';
import UserModel from '!/models/UserModel';
import { generateSharedKeyAndMessages } from '!/services/encryption';
import { uploadMedia } from '!/services/remote-media';
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
  const { authStore, syncStore } = useStores();
  const { t } = useTranslation();

  const { params } = route;

  const roomNameInput = useInput(params.name ?? '', () => setErrorMessage(''));
  const [errorMessage, setErrorMessage] = useState('');

  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [pictureUri, setPictureUri] = useState('');

  const [members, setMembers] = useState(params.members);

  const removeMember = useMethod((userId: string) => {
    if (isUploadingPic) {
      return;
    }
    setMembers((prev) => prev.filter((e) => e.id !== userId));
  });

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<User>) => (
      <FriendItem friend={item} isEditing={!!params.id} removeMember={removeMember} />
    ),
    [params.id, removeMember],
  );

  const handleCreateRoom = usePress<[], void>(async () => {
    try {
      const name = roomNameInput.value.trim();
      if (!name || name.length > ROOM_NAME_MAX_LENGTH) {
        setErrorMessage(t('error.invalid.roomName'));
        return;
      }

      setIsUploadingPic(true);

      let remoteUri: string | undefined;

      const pictureUriToUpload = params?.picturesTaken?.[0].localUri ?? pictureUri;
      if (pictureUriToUpload) {
        const res = await uploadMedia(pictureUriToUpload);
        remoteUri = res.secure_url;
      }

      const room = {
        id: params.id,
        name,
        pictureUri: remoteUri,
        isLocalOnly: false,
      };

      const allMembers: DeepPartial<UserModel>[] = members.map((member) => ({
        id: member.id,
        name: member.name,
        pictureUri: member.pictureUri,
        email: member.email,
        role: member.role,
        publicKey: member.publicKey,
        isFollowingMe: member.isFollowingMe,
        isFollowedByMe: member.isFollowedByMe,
      }));

      if (!allMembers.find((e) => e.id === authStore.user.id)) {
        allMembers.push(authStore.user);
      }

      const roomCreated = await createRoom(database, authStore.user, room, allMembers);

      if (!roomCreated.sharedKey) {
        const sharedKey = await generateSharedKeyAndMessages(
          database,
          roomCreated,
          allMembers,
          authStore.user.id,
        );

        if (!sharedKey) {
          Alert.alert(t('title.oops'), t('alert.groupCreationFailed'));
        }
      }

      // Wait only if it`s setting up the profile for the first time
      if (!params.id) {
        void syncStore.sync();
      } else {
        await syncStore.sync();
      }

      void InteractionManager.runAfterInteractions(() => {
        navigation.navigate('Chatting', { roomId: roomCreated.id });
      });
    } catch (err) {
      console.log(err);
      Alert.alert(t('title.oops'), t('alert.groupCreationFailed'));
      setIsUploadingPic(false);
    }
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
      title: params.name ?? undefined,
      headerRight: ({ tintColor }: StackHeaderRightProps) => (
        <Appbar.Action
          color={tintColor}
          disabled={isUploadingPic}
          icon='check-bold'
          onPress={handleCreateRoom}
        />
      ),
    });
  }, [handleCreateRoom, isUploadingPic, navigation, params.name]);

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
        <DetailsForm
          errorMessage={errorMessage}
          isUploadingPic={isUploadingPic}
          pictureUri={pictureUri}
          setPictureUri={setPictureUri}
          {...roomNameInput}
        />
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
