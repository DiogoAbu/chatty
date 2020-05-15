import React, { FC } from 'react';
import { StyleProp, TextStyle } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import useTheme from '!/hooks/use-theme';
import MessageModel from '!/models/MessageModel';

interface Props {
  color: string;
  activeColor?: string;
  fontSize?: number;
  message?: MessageModel;
  style?: StyleProp<TextStyle>;
}

const MessageMark: FC<Props> = ({ color, activeColor, fontSize, message, style }) => {
  const { colors } = useTheme();

  if (!message) {
    return null;
  }

  let finalColor = color;
  let iconName = 'refresh';

  if (message.remoteOpenedAt) {
    iconName = 'check-all';
    finalColor = activeColor || colors.accent;
  } else if (message.remoteReceivedAt) {
    iconName = 'check-all';
  } else if (message.localSentAt) {
    iconName = 'check';
  }

  return <Icon color={finalColor} name={iconName} size={fontSize} style={style} />;
};

export default React.memo(MessageMark);
