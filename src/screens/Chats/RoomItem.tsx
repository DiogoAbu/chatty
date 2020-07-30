import React, { FC, useCallback } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

import FastImage from 'react-native-fast-image';
import { Avatar, Badge, Caption, Chip, Colors, List, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SharedElement } from 'react-navigation-shared-element';
import { useNavigation } from '@react-navigation/native';

import FadeIcon from '!/components/FadeIcon';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { useStores } from '!/stores';
import { HomeTabNavigationProp, ListItemSideProps } from '!/types';
import getAttachmentTextKey from '!/utils/get-attachment-text-key';
import getRoomMember from '!/utils/get-room-member';
import getSentAt from '!/utils/get-sent-at';
import transformUri from '!/utils/transform-uri';

import MessageMark from '../../components/MessageMark';

import { withOneRoom, WithOneRoomInput, WithOneRoomOutput } from './queries';
import styles from './styles';

const RoomItem: FC<WithOneRoomOutput> = ({
  room,
  members,
  newMessagesCount,
  lastMessage,
  lastMessageSender,
  lastMessageAttachments,
  lastMessageReadReceipts,
  isSelecting,
  toggleSelected,
  getSelected,
}) => {
  const navigation = useNavigation<HomeTabNavigationProp<'Chats'>>();
  const { authStore } = useStores();
  const { grid, colors } = useTheme();
  const { t } = useTranslation();

  const sentAt = getSentAt(lastMessage?.createdAt || room.lastChangeAt || room.createdAt);
  const lastMessageNotRead =
    !lastMessage || !room?.lastReadAt
      ? false
      : new Date(lastMessage.createdAt).getTime() > new Date(room.lastReadAt).getTime();

  const lastByMe = lastMessageSender?.id === authStore.user.id;

  let title = room.name;
  let pictureUri = room.pictureUri || undefined;
  let friendId: string | undefined;

  if (!title) {
    const friend = getRoomMember(members, authStore.user.id);
    title = friend?.name || null;
    pictureUri = friend?.pictureUri as string | undefined;
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
        roomPictureUri: pictureUri!,
        friendId: friendId!,
        roomId: room.id,
      });
    });
  });

  const renderAttachmentIcon = useCallback(
    () =>
      lastMessageAttachments?.some((e) => e.type === 'image') ? (
        <Icon
          name={lastMessageAttachments.length > 1 ? 'image-album' : 'image'}
          style={[styles.lastMessageAttachmentIcon, styles.marginRight, { color: colors.accent }]}
        />
      ) : lastMessageAttachments?.some((e) => e.type === 'video') ? (
        <Icon
          name='video'
          style={[styles.lastMessageAttachmentIcon, styles.marginRight, { color: colors.accent }]}
        />
      ) : lastMessageAttachments?.some((e) => e.type === 'document') ? (
        <Icon
          name='paperclip'
          style={[styles.lastMessageAttachmentIcon, styles.marginRight, { color: colors.accent }]}
        />
      ) : null,
    [colors.accent, lastMessageAttachments],
  );

  const renderContent = useCallback(
    ({ color, fontSize }: { color: string; fontSize: number }) =>
      lastMessage ? (
        <View style={styles.itemContentContainer}>
          {lastByMe ? (
            <MessageMark
              color={color}
              fontSize={16}
              readReceipts={lastMessageReadReceipts}
              sentAt={lastMessage.sentAt}
              style={styles.marginRight}
            />
          ) : null}
          {!lastMessage.content && lastMessage.cipher ? (
            <>
              <Icon name='key' style={{ color, fontSize }} />
              <Text
                ellipsizeMode='tail'
                numberOfLines={1}
                style={[styles.lastMessageEncrypted, { color, fontSize }]}
              >
                {' ' + t('label.encrypted')}
              </Text>
            </>
          ) : (
            <>
              {!lastMessage.content ? renderAttachmentIcon() : null}
              <Text ellipsizeMode='tail' numberOfLines={1} style={{ color, fontSize }}>
                {room.name && lastMessageSender?.name ? `${lastMessageSender.name.split(' ')[0]}: ` : null}
                {lastMessage.content || t(getAttachmentTextKey(lastMessageAttachments))}
              </Text>
            </>
          )}
        </View>
      ) : null,
    [
      lastByMe,
      lastMessage,
      lastMessageAttachments,
      lastMessageReadReceipts,
      lastMessageSender?.name,
      renderAttachmentIcon,
      room.name,
      t,
    ],
  );

  const renderPicture = useCallback(
    (style: any) =>
      pictureUri ? (
        <Avatar.Image
          ImageComponent={FastImage}
          size={58}
          source={{ uri: transformUri(pictureUri, { width: 58 }) }}
          style={[style, { marginRight: grid }]}
        />
      ) : (
        <Avatar.Icon
          color={colors.textOnPrimary}
          icon={friendId ? 'account' : 'account-group'}
          size={58}
          style={[style, { marginRight: grid }]}
        />
      ),
    [colors.textOnPrimary, friendId, grid, pictureUri],
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
      <View style={styles.roomRightDetailsContainer}>
        {room.isMuted ? (
          <Icon color={colors.text} name='volume-off' size={20} style={styles.roomRightIcon} />
        ) : null}
        {room.isArchived ? (
          <Chip mode='outlined' style={styles.roomArchivedChip} textStyle={styles.roomArchivedChipText}>
            {t('label.archived')}
          </Chip>
        ) : lastMessageNotRead && newMessagesCount > 0 ? (
          <Badge
            size={26}
            style={[styles.roomMessagesBadge, { backgroundColor: colors.accent, color: colors.textOnAccent }]}
            visible
          >
            {newMessagesCount}
          </Badge>
        ) : null}
      </View>
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

export default withOneRoom(RoomItem) as FC<WithOneRoomInput>;
