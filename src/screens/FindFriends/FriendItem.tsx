import React, { FC, memo, PropsWithChildren } from 'react';
import { TouchableOpacity, View } from 'react-native';

import FastImage from 'react-native-fast-image';
import { Avatar, Colors, List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { useNavigation } from '@react-navigation/native';

import CrossFadeIcon from '!/components/CrossFadeIcon';
import { User } from '!/generated/graphql';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import RoomModel, { createRoom } from '!/models/RoomModel';
import UserModel from '!/models/UserModel';
import { useStores } from '!/stores';
import { DeepPartial, ListItemSideProps, MainNavigationProp } from '!/types';
import transformUri from '!/utils/transform-uri';

import styles from './styles';

interface Props {
  friend: User;
  isSelected: boolean;
  isSelecting: boolean;
  toggleSelected: (user: User) => void;
}

const FriendItem: FC<Props> = ({ friend, isSelected, isSelecting, toggleSelected }) => {
  const database = useDatabase();
  const navigation = useNavigation<MainNavigationProp<'FindFriends'>>();
  const { authStore } = useStores();
  const { grid } = useTheme();

  // Handlers
  const handleStartChatting = usePress(async () => {
    const room: DeepPartial<RoomModel> = { isLocalOnly: true };
    const friendUser: DeepPartial<UserModel> = {
      id: friend.id,
      name: friend.name,
      pictureUri: friend.pictureUri,
      email: friend.email,
      role: friend.role,
      publicKey: friend.publicKey,
      isFollowingMe: friend.isFollowingMe,
      isFollowedByMe: friend.isFollowedByMe,
    };
    const members = [authStore.user, friendUser];
    const roomCreated = await createRoom(database, authStore.user, room, members);

    requestAnimationFrame(() => {
      navigation.navigate('Chatting', { roomId: roomCreated.id });
    });
  });

  const handleZoomPhoto = usePress(() => {
    // console.log('Photo');
  });

  const handleToggleSelect = usePress(() => {
    requestAnimationFrame(() => {
      toggleSelected(friend);
    });
  });

  // Renders
  const renderLeft = ({ style }: ListItemSideProps) => (
    <TouchableOpacity activeOpacity={0.6} onPress={isSelecting ? handleToggleSelect : handleZoomPhoto}>
      <Avatar.Image
        ImageComponent={FastImage}
        size={58}
        source={{ uri: transformUri(friend.pictureUri, { width: 58 }) }}
        style={[style, { marginRight: grid }]}
      />
    </TouchableOpacity>
  );

  const renderRight = ({ color, style }: ListItemSideProps) => (
    <View style={[style, styles.friendItemRightContainer]}>
      {isSelecting ? (
        <CrossFadeIcon
          color={isSelected ? Colors.green700 : color}
          size={24}
          source={isSelected ? 'check-circle-outline' : 'checkbox-blank-circle-outline'}
        />
      ) : (
        <Icon color={isSelected ? Colors.green700 : color} name='chevron-right' size={24} />
      )}
    </View>
  );

  return (
    <List.Item
      left={renderLeft}
      onLongPress={handleToggleSelect}
      onPress={isSelecting ? handleToggleSelect : handleStartChatting}
      right={renderRight}
      title={friend.name}
      titleEllipsizeMode='tail'
      titleNumberOfLines={2}
    />
  );
};

const propsAreEqual = (
  prev: Readonly<PropsWithChildren<Props>>,
  next: Readonly<PropsWithChildren<Props>>,
) => {
  if (prev.isSelected !== next.isSelected) {
    return false;
  }
  if (prev.isSelecting !== next.isSelecting) {
    return false;
  }
  return true;
};

export default memo(FriendItem, propsAreEqual);
