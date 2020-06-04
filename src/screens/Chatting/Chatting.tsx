import React, { FC, useCallback, useEffect, useRef } from 'react';
import { BackHandler, GestureResponderEvent, StatusBar, View } from 'react-native';

import { Appbar } from 'react-native-paper';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { ExtractedObservables } from '@nozbe/with-observables';
import { useNavigation } from '@react-navigation/native';

import useFocusEffect from '!/hooks/use-focus-effect';
import usePress from '!/hooks/use-press';
import useTranslation from '!/hooks/use-translation';
import RoomModel, { removeRoomsCascade, roomUpdater } from '!/models/RoomModel';
import { useStores } from '!/stores';
import { DeepPartial, HeaderOptions, MainNavigationProp, StackHeaderRightProps } from '!/types';
import capitalize from '!/utils/capitalize';
import getRoomMember from '!/utils/get-room-member';

import AttachmentPicker, { AttachmentPickerType } from './AttachmentPicker';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import { withMembers, WithMembersOutput, withRoom, WithRoomOutput } from './queries';
import styles from './styles';

type Props = ExtractedObservables<WithRoomOutput & WithMembersOutput>;

const Chatting: FC<Props> = ({ room, members }) => {
  const database = useDatabase();
  const navigation = useNavigation<MainNavigationProp<'Chatting'>>();
  const { authStore, generalStore } = useStores();
  const { t } = useTranslation();

  const shouldBlurRemoveRoom = useRef(true);
  const attachmentPickerRef = useRef<AttachmentPickerType | null>(null);
  const touchableIds = useRef<number[]>([]);

  // Get title
  let title = room.name;
  let subtitle: string | undefined;
  let pictureUri = room.pictureUri;

  let friendId: string | undefined;

  if (!title && members) {
    const friend = getRoomMember(members, authStore.user.id);
    title = friend?.name || null;
    pictureUri = friend?.pictureUri || null;
    friendId = friend?.id;
  } else {
    subtitle = members
      .map((e) => capitalize(e.id === authStore.user.id ? t('you') : e.name.split(' ')[0]))
      .join(', ');
  }

  const handleAddMessage = usePress(() => {
    const userId = friendId || members[Math.floor(Math.random() * members.length)].id;

    if (userId) {
      void room.addMessage({ content: "Friend's response", senderId: userId });
    }
  });

  const handlePressBack = usePress(() => {
    if (attachmentPickerRef.current?.isShowing) {
      attachmentPickerRef.current.hide();
    } else {
      navigation.popToTop();
    }
  });

  const handleTappingOutside = useCallback((event: GestureResponderEvent) => {
    event.persist();

    if (!touchableIds.current?.includes(event.target)) {
      attachmentPickerRef.current?.hide();
    }

    // Should return true
    return true;
  }, []);

  const handleSetTouchableIds = useCallback((ids: number[]) => {
    touchableIds.current = ids;
  }, []);

  const updateReadTime = usePress(
    () => {
      const name = 'Chatting -> updateReadTime';
      const changes: DeepPartial<RoomModel> = {
        ...room,
        lastReadAt: Date.now(),
      };

      void database.action(async () => {
        await room.update(roomUpdater(changes));
      }, name);
    },
    350,
    { leading: false, trailing: true },
  );

  // Remove room on blur if it's local only
  useFocusEffect(() => {
    shouldBlurRemoveRoom.current = true;

    StatusBar.setHidden(false);
    StatusBar.setTranslucent(false);

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handlePressBack();
      return true;
    });

    navigation.setOptions({
      title,
      subtitle,
      handlePressBack,
      headerRight: ({ tintColor }: StackHeaderRightProps) => (
        <Appbar.Action color={tintColor} icon='message-text' onPress={handleAddMessage} />
      ),
    } as HeaderOptions);

    return () => {
      backHandler.remove();
      if (room.isLocalOnly && shouldBlurRemoveRoom.current) {
        void removeRoomsCascade(database, [room.id], authStore.user.id);
      }
    };
  }, [
    authStore.user.id,
    database,
    handleAddMessage,
    handlePressBack,
    navigation,
    room.id,
    room.isLocalOnly,
    subtitle,
    title,
  ]);

  // Hide FAB
  useEffect(() => {
    generalStore.setFab();
  }, [generalStore]);

  return (
    <View onStartShouldSetResponder={handleTappingOutside} style={styles.container}>
      <MessageList
        attachmentPickerRef={attachmentPickerRef}
        room={room}
        title={title!}
        updateReadTime={updateReadTime}
      />

      <MessageInput
        attachmentPickerRef={attachmentPickerRef}
        pictureUri={pictureUri!}
        room={room}
        shouldBlurRemoveRoom={shouldBlurRemoveRoom}
        title={title!}
      />

      <AttachmentPicker handleSetTouchableIds={handleSetTouchableIds} ref={attachmentPickerRef} />
    </View>
  );
};

export default withDatabase(withRoom(withMembers(Chatting)));
