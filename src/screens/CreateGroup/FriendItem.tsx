import React, { FC, memo, PropsWithChildren } from 'react';
import { TouchableOpacity, View } from 'react-native';

import FastImage from 'react-native-fast-image';
import { Avatar, Colors, IconButton, List } from 'react-native-paper';

import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import { ListItemSideProps } from '!/types';

import styles from './styles';

interface Props {
  friend: any;
  removeMember: (userId: string) => void;
}

const FriendItem: FC<Props> = ({ friend, removeMember }) => {
  const { grid } = useTheme();

  const handleZoomPhoto = usePress(() => {
    // console.log('Photo');
  });

  const handleRemoveMember = usePress(() => {
    requestAnimationFrame(() => {
      removeMember(friend.id);
    });
  });

  const renderLeft = ({ style }: ListItemSideProps) => (
    <TouchableOpacity activeOpacity={0.6} onPress={handleZoomPhoto}>
      <Avatar.Image
        ImageComponent={FastImage}
        size={58}
        source={{ uri: friend.pictureUri }}
        style={[style, { marginRight: grid }]}
      />
    </TouchableOpacity>
  );

  const renderRight = ({ style }: ListItemSideProps) => (
    <View style={[style, styles.friendItemRightContainer]}>
      <IconButton color={Colors.red300} icon='minus-circle-outline' onPress={handleRemoveMember} />
    </View>
  );

  return (
    <List.Item
      left={renderLeft}
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
  return true;
};

export default memo(FriendItem, propsAreEqual);
