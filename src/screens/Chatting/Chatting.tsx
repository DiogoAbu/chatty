import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, GestureResponderEvent, InteractionManager, StatusBar, View } from 'react-native';

import { Q } from '@nozbe/watermelondb';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import { useNavigation } from '@react-navigation/native';
import Bottleneck from 'bottleneck';

import { User } from '!/generated/graphql';
import useFocusEffect from '!/hooks/use-focus-effect';
import usePress from '!/hooks/use-press';
import useTranslation from '!/hooks/use-translation';
import MessageModel from '!/models/MessageModel';
import ReadReceiptModel from '!/models/ReadReceiptModel';
import { removeRoomsCascade, roomUpdater } from '!/models/RoomModel';
import { useStores } from '!/stores';
import { HeaderOptions, MainNavigationProp, Tables } from '!/types';
import capitalize from '!/utils/capitalize';
import getRoomMember from '!/utils/get-room-member';

import AttachmentPicker, { AttachmentPickerType } from './AttachmentPicker';
import MessageInput from './MessageInput';
import MessageList from './MessageList';
import { withMembers, WithMembersOutput, withRoom, WithRoomOutput } from './queries';
import styles from './styles';

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

const Chatting: FC<WithRoomOutput & WithMembersOutput> = ({ database, room, members }) => {
  const navigation = useNavigation<MainNavigationProp<'Chatting'>>();
  const { authStore, generalStore, syncStore } = useStores();
  const { t } = useTranslation();

  const [page, setPage] = useState(1);

  const shouldBlurRemoveRoom = useRef(true);
  const attachmentPickerRef = useRef<AttachmentPickerType | null>(null);
  const touchableIds = useRef<number[]>([]);

  // Get title
  let title = room.name;
  let subtitle: string | undefined;
  let pictureUri = room.pictureUri;

  if (!title) {
    const friend = getRoomMember(members, authStore.user.id);
    title = friend?.name || null;
    pictureUri = friend?.pictureUri || null;
  } else {
    const names = members
      .map((e) => (e.id !== authStore.user.id ? capitalize(e.name.split(' ')[0]) : null))
      .filter((e) => e);
    subtitle = `${capitalize(t('you'))}, ${names.join(', ')}`;
  }

  const handlePressBack = usePress(() => {
    if (attachmentPickerRef.current?.isShowing) {
      attachmentPickerRef.current.hide();
    } else {
      navigation.popToTop();
    }
  });

  const handlePressCenter = usePress(() => {
    requestAnimationFrame(() => {
      if (room.name) {
        navigation.navigate('CreateGroup', {
          id: room.id,
          name: room.name!,
          pictureUri: room.pictureUri!,
          createdAt: room.createdAt,
          members: members.map<User>((member) => ({
            id: member.id,
            name: member.name,
            pictureUri: member.pictureUri!,
            email: member.email,
            role: member.role!,
            publicKey: member.publicKey!,
            isFollowingMe: member.isFollowingMe!,
            isFollowedByMe: member.isFollowedByMe!,
          })),
        });
      } else {
        // navigation.navigate('');
      }
    });
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
      handlePressCenter,
    } as HeaderOptions);

    const markAsSeen = async () => {
      const messagesNotSeen = await room.messages
        .extend(
          Q.where('userId', Q.notEq(authStore.user.id)),
          Q.on(Tables.readReceipts, Q.where('seenAt', null)),
        )
        .fetch();

      const lastReadAt = Date.now();

      const wrapped = limiter.wrap(async (msg: MessageModel) => {
        if (msg.sender.id !== authStore.user.id) {
          return msg.prepareMarkAsSeen(authStore.user.id, lastReadAt);
        }
        return (null as unknown) as ReadReceiptModel;
      });
      const batch = await Promise.all(messagesNotSeen.map(wrapped));

      const roomUpdate = room.prepareUpdate(
        roomUpdater({
          lastReadAt,
          _raw: {
            _status: room._raw._status === 'synced' ? 'synced' : 'updated',
          },
        }),
      );

      await database.action(async () => {
        await database.batch(roomUpdate, ...batch);
      }, 'Chatting -> markAsSeen');

      if (messagesNotSeen.length > 0) {
        await syncStore.sync();
      }
    };
    void InteractionManager.runAfterInteractions(() => {
      void markAsSeen();
    });

    return () => {
      backHandler.remove();
      if (room.isLocalOnly && shouldBlurRemoveRoom.current) {
        void removeRoomsCascade(database, [room.id], authStore.user.id);
      }
    };
  }, [
    authStore.user.id,
    database,
    handlePressBack,
    handlePressCenter,
    navigation,
    room,
    subtitle,
    syncStore,
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
        page={page}
        room={room}
        setPage={setPage}
        title={title!}
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
