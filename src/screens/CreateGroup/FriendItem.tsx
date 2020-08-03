import React, { FC, memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import FastImage from 'react-native-fast-image';
import { Avatar, Colors, IconButton, List } from 'react-native-paper';

import { User } from '!/generated/graphql';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import { ListItemSideProps } from '!/types';
import transformUri from '!/utils/transform-uri';

import styles from './styles';

interface Props {
  friend: User;
  removeMember: (userId: string) => void;
  isEditing?: boolean;
}

const FriendItem: FC<Props> = ({ friend, removeMember, isEditing }) => {
  const { grid } = useTheme();

  const handleZoomPhoto = usePress(() => {
    // console.log('Photo');
  });

  const handleRemoveMember = usePress(() => {
    requestAnimationFrame(() => {
      removeMember(friend.id!);
    });
  });

  const renderLeft = ({ style }: ListItemSideProps) => (
    <TouchableOpacity activeOpacity={0.6} onPress={handleZoomPhoto}>
      <Avatar.Image
        ImageComponent={FastImage}
        size={58}
        source={{ uri: transformUri(friend.pictureUri, { width: 58 }) }}
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
      right={isEditing ? undefined : renderRight}
      title={friend.name}
      titleEllipsizeMode='tail'
      titleNumberOfLines={2}
    />
  );
};

export default memo(FriendItem);
