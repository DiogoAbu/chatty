import React, { FC } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { Colors, FAB as Fab, Text } from 'react-native-paper';

import usePress from '!/hooks/use-press';
import useTranslation from '!/hooks/use-translation';
import { AttachmentTypes } from '!/models/AttachmentModel';

interface Props {
  type: keyof typeof AttachmentTypes | 'camera';
  onPress?: (type: keyof typeof AttachmentTypes) => void;
  onPressCamera?: (type: keyof typeof AttachmentTypes | 'camera') => void;
}

const AttachmentIcon: FC<Props> = ({ type, onPress, onPressCamera }) => {
  const { t } = useTranslation();

  const handleOnPress = usePress(() => {
    if (type === 'camera') {
      onPressCamera?.('camera');
    } else {
      onPress?.(type);
    }
  });

  let iconName: string;
  let bgColor: string;
  let label: string;

  if (type === 'document') {
    iconName = 'file-document';
    bgColor = Colors.blue500;
    label = 'label.documents';
  } else if (type === 'image') {
    iconName = 'image';
    bgColor = Colors.yellow700;
    label = 'label.images';
  } else if (type === 'video') {
    iconName = 'video';
    bgColor = Colors.red400;
    label = 'label.video';
  } else if (type === 'camera') {
    iconName = 'camera';
    bgColor = Colors.blueGrey500;
    label = 'label.camera';
  } else {
    return null;
  }

  return (
    <TouchableOpacity activeOpacity={0.6} onPress={handleOnPress} style={styles.attachmentTypeIconContainer}>
      <Fab icon={iconName} style={[styles.attachmentTypeIcon, { backgroundColor: bgColor }]} />
      <Text>{t(label)}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  attachmentTypeIconContainer: {
    alignItems: 'center',
    margin: 12,
  },
  attachmentTypeIcon: {
    marginBottom: 6,
  },
});

export default AttachmentIcon;
