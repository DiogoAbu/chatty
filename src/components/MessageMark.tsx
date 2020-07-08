import React, { FC, memo } from 'react';
import { StyleProp, TextStyle } from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import useTheme from '!/hooks/use-theme';
import ReadReceiptModel from '!/models/ReadReceiptModel';

interface Props {
  readReceipts?: ReadReceiptModel[];
  sentAt: number | null;
  color: string;
  activeColor?: string;
  fontSize?: number;
  style?: StyleProp<TextStyle>;
}

const MessageMark: FC<Props> = ({ readReceipts, sentAt, color, activeColor, fontSize, style }) => {
  const { colors } = useTheme();

  let finalColor = color;
  let iconName = 'refresh';

  if (readReceipts?.length && readReceipts?.every((e) => e.seenAt)) {
    iconName = 'check-all';
    finalColor = activeColor || colors.accent;
  } else if (readReceipts?.length && readReceipts?.every((e) => e.receivedAt)) {
    iconName = 'check-all';
  } else if (sentAt) {
    iconName = 'check';
  }

  return <Icon color={finalColor} name={iconName} size={fontSize} style={style} />;
};

export default memo(MessageMark);
