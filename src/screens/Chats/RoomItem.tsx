import React, { FC, useCallback } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

import { Avatar, Badge, Caption, Chip, Colors, List, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SharedElement } from 'react-navigation-shared-element';
import { ExtractedObservables } from '@nozbe/with-observables';
import { useNavigation } from '@react-navigation/native';

import FadeIcon from '!/components/FadeIcon';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { AttachmentTypes } from '!/models/AttachmentModel';
import { useStores } from '!/stores';
import { HomeTabNavigationProp, ListItemSideProps } from '!/types';
import getRoomMember from '!/utils/get-room-member';
import getSentAt from '!/utils/get-sent-at';

import MessageMark from '../../components/MessageMark';

import { withRoom, WithRoomOutput } from './queries';
import styles from './styles';

interface PropsExtra {
  isSelecting: boolean;
  toggleSelected: (userId: string) => void;
  getSelected: (userId: string) => boolean;
}

type Props = ExtractedObservables<WithRoomOutput & PropsExtra>;

const RoomItem: FC<Props> = ({
  room,
  members,
  newMessagesCount,
  lastMessage,
  lastMessageSender,
  lastMessageAttachments,
  isSelecting,
  toggleSelected,
  getSelected,
}) => {
  const navigation = useNavigation<HomeTabNavigationProp<'Chats'>>();
  const { authStore } = useStores();
  const { grid, colors } = useTheme();
  const { t } = useTranslation();

  const sentAt = getSentAt(lastMessage?.localCreatedAt || room.lastChangeAt);
  const lastMessagenNotRead =
    !lastMessage || !room?.lastReadAt
      ? false
      : new Date(lastMessage.localCreatedAt).getTime() > new Date(room.lastReadAt).getTime();

  const lastByMe = lastMessageSender?.id === authStore.user.id;

  let title = room.name;
  let picture = room.picture || undefined;
  let friendId: string | undefined;

  if (!title) {
    const friend = getRoomMember(members, authStore.user.id);
    title = friend?.name || null;
    picture = friend?.picture;
    friendId = friend?.id;
  }

  const handleStartChatting = usePress(() => {
    requestAnimationFrame(() => {
      navigation.navigate('Chatting', { roomId: room.id });
    });
  });

  const handleToggleSelect = usePress(() => {
    requestAnimationFrame(() => {
      toggleSelected(room.id);
    });
  });

  const handleZoomPicture = usePress(() => {
    requestAnimationFrame(() => {
      navigation.navigate('RoomInfoModal', {
        roomTitle: title!,
        roomPicture: picture!,
        friendId: friendId!,
        roomId: room.id,
      });
    });
  });

  const renderAttachmentIcon = useCallback(
    () =>
      lastMessageAttachments?.some((e) => e.type === AttachmentTypes.image) ? (
        <Icon
          name={lastMessageAttachments.length > 1 ? 'image-album' : 'image'}
          style={[styles.lastMessageAttachmentIcon, { color: colors.accent }]}
        />
      ) : lastMessageAttachments?.some((e) => e.type === AttachmentTypes.video) ? (
        <Icon name='video' style={[styles.lastMessageAttachmentIcon, { color: colors.accent }]} />
      ) : lastMessageAttachments?.some((e) => e.type === AttachmentTypes.document) ? (
        <Icon
          name='paperclip'
          style={[styles.lastMessageAttachmentIcon, { color: colors.accent }]}
        />
      ) : null,
    [colors.accent, lastMessageAttachments],
  );

  const renderContent = useCallback(
    ({ color, fontSize }: { color: string; fontSize: number }) =>
      lastMessage ? (
        <View style={styles.itemContentContainer}>
          {lastByMe ? <MessageMark color={color} fontSize={16} message={lastMessage} /> : null}
          {renderAttachmentIcon()}
          {lastMessage.content ? (
            <Text
              ellipsizeMode='tail'
              numberOfLines={1}
              style={[styles.messageContent, { color, fontSize }]}
            >
              {room.name && lastMessageSender?.name
                ? `${lastMessageSender.name.split(' ')[0]}: `
                : null}
              {lastMessage.content}
            </Text>
          ) : null}
        </View>
      ) : null,
    [lastByMe, lastMessage, lastMessageSender, renderAttachmentIcon, room.name],
  );

  const renderPicture = useCallback(
    (style: any) =>
      picture ? (
        <Avatar.Image size={58} source={{ uri: picture }} style={[style, { marginRight: grid }]} />
      ) : (
        <Avatar.Icon
          color={colors.textOnPrimary}
          icon={friendId ? 'account' : 'account-group'}
          size={58}
          style={[style, { marginRight: grid }]}
        />
      ),
    [colors.textOnPrimary, friendId, grid, picture],
  );

  const renderLeft = ({ style }: ListItemSideProps) => (
    <TouchableWithoutFeedback onPress={handleZoomPicture}>
      <View>
        <SharedElement id={friendId || room.id}>{renderPicture(style)}</SharedElement>
        {renderPicture([style, { position: 'absolute' }])}

        <FadeIcon
          color={Colors.white}
          size={28}
          source='checkbox-blank-circle'
          style={styles.roomIconSelected}
          visible={getSelected(room.id)}
        />
        <FadeIcon
          color={Colors.green500}
          size={28}
          source='checkbox-marked-circle'
          style={styles.roomIconSelected}
          visible={getSelected(room.id)}
        />
      </View>
    </TouchableWithoutFeedback>
  );

  const renderRight = (props: ListItemSideProps) => (
    <View style={styles.roomRightContainer}>
      {sentAt ? (
        <Caption {...props} style={styles.roomSentAt}>
          {sentAt}
        </Caption>
      ) : null}
      {room.isArchived ? (
        <Chip
          mode='outlined'
          style={styles.roomArchivedChip}
          textStyle={styles.roomArchivedChipText}
        >
          {t('label.archived')}
        </Chip>
      ) : lastMessagenNotRead && newMessagesCount > 0 ? (
        <Badge
          style={[
            styles.roomMessagesBadge,
            { backgroundColor: colors.accent, color: colors.textOnAccent },
          ]}
          visible
        >
          {newMessagesCount}
        </Badge>
      ) : null}
    </View>
  );

  return (
    <List.Item
      description={renderContent}
      left={renderLeft}
      onLongPress={handleToggleSelect}
      onPress={isSelecting ? handleToggleSelect : handleStartChatting}
      right={renderRight}
      title={title}
      titleEllipsizeMode='tail'
      titleNumberOfLines={1}
    />
  );
};

export default withRoom(RoomItem);