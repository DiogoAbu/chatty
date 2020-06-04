import React, { FC, PropsWithChildren } from 'react';
import { TouchableOpacity, View } from 'react-native';

import FastImage from 'react-native-fast-image';
import { Avatar, Colors, List } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import { useNavigation } from '@react-navigation/native';

import CrossFadeIcon from '!/components/CrossFadeIcon';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import { createRoomAndMembers } from '!/models/RoomModel';
import { useStores } from '!/stores';
import { ListItemSideProps, MainNavigationProp } from '!/types';

import styles from './styles';

type Friend = {
  id: string;
  name: string;
  email: string;
  pictureUri: string;
  publicKey: string;
  isSelected?: boolean;
};

interface Props {
  friend: Friend;
  isSelecting: boolean;
  toggleSelected: (userId: string) => void;
}

const FriendItem: FC<Props> = ({ friend, isSelecting, toggleSelected }) => {
  const database = useDatabase();
  const navigation = useNavigation<MainNavigationProp<'FindFriends'>>();
  const { authStore } = useStores();
  const { grid } = useTheme();

  // Handlers
  const handleStartChatting = usePress(async () => {
    const room = { isLocalOnly: true };
    const members = [authStore.user, friend];
    const roomId = await createRoomAndMembers(database, room, members);

    requestAnimationFrame(() => {
      // Make it so the first screen is Home and we're at the Chatting screen
      navigation.navigate('Chatting', { roomId });
    });
  });

  const handleZoomPhoto = usePress(() => {
    // console.log('Photo');
  });

  const handleToggleSelect = usePress(() => {
    requestAnimationFrame(() => {
      toggleSelected(friend.id);
    });
  });

  // Renders
  const renderLeft = ({ style }: ListItemSideProps) => (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={isSelecting ? handleToggleSelect : handleZoomPhoto}
    >
      <Avatar.Image
        ImageComponent={FastImage}
        size={58}
        source={{ uri: friend.pictureUri }}
        style={[style, { marginRight: grid }]}
      />
    </TouchableOpacity>
  );

  const renderRight = ({ color, style }: ListItemSideProps) => (
    <View style={[style, styles.friendItemRightContainer]}>
      {isSelecting ? (
        <CrossFadeIcon
          color={friend.isSelected ? Colors.green700 : color}
          size={24}
          source={friend.isSelected ? 'check-circle-outline' : 'checkbox-blank-circle-outline'}
        />
      ) : (
        <Icon color={friend.isSelected ? Colors.green700 : color} name='chevron-right' size={24} />
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
  if (prev.friend.isSelected !== next.friend.isSelected) {
    return false;
  }
  if (prev.isSelecting !== next.isSelecting) {
    return false;
  }
  return true;
};

export default React.memo(FriendItem, propsAreEqual);
