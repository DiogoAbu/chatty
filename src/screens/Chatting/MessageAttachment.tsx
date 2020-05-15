import React, { FC, MutableRefObject, useEffect, useState } from 'react';
import { TouchableWithoutFeedback, View } from 'react-native';

import FastImage from 'react-native-fast-image';
import { StatResult } from 'react-native-fs';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SharedElement } from 'react-navigation-shared-element';
import { useNavigation } from '@react-navigation/native';

import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import AttachmentModel, { AttachmentTypes } from '!/models/AttachmentModel';
import { MainNavigationProp } from '!/types';
import getNormalizedSize from '!/utils/get-normalized-size';

import { AttachmentPickerType } from './AttachmentPicker';
import styles from './styles';

const PREVIEW_MAX_AMOUNT = 4;
const PREVIEW_PADDING = 4;

interface Props {
  attachments: AttachmentModel[];
  title: string;
  maxWidth: number;
  attachmentPickerRef: MutableRefObject<AttachmentPickerType | null>;
}

const getLimitedSize = (index: number, lastIndex: number, size: number) => {
  const isLast = index === lastIndex;
  const isEven = index % 2 === 0;

  // 3rd image gets to fill the non-existent 4th image place
  const width = isLast && isEven ? size - PREVIEW_PADDING : (size - PREVIEW_PADDING) / 2;
  const height = size / 2;

  return {
    width: width - PREVIEW_PADDING,
    height: height - PREVIEW_PADDING,
  };
};

const MessageAttachment: FC<Props> = ({ attachments, title, maxWidth, attachmentPickerRef }) => {
  const navigation = useNavigation<MainNavigationProp<'Chatting'>>();
  const { roundness, gridSmaller } = useTheme();

  const [fileInfo, setFileInfo] = useState<StatResult | null>(null);

  const handleSeeAttachment = usePress(() => {
    attachmentPickerRef.current?.hide();

    const { id, uri, width, height, type } = attachments[0];
    const attachment = { id, uri, width, height, type };
    const route = type === AttachmentTypes.video ? 'VideoPlayerModal' : 'PictureViewerModal';

    requestAnimationFrame(() => {
      navigation.navigate(route, { attachment, title });
    });
  });

  const handleSeePictures = usePress(() => {
    attachmentPickerRef.current?.hide();

    const pictures = attachments.map(({ id, uri, width, height }) => ({ id, uri, width, height }));

    requestAnimationFrame(() => {
      navigation.navigate('PictureScrollerModal', { attachments: pictures, title });
    });
  });

  useEffect(() => {
    (() => {
      try {
        const attachment = attachments[0];
        if (attachment.type !== AttachmentTypes.document) {
          return;
        }

        // TODO preview file with uri: content://
      } catch (err) {
        setFileInfo(null);
      }
    })();
  }, [attachments]);

  if (attachments.length > 1) {
    const preview = attachments.slice(0, PREVIEW_MAX_AMOUNT);

    return (
      <TouchableWithoutFeedback onPress={handleSeePictures}>
        <View style={styles.attachmentListContainer}>
          {preview.map((item, index) => (
            <SharedElement id={item.id} key={item.id}>
              <FastImage
                resizeMode={FastImage.resizeMode.cover}
                source={{ uri: item.uri }}
                style={{
                  ...getLimitedSize(index, preview.length - 1, maxWidth),
                  marginBottom: index === 0 ? PREVIEW_PADDING : undefined,
                  marginRight: index === 0 ? PREVIEW_PADDING : undefined,
                  marginLeft: index === PREVIEW_MAX_AMOUNT - 1 ? PREVIEW_PADDING : undefined,
                  borderRadius: roundness * 2,
                }}
              />
            </SharedElement>
          ))}
        </View>
      </TouchableWithoutFeedback>
    );
  }

  const attachment = attachments[0];

  if (attachment.type === AttachmentTypes.document) {
    return (
      <TouchableWithoutFeedback onPress={handleSeeAttachment}>
        <Text style={{ paddingHorizontal: gridSmaller }}>{attachment.uri}</Text>
      </TouchableWithoutFeedback>
    );
  }

  const { aspectRatio, height, width } = getNormalizedSize(attachment, {
    winWidth: maxWidth,
    winHeight: maxWidth,
    isLandscape: false,
  });

  return (
    <TouchableWithoutFeedback onPress={handleSeeAttachment}>
      <View>
        <SharedElement id={attachment.id}>
          <FastImage
            resizeMode={FastImage.resizeMode.cover}
            source={{ uri: attachment.uri }}
            style={{
              aspectRatio,
              width: Math.min(width!, maxWidth) - PREVIEW_PADDING * 2,
              height: Math.min(height!, maxWidth) - PREVIEW_PADDING * 2,
              borderRadius: roundness * 2,
            }}
          />
        </SharedElement>
        {attachment.type === AttachmentTypes.video ? (
          <View style={styles.attachmentOverlay}>
            <Icon name='play-circle' style={styles.attachmentPlayIcon} />
          </View>
        ) : null}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default MessageAttachment;
