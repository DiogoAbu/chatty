import React, { FC } from 'react';
import { ListRenderItemInfo, TouchableOpacity } from 'react-native';

import FastImage from 'react-native-fast-image';
import { Colors } from 'react-native-paper';

import FadeIcon from '!/components/FadeIcon';
import usePress from '!/hooks/use-press';

import styles from './styles';
import { PicturesTaken } from './types';

interface Props extends ListRenderItemInfo<PicturesTaken> {
  size: number;
  padding: number;
  onPress: (index: number) => any;
}

const PictureListItem: FC<Props> = ({ item, index, size, padding, onPress }) => {
  const handlePress = usePress(() => {
    onPress(index);
  });

  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={handlePress}
      style={{ marginHorizontal: padding }}
    >
      <FastImage
        resizeMode={FastImage.resizeMode.contain}
        source={{ uri: item.uri }}
        style={{
          width: Math.min(item.width!, size),
          height: Math.min(item.height!, size),
          aspectRatio: item.width! / item.height!,
        }}
      />

      <FadeIcon
        color={Colors.white}
        size={24}
        source='check-circle'
        style={styles.iconPictureSelected}
        visible={item.isSelected}
      />
    </TouchableOpacity>
  );
};

export default PictureListItem;
