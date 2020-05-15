import React, { FC } from 'react';
import { TouchableWithoutFeedback } from 'react-native';

import FastImage from 'react-native-fast-image';
import { SharedElement } from 'react-navigation-shared-element';
import { useNavigation } from '@react-navigation/native';

import useDimensions from '!/hooks/use-dimensions';
import usePress from '!/hooks/use-press';
import AttachmentModel from '!/models/AttachmentModel';
import { DeepPartial, RootNavigationProp } from '!/types';
import getNormalizedSize from '!/utils/get-normalized-size';

interface Props {
  item: DeepPartial<AttachmentModel>;
  title: string;
}

const PictureItem: FC<Props> = ({ item: picture, title }) => {
  const [winWidth, winHeight, isLandscape] = useDimensions('window');
  const navigation = useNavigation<RootNavigationProp<'PictureScrollerModal'>>();

  const handlePress = usePress(() => {
    navigation.navigate('PictureViewerModal', { attachment: picture, title, skipStatusBar: true });
  });

  const { aspectRatio, height, width } = getNormalizedSize(picture, {
    winWidth,
    winHeight,
    isLandscape,
  });

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <SharedElement id={picture.id!}>
        <FastImage
          resizeMode={FastImage.resizeMode.contain}
          source={{ uri: picture.uri }}
          style={{ width, height, aspectRatio }}
        />
      </SharedElement>
    </TouchableWithoutFeedback>
  );
};

export default PictureItem;
