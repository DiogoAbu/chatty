import React, { FC, useEffect } from 'react';
import { TextInput, View } from 'react-native';

import FastImage from 'react-native-fast-image';
import { Appbar, Avatar, Colors, IconButton } from 'react-native-paper';
import { useDatabase } from '@nozbe/watermelondb/hooks';

import VideoPlayer from '!/components/VideoPlayer';
import useInput from '!/hooks/use-input';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { AttachmentTypes } from '!/models/AttachmentModel';
import RoomModel from '!/models/RoomModel';
import { useStores } from '!/stores';
import { HeaderOptions, MainNavigationProp, MainRouteProp, Tables } from '!/types';

import styles from './styles';

interface Props {
  navigation: MainNavigationProp<'PrepareVideo'>;
  route: MainRouteProp<'PrepareVideo'>;
}

const PrepareVideo: FC<Props> = ({ navigation, route }) => {
  const { roomId, roomPictureUri, videoRecorded } = route.params;

  const database = useDatabase();
  const { authStore } = useStores();
  const { colors, dark, fonts } = useTheme();
  const { t } = useTranslation();

  const message = useInput('');

  const handlePressBack = usePress(() => {
    requestAnimationFrame(() => {
      navigation.goBack();
    });
  });

  const handleSend = usePress<[], void>(async () => {
    const roomDb = database.collections.get<RoomModel>(Tables.rooms);
    const room = await roomDb.find(roomId);

    void room.addMessage({
      content: message.value.trim(),
      senderId: authStore.user.id,
      attachments: [{ ...videoRecorded, type: AttachmentTypes.video }],
    });

    // Chatting -> Camera -> Prepare
    navigation.pop(2);
  });

  const handleDeleteVideo = usePress(() => {
    handlePressBack();
  });

  useEffect(() => {
    navigation.setOptions({
      handlePressBack,
      headerCenter: () => (
        <Avatar.Image ImageComponent={FastImage} size={32} source={{ uri: roomPictureUri }} />
      ),
      headerRight: () => (
        <Appbar.Action color={Colors.white} icon='delete' onPress={handleDeleteVideo} />
      ),
    } as HeaderOptions);
  }, [handleDeleteVideo, handlePressBack, navigation, roomPictureUri]);

  return (
    <View style={styles.container}>
      <VideoPlayer video={videoRecorded} />

      <View style={styles.inputContainer}>
        <TextInput
          keyboardAppearance={dark ? 'dark' : 'light'}
          multiline
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

        <IconButton icon='send' onPress={handleSend} />
      </View>
    </View>
  );
};

export default PrepareVideo;
