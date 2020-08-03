import React, { FC } from 'react';
import { TouchableWithoutFeedback } from 'react-native';

import FastImage from 'react-native-fast-image';
import { SharedElement } from 'react-navigation-shared-element';
import { useNavigation } from '@react-navigation/native';

import useDimensions from '!/hooks/use-dimensions';
import usePress from '!/hooks/use-press';
import { AttachmentParam, RootNavigationProp } from '!/types';
import getNormalizedSize from '!/utils/get-normalized-size';

interface Props {
  item: AttachmentParam;
  title: string;
}

const PictureItem: FC<Props> = ({ item: picture, title }) => {
  const [winWidth, winHeight, isLandscape] = useDimensions('window');
  const navigation = useNavigation<RootNavigationProp<'PictureScrollerModal'>>();

  const handlePress = usePress(() => {
    requestAnimationFrame(() => {
      navigation.navigate('PictureViewerModal', {
        attachment: {
          id: picture.id,
          localUri: picture.localUri,
          remoteUri: picture.remoteUri,
          cipherUri: picture.cipherUri,
          filename: picture.filename,
          type: picture.type,
          width: picture.width,
          height: picture.height,
        },
        title,
        skipStatusBar: true,
      });
    });
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
          source={{ uri: picture.localUri! }}
          style={{ width, height, aspectRatio }}
        />
      </SharedElement>
    </TouchableWithoutFeedback>
  );
};

export default PictureItem;
