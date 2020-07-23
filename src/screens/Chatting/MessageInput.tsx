import React, { FC, memo, MutableRefObject, useCallback, useEffect, useState } from 'react';
import { Alert, AlertButton, InteractionManager, TextInput, View } from 'react-native';

import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import { IconButton, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Bottleneck from 'bottleneck';

import useInput from '!/hooks/use-input';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import RoomModel from '!/models/RoomModel';
import { useStores } from '!/stores';
import { MainNavigationProp } from '!/types';

import { PicturesTaken } from '../Camera/types';

import { AttachmentPickerType } from './AttachmentPicker';
import styles from './styles';

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

interface Props {
  room: RoomModel;
  pictureUri: string;
  title: string;
  shouldBlurRemoveRoom: MutableRefObject<boolean>;
  attachmentPickerRef: MutableRefObject<AttachmentPickerType | null>;
}

const iconSize = 24;
const buttonSize = (24 + 6) * 1.5;

const MessageInput: FC<Props> = ({ room, pictureUri, title, shouldBlurRemoveRoom, attachmentPickerRef }) => {
  const navigation = useNavigation<MainNavigationProp<'Chatting'>>();
  const { authStore, syncStore } = useStores();
  const { colors, dark, roundness, fonts } = useTheme();
  const { t } = useTranslation();

  const message = useInput('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleSendMessage = usePress(() => {
    attachmentPickerRef.current?.hide();
    if (sendingMessage) {
      return;
    }
    setSendingMessage(true);

    // Sanitize message
    const content = `${message.value.trim()}`;
    if (!content) {
      return;
    }

    // Clear input for another message
    message.onChangeText('');

    void InteractionManager.runAfterInteractions(async () => {
      await room.addMessage({ content, sender: authStore.user });

      setSendingMessage(false);

      void syncStore.sync();
    });
  });

  const handleSaveMessage = useCallback(
    (value?: string) => {
      message.onChangeText(value?.trim() ?? '');
    },
    [message],
  );

  const handleDismissAttachmentPicker = usePress(() => {
    attachmentPickerRef.current?.hide();
  });

  const handleOpenCamera = usePress(() => {
    attachmentPickerRef.current?.hide();

    shouldBlurRemoveRoom.current = false;
    requestAnimationFrame(() => {
      navigation.navigate('Camera', {
        initialCameraType: 'back',
        roomId: room.id,
        roomTitle: title,
        roomPictureUri: pictureUri,
      });
    });
  });

  const handleOpenAttachmentPicker = usePress(() => {
    requestAnimationFrame(() => {
      attachmentPickerRef.current?.toggle();
    });
  });

  const addMessagesWithDocs = useCallback(
    async (docs: (false | DocumentPickerResponse)[]) => {
      const wrapped = limiter.wrap(async (file: false | DocumentPickerResponse) => {
        if (file) {
          // Create one message for each document
          await room.addMessage({
            content: '',
            sender: authStore.user,
            attachments: [{ uri: file.uri, type: 'document' }],
          });
        }
      });

      await Promise.all(docs.map(wrapped));
    },
    [authStore.user, room],
  );

  useEffect(() => {
    attachmentPickerRef.current?.onPress(async (type) => {
      shouldBlurRemoveRoom.current = false;
      try {
        const filesChosen = await DocumentPicker.pickMultiple({
          type: type === 'image' ? [DocumentPicker.types.images] : [DocumentPicker.types.allFiles],
        });

        // Prepare documents
        if (type === 'document') {
          // Try to access the file
          const checkFiles = limiter.wrap(async (file: DocumentPickerResponse) => {
            try {
              await fetch(file.uri);
              return file;
            } catch (err) {
              return false;
            }
          });

          const checkedFiles = await Promise.all(filesChosen.map(checkFiles));

          // All files are valid
          if (!checkedFiles.some((e) => e === false)) {
            await addMessagesWithDocs(checkedFiles);
            return;
          }

          // Some files valid
          const anyValid = checkedFiles.some((e) => e !== false);

          let alertMessage =
            checkedFiles.length === 1
              ? t('alert.oneFileNotFound')
              : anyValid
              ? t('alert.someFilesNotFound')
              : t('alert.noFilesFound');

          alertMessage += '.';
          alertMessage += `\n${t('alert.maybeFileIsShortcut')}.`;
          alertMessage += anyValid ? `\n\n${t('alert.sendValidFiles?')}` : '';

          const buttons: AlertButton[] = [];

          buttons.push({
            style: 'cancel',
            text: t('label.return'),
          });

          // Ask if the user wants to send only the valid files
          if (anyValid) {
            buttons.push({
              onPress: async () => addMessagesWithDocs(checkedFiles),
            });
          }

          Alert.alert(t('title.oops'), alertMessage, buttons, { cancelable: true });

          return;
        }

        // Prepare images
        const images: PicturesTaken[] = filesChosen.map((file) => ({
          uri: file.uri,
          type: 'image',
          isSelected: true,
        }));

        requestAnimationFrame(() => {
          navigation.navigate('PreparePicture', {
            roomId: room.id,
            roomTitle: title,
            roomPictureUri: pictureUri,
            popCount: 1,
            initialMessage: message.value,
            picturesTaken: images,
            handleSaveMessage,
          });
        });
      } catch (err) {
        if (DocumentPicker.isCancel(err)) {
          // User cancelled the picker, exit any dialogs or menus and move on
        } else {
          console.error(err);
        }
      }
    });
  }, [
    addMessagesWithDocs,
    attachmentPickerRef,
    authStore.user.id,
    handleSaveMessage,
    message.value,
    navigation,
    pictureUri,
    room,
    shouldBlurRemoveRoom,
    t,
    title,
  ]);

  return (
    <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
      <Surface style={[{ borderRadius: roundness * 2 }, styles.inputSurface]}>
        <TextInput
          keyboardAppearance={dark ? 'dark' : 'light'}
          multiline
          onFocus={handleDismissAttachmentPicker}
          onTouchStart={handleDismissAttachmentPicker}
          placeholder={t('messageInput.placeholder')}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          style={[
            {
              color: colors.text,
              ...fonts.regular,
            },
            styles.inputText,
          ]}
          underlineColorAndroid='transparent'
          {...message}
        />
        <IconButton icon='paperclip' onPress={handleOpenAttachmentPicker} />
      </Surface>

      <Surface style={[{ backgroundColor: colors.primary }, styles.inputIconSurface]}>
        <IconButton
          animated
          borderless
          color={colors.textOnPrimary}
          icon={message.value.length ? 'send' : 'camera'}
          onPress={message.value.length ? handleSendMessage : handleOpenCamera}
          size={iconSize}
          style={[
            styles.inputIconButton,
            { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 },
          ]}
        />
      </Surface>
    </View>
  );
};

export default memo(MessageInput);
