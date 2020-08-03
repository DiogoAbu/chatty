import React, { FC } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';

import { ActivityIndicator, Colors } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNetInfo } from '@react-native-community/netinfo';

import usePress from '!/hooks/use-press';
import useTranslation from '!/hooks/use-translation';

import styles from './styles';

interface Props {
  isVisible?: boolean;
  isDownloading?: boolean;
}

const MessageAttachmentProgressOverlay: FC<Props> = ({ children, isVisible, isDownloading }) => {
  const { isConnected, details } = useNetInfo();
  const { t } = useTranslation();

  const handleIconPress = usePress(() => {
    Alert.alert(t('title.oops'), !isConnected ? t('alert.notConnected') : t('alert.connectionIsExpensive'));
  });

  if (!isVisible) {
    return children as null;
  }

  const size = 24;

  return (
    <View style={styles.attachmentProgressOverlayContainer}>
      {children}

      <View style={styles.attachmentProgressOverlayContentContainer}>
        <TouchableOpacity
          disabled={isConnected && !details?.isConnectionExpensive}
          onPress={handleIconPress}
          style={styles.attachmentProgressOverlayContent}
        >
          {!isConnected ? (
            <Icon color={Colors.white} name='wifi-off' size={size} />
          ) : details?.isConnectionExpensive ? (
            <Icon color={Colors.white} name={isDownloading ? 'download-off' : 'download-off'} size={size} />
          ) : (
            <ActivityIndicator color={Colors.white} size={size} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MessageAttachmentProgressOverlay;
