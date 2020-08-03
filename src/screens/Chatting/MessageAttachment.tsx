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
import AttachmentModel from '!/models/AttachmentModel';
import { AttachmentParam, MainNavigationProp } from '!/types';
import getNormalizedSize from '!/utils/get-normalized-size';
import transformUri from '!/utils/transform-uri';

import { AttachmentPickerType } from './AttachmentPicker';
import MessageAttachmentProgressOverlay from './MessageAttachmentProgressOverlay';
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
  const { colors, roundness, gridSmaller } = useTheme();

  const [fileInfo, setFileInfo] = useState<StatResult | null>(null);

  // One attachment
  const attachment = attachments[0];

  const handleSeeAttachment = usePress(() => {
    attachmentPickerRef.current?.hide();

    requestAnimationFrame(() => {
      navigation.navigate(attachment.type === 'video' ? 'VideoPlayerModal' : 'PictureViewerModal', {
        attachment: {
          id: attachment.id,
          localUri: attachment.localUri,
          remoteUri: attachment.remoteUri,
          cipherUri: attachment.cipherUri,
          filename: attachment.filename,
          type: attachment.type,
          width: attachment.width,
          height: attachment.height,
        },
        title,
      });
    });
  });

  const handleSeePictures = usePress(() => {
    attachmentPickerRef.current?.hide();

    const pictures = attachments.map<AttachmentParam>(({ id, localUri, width, height }) => ({
      id,
      localUri,
      width,
      height,
    }));

    requestAnimationFrame(() => {
      navigation.navigate('PictureScrollerModal', { attachments: pictures, title });
    });
  });

  useEffect(() => {
    (() => {
      try {
        if (attachment.type !== 'document') {
          return;
        }

        // TODO get document name, type and size
      } catch (err) {
        setFileInfo(null);
      }
    })();
  }, [attachment]);

  // Multiple attachments
  if (attachments.length > 1) {
    const preview = attachments.slice(0, PREVIEW_MAX_AMOUNT);

    return (
      <MessageAttachmentProgressOverlay
        isDownloading={attachments.some((e) => !e.localUri)}
        isVisible={attachments.some((e) => !e.cipherUri || !e.localUri)}
      >
        <TouchableWithoutFeedback onPress={handleSeePictures}>
          <View style={styles.attachmentListContainer}>
            {preview.map((item, index) => {
              const size = getLimitedSize(index, preview.length - 1, maxWidth);
              return (
                <SharedElement id={item.id} key={item.id}>
                  <FastImage
                    resizeMode={FastImage.resizeMode.cover}
                    source={{ uri: item.localUri! }}
                    style={{
                      ...size,
                      marginBottom: index === 0 ? PREVIEW_PADDING : undefined,
                      marginRight: index === 0 ? PREVIEW_PADDING : undefined,
                      marginLeft: index === PREVIEW_MAX_AMOUNT - 1 ? PREVIEW_PADDING : undefined,
                      borderRadius: roundness * 2,
                    }}
                  />
                </SharedElement>
              );
            })}
          </View>
        </TouchableWithoutFeedback>
      </MessageAttachmentProgressOverlay>
    );
  }

  if (attachment.type === 'document') {
    return (
      <TouchableWithoutFeedback onPress={handleSeeAttachment}>
        {/* TODO display file info */}
        <Text style={{ paddingHorizontal: gridSmaller }}>{attachment.localUri}</Text>
      </TouchableWithoutFeedback>
    );
  }

  const { aspectRatio, height, width } = getNormalizedSize(attachment, {
    winWidth: maxWidth,
    winHeight: maxWidth,
    isLandscape: false,
  });

  const widthFinal = Math.min(width!, maxWidth) - PREVIEW_PADDING * 2;
  const heightFinal = Math.min(height!, maxWidth) - PREVIEW_PADDING * 2;

  let uri: string | undefined = attachment.localUri!;

  if (!uri && attachment.remoteUri) {
    // Change extension to jpg
    const imageUri = attachment.remoteUri.substring(0, attachment.remoteUri.lastIndexOf('.')) + '.jpg';

    // Get low-quality blurred thumbnail
    uri = transformUri(imageUri, {
      width: widthFinal,
      height: heightFinal,
      quality: 15,
      blur: 1000,
    });
  }

  if (!uri) {
    return (
      <View style={styles.encryptedAttachmentContainer}>
        <Icon name='key' style={[styles.encryptedAttachmentIcon, { color: colors.textOnPrimary }]} />
      </View>
    );
  }

  return (
    <MessageAttachmentProgressOverlay
      isDownloading={!attachment.localUri}
      isVisible={!attachment.cipherUri || !attachment.localUri}
    >
      <TouchableWithoutFeedback onPress={handleSeeAttachment}>
        <View>
          <SharedElement id={attachment.id}>
            <FastImage
              resizeMode={FastImage.resizeMode.cover}
              source={{ uri }}
              style={{
                aspectRatio,
                width: widthFinal,
                height: heightFinal,
                borderRadius: roundness * 2,
              }}
            />
          </SharedElement>
          {attachment.type === 'video' ? (
            <View style={styles.attachmentVideoOverlay}>
              <Icon name='play-circle' style={styles.attachmentVideoPlayIcon} />
            </View>
          ) : null}
        </View>
      </TouchableWithoutFeedback>
    </MessageAttachmentProgressOverlay>
  );
};

export default MessageAttachment;
