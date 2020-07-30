import React, { FC } from 'react';
import { View } from 'react-native';

import { ActivityIndicator } from 'react-native-paper';

import styles from './styles';

interface Props {
  visible?: boolean;
}

const MessageAttachmentProgressOverlay: FC<Props> = ({ children, visible }) => {
  if (!visible) {
    return children as null;
  }

  return (
    <View style={styles.attachmentProgressOverlayContainer}>
      {children}

      <View style={styles.attachmentProgressOverlayContentContainer}>
        <View style={styles.attachmentProgressOverlayContent}>
          <ActivityIndicator />
        </View>
      </View>
    </View>
  );
};

export default MessageAttachmentProgressOverlay;
