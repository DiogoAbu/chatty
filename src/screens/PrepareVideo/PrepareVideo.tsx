import React, { FC, useEffect, useState } from 'react';
import { BackHandler, TextInput, View } from 'react-native';

import FastImage from 'react-native-fast-image';
import { Appbar, Avatar, Colors, IconButton } from 'react-native-paper';
import { OnLoadData } from 'react-native-video';
import { useDatabase } from '@nozbe/watermelondb/hooks';

import VideoPlayer from '!/components/VideoPlayer';
import useFocusEffect from '!/hooks/use-focus-effect';
import useInput from '!/hooks/use-input';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import RoomModel from '!/models/RoomModel';
import { useStores } from '!/stores';
import { HeaderOptions, MainNavigationProp, MainRouteProp, Tables } from '!/types';
import transformUri from '!/utils/transform-uri';

import styles from './styles';

interface Props {
  navigation: MainNavigationProp<'PrepareVideo'>;
  route: MainRouteProp<'PrepareVideo'>;
}

const PrepareVideo: FC<Props> = ({ navigation, route }) => {
  const { roomId, roomPictureUri, popCount, initialMessage, videoRecorded, handleSaveMessage } = route.params;

  const database = useDatabase();
  const { authStore } = useStores();
  const { colors, dark, fonts } = useTheme();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [video, setVideo] = useState(videoRecorded);

  const message = useInput(initialMessage ?? '');

  useEffect(() => {
    console.log('video', video);
  }, [video]);

  const handleLoaded = usePress((data: OnLoadData) => {
    setVideo((prev) => {
      if (prev.width && prev.height) {
        return prev;
      }
      return { ...prev, width: data.naturalSize.width, height: data.naturalSize.height };
    });
    setIsLoading(false);
  });

  const handlePressBack = usePress(() => {
    handleSaveMessage?.(message.value);
    requestAnimationFrame(() => {
      navigation.goBack();
    });
  });

  const handleSend = usePress<[], void>(async () => {
    const roomDb = database.collections.get<RoomModel>(Tables.rooms);
    const room = await roomDb.find(roomId);

    await room.addMessage({
      content: message.value.trim(),
      sender: authStore.user,
      attachments: [{ ...video, type: 'video' }],
    });

    // Chatting -> Camera -> Prepare
    navigation.pop(popCount ?? 2);
  });

  const handleDeleteVideo = usePress(() => {
    handlePressBack();
  });

  useEffect(() => {
    navigation.setOptions({
      handlePressBack,
      headerCenter: () => (
        <Avatar.Image
          ImageComponent={FastImage}
          size={32}
          source={{ uri: transformUri(roomPictureUri, { width: 64 }) }}
        />
      ),
      headerRight: () => <Appbar.Action color={Colors.white} icon='delete' onPress={handleDeleteVideo} />,
    } as HeaderOptions);
  }, [handleDeleteVideo, handlePressBack, navigation, roomPictureUri]);

  useFocusEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handlePressBack();
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, [handlePressBack]);

  return (
    <View style={styles.container}>
      <VideoPlayer onLoaded={handleLoaded} video={video} />

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

        <IconButton disabled={isLoading} icon='send' onPress={handleSend} />
      </View>
    </View>
  );
};

export default PrepareVideo;
