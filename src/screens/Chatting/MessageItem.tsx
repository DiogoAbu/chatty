import React, { FC, memo, NamedExoticComponent } from 'react';
import { View } from 'react-native';

import { Colors, Surface, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import useDimensions from '!/hooks/use-dimensions';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { AttachmentTypes } from '!/models/AttachmentModel';
import { useStores } from '!/stores';
import getSentAt from '!/utils/get-sent-at';
import readReceiptChanged from '!/utils/read-receipt-changed';

import MessageMark from '../../components/MessageMark';

import MessageAttachment from './MessageAttachment';
import { withMessage, WithMessageInput, WithMessageOutput } from './queries';
import styles from './styles';

const MessageItem: FC<WithMessageOutput> = ({
  message,
  attachments,
  readReceipts,
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

  const mine = sender?.id === authStore.user.id;
  const sentAt = getSentAt(message.createdAt);
  const borderTopStartRadius = mine || isPreviousSameSender ? undefined : 0;
  const borderBottomEndRadius = mine ? 0 : undefined;

  let attachmentDescription = '';
  if (attachments.length === 1) {
    if (attachments[0].type === AttachmentTypes.video) {
      attachmentDescription = t('label.video');
    } else if (attachments[0].type === AttachmentTypes.image) {
      attachmentDescription = t('label.image');
    }
  } else if (attachments.length > 1 && attachments.every((e) => e.type === AttachmentTypes.image)) {
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
      {room?.name && !mine && !isPreviousSameSender ? (
        <Text style={styles.messageSenderName}>{sender?.name}</Text>
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
          {!message.content && message.cipher ? (
            <>
              <Icon name='key' style={{ color: mine || dark ? colors.textOnPrimary : colors.text }} />
              <Text
                style={[
                  styles.messageEncrypted,
                  { color: mine || dark ? colors.textOnPrimary : colors.text },
                ]}
              >
                {' ' + t('label.encrypted')}
              </Text>
            </>
          ) : (
            message.content || attachmentDescription
          )}
        </Text>

        <Text style={[styles.messageTime, { color: mine || dark ? colors.textOnPrimary : colors.text }]}>
          {sentAt}
          <Text style={{ color: mine || dark ? colors.textOnPrimary : colors.text, fontStyle: 'italic' }}>
            ({message.type})
          </Text>
        </Text>

        {mine ? (
          <MessageMark
            color={Colors.grey300}
            fontSize={16}
            readReceipts={readReceipts}
            sentAt={message.sentAt}
            style={styles.messageMark}
          />
        ) : null}
      </View>
    </Surface>
  );
};

const propsAreEqual = (prev: WithMessageOutput, next: WithMessageOutput) => {
  if (prev.isPreviousSameSender !== next.isPreviousSameSender) {
    return false;
  }
  if (prev.message?.content !== next.message?.content) {
    return false;
  }
  if (prev.message?.sentAt !== next.message?.sentAt) {
    return false;
  }
  if (readReceiptChanged(prev.readReceipts, next.readReceipts)) {
    return false;
  }
  return true;
};

export default memo(withMessage(MessageItem), propsAreEqual) as NamedExoticComponent<WithMessageInput>;
