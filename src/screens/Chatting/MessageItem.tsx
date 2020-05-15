import React, { FC, MutableRefObject } from 'react';
import { View } from 'react-native';

import { Colors, Surface, Text } from 'react-native-paper';
import { ExtractedObservables } from '@nozbe/with-observables';

import useDimensions from '!/hooks/use-dimensions';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { AttachmentTypes } from '!/models/AttachmentModel';
import { useStores } from '!/stores';
import getSentAt from '!/utils/get-sent-at';

import MessageMark from '../../components/MessageMark';

import { AttachmentPickerType } from './AttachmentPicker';
import MessageAttachment from './MessageAttachment';
import { withMessage, WithMessageInput, WithMessageOutput } from './queries';
import styles from './styles';

type PropsExtra = {
  title: string;
  isPreviousSameSender?: boolean;
  attachmentPickerRef: MutableRefObject<AttachmentPickerType | null>;
};

type Props = ExtractedObservables<WithMessageOutput & PropsExtra>;

const MessageItem: FC<Props> = ({
  message,
  attachments,
  sender,
  room,
  title,
  isPreviousSameSender,
  attachmentPickerRef,
}) => {
  const [winWidth] = useDimensions('screen');
  const { authStore } = useStores();
  const { colors, dark, roundness } = useTheme();
  const { t } = useTranslation();

  const mine = sender.id === authStore.user.id;
  const sentAt = getSentAt(message.localCreatedAt);
  const borderTopStartRadius = mine || isPreviousSameSender ? undefined : 0;
  const borderBottomEndRadius = mine ? 0 : undefined;

  let attachmentDescription = '';
  if (attachments.length === 1) {
    if (attachments[0].type === AttachmentTypes.video) {
      attachmentDescription = t('label.video');
    } else if (attachments[0].type === AttachmentTypes.image) {
      attachmentDescription = t('label.image');
    }
  } else if (attachments.every((e) => e.type === AttachmentTypes.image)) {
    attachmentDescription = t('label.images');
  }

  const maxWidth = winWidth * 0.75;

  return (
    <Surface
      style={[
        styles.messageContainer,
        attachments.length ? styles.messageContainerWithAttachment : null,
        {
          maxWidth,
          backgroundColor: mine ? colors.primary : dark ? Colors.grey800 : colors.surface,
          borderRadius: roundness * 2,
          borderBottomEndRadius,
          borderTopStartRadius,
        },
        isPreviousSameSender && styles.messageContainerSameSender,
        mine ? styles.messageContainerRight : styles.messageContainerLeft,
      ]}
    >
      {room.name && !mine && !isPreviousSameSender ? (
        <Text style={styles.messageSenderName}>{sender.name}</Text>
      ) : null}

      {attachments.length ? (
        <View style={styles.attachmentContainer}>
          <MessageAttachment
            attachmentPickerRef={attachmentPickerRef}
            attachments={attachments}
            maxWidth={maxWidth}
            title={title}
          />
        </View>
      ) : null}

      <View
        style={[
          styles.messageContentContainer,
          attachments.length ? styles.attachmentMessageContentContainer : null,
        ]}
      >
        <Text
          style={[
            attachments.length ? styles.attachmentMessageText : null,
            { color: mine || dark ? colors.textOnPrimary : colors.text },
          ]}
        >
          {message.content || attachmentDescription}
        </Text>

        <Text
          style={[styles.messageTime, { color: mine || dark ? colors.textOnPrimary : colors.text }]}
        >
          {sentAt}
        </Text>

        {mine ? (
          <MessageMark
            color={Colors.grey300}
            fontSize={16}
            message={message}
            style={styles.messageMark}
          />
        ) : null}
      </View>
    </Surface>
  );
};

const propsAreEqual = (prev: WithMessageInput, next: WithMessageInput) => {
  if (prev.isPreviousSameSender !== next.isPreviousSameSender) {
    return false;
  }
  if (prev.message?.content !== next.message?.content) {
    return false;
  }
  if (prev.message?.localSentAt !== next.message?.localSentAt) {
    return false;
  }
  if (prev.message?.remoteReceivedAt !== next.message?.remoteReceivedAt) {
    return false;
  }
  if (prev.message?.remoteOpenedAt !== next.message?.remoteOpenedAt) {
    return false;
  }
  return true;
};

export default React.memo(withMessage(MessageItem), propsAreEqual);
