import React, { FC, useEffect, useRef, useState } from 'react';
import { BackHandler, ListRenderItemInfo, StatusBar, TextInput, View } from 'react-native';

import FastImage from 'react-native-fast-image';
import { FlatList } from 'react-native-gesture-handler';
import { Appbar, Avatar, Colors, IconButton } from 'react-native-paper';
import Animated, {
  call,
  divide,
  event,
  Extrapolate,
  interpolate,
  useCode,
  Value,
} from 'react-native-reanimated';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import Bottleneck from 'bottleneck';
import { useMemoOne } from 'use-memo-one';

import ImageViewer from '!/components/ImageViewer';
import Loading from '!/components/Loading';
import useDimensions from '!/hooks/use-dimensions';
import useFocusEffect from '!/hooks/use-focus-effect';
import useInput from '!/hooks/use-input';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { AttachmentTypes } from '!/models/AttachmentModel';
import RoomModel from '!/models/RoomModel';
import { useStores } from '!/stores';
import { HeaderOptions, MainNavigationProp, MainRouteProp, Tables } from '!/types';
import getLocalImageDimensions from '!/utils/get-local-image-dimensions';
import getStatusBarColor from '!/utils/get-status-bar-color';

import { PicturesTaken } from '../Camera/types';

import styles from './styles';

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

const FlatListAnim = Animated.createAnimatedComponent(FlatList);

const DOTS_SIZE = 10;
const DOTS_PADDING = 8;

interface Props {
  navigation: MainNavigationProp<'PreparePicture'>;
  route: MainRouteProp<'PreparePicture'>;
}

const PreparePicture: FC<Props> = ({ navigation, route }) => {
  const {
    roomId,
    roomPictureUri,
    popCount,
    skipStatusBar,
    initialMessage,
    picturesTaken,
    handleSaveMessage,
    handleClearPicturesTaken,
    handleTogglePictureSelection,
  } = route.params;

  const database = useDatabase();
  const [winWidth] = useDimensions('window');
  const { authStore } = useStores();
  const { colors, dark, fonts, mode } = useTheme();
  const { t } = useTranslation();

  const [pictures, setPictures] = useState<PicturesTaken[]>([]);
  const message = useInput(initialMessage ?? '');

  const currentIndex = useRef(0);
  const listRef = useRef<FlatList<PicturesTaken> | null>(null);

  const { scrollAnim } = useMemoOne(() => ({ scrollAnim: new Value(0) }), []);

  const handlePressBack = usePress(() => {
    if (!skipStatusBar) {
      StatusBar.setBackgroundColor(getStatusBarColor(4, colors, dark, mode));
      StatusBar.setTranslucent(false);
    }

    handleSaveMessage?.(message.value);
    if (picturesTaken.length === 1) {
      handleClearPicturesTaken?.();
    }
    requestAnimationFrame(() => {
      navigation.goBack();
    });
  });

  const handleMakeAlbumAndBack = usePress(() => {
    handleSaveMessage?.(message.value);
    requestAnimationFrame(() => {
      navigation.goBack();
    });
  });

  const handleDeletePicture = usePress(() => {
    const indexDeleted = currentIndex.current;

    const lengthAfter = pictures.length - 1;
    const indexToScroll = indexDeleted - 1;
    const scrollIndex = lengthAfter === 0 ? -1 : indexToScroll < 0 ? 0 : indexToScroll;

    // Deselect picture on Camera screen
    handleTogglePictureSelection?.(indexDeleted);

    requestAnimationFrame(() => {
      setPictures((prev) => {
        const next = [...prev];
        next.splice(indexDeleted, 1);
        return next;
      });

      if (scrollIndex >= 0) {
        // @ts-ignore
        listRef.current?.getNode().scrollToIndex({ index: scrollIndex, viewPosition: 0.5 });
      } else {
        handlePressBack();
      }
    });
  });

  const handleSend = usePress<[], void>(async () => {
    const roomDb = database.collections.get<RoomModel>(Tables.rooms);
    const room = await roomDb.find(roomId);

    void room.addMessage({
      content: message.value.trim(),
      senderId: authStore.user.id,
      attachments: pictures.map((e) => ({ ...e, type: AttachmentTypes.image })),
    });

    // Chatting -> Camera -> Prepare
    navigation.pop(popCount ?? 2);
  });

  useEffect(() => {
    navigation.setOptions({
      handlePressBack,
      headerCenter: () => (
        <Avatar.Image ImageComponent={FastImage} size={32} source={{ uri: roomPictureUri }} />
      ),
      headerRight: () => (
        <Appbar.Action color={Colors.white} icon='delete' onPress={handleDeletePicture} />
      ),
    } as HeaderOptions);
  }, [handleDeletePicture, handlePressBack, navigation, roomPictureUri]);

  useFocusEffect(() => {
    if (!skipStatusBar) {
      requestAnimationFrame(() => {
        StatusBar.setBackgroundColor('rgba(0,0,0,0.6)');
        StatusBar.setTranslucent(true);
      });
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handlePressBack();
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, [handlePressBack, skipStatusBar]);

  useEffect(() => {
    void (async () => {
      // Prepare images
      const wrapped = limiter.wrap(
        async (pic: PicturesTaken): Promise<PicturesTaken> => {
          if (pic.width && pic.height) {
            return pic;
          }

          const dimensions = await getLocalImageDimensions(pic.uri!);
          return { ...pic, ...dimensions };
        },
      );

      const images = await Promise.all(
        picturesTaken
          .filter((each, index, arr) => {
            // Is selected and uri is not already present
            return (
              each.isSelected && arr.findIndex((e, i) => e.uri === each.uri && i !== index) === -1
            );
          })
          .map(wrapped),
      );

      setPictures(images);
    })();
  }, [picturesTaken]);

  useCode(() => {
    return call([scrollAnim], (y) => {
      const value = y[0];
      currentIndex.current = Math.round(value / winWidth);
    });
  }, [scrollAnim, winWidth]);

  const dotPosition = divide(scrollAnim, winWidth);

  return (
    <View style={styles.container}>
      <FlatListAnim
        contentContainerStyle={{ width: pictures.length ? undefined : winWidth }}
        data={pictures}
        getItemLayout={(_: PicturesTaken, index: number) => ({
          length: winWidth,
          offset: winWidth * index,
          index,
        })}
        horizontal
        initialNumToRender={1}
        keyExtractor={(item: PicturesTaken) => item.uri!}
        ListEmptyComponent={Loading}
        onScroll={event([{ nativeEvent: { contentOffset: { x: scrollAnim } } }])}
        pagingEnabled
        ref={listRef}
        removeClippedSubviews
        renderItem={({ item }: ListRenderItemInfo<PicturesTaken>) => <ImageViewer image={item} />}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
      />

      <FlatList
        contentContainerStyle={styles.dotsContent}
        data={pictures}
        getItemLayout={(_, index) => ({
          length: DOTS_SIZE + DOTS_PADDING * 2,
          offset: DOTS_SIZE + DOTS_PADDING * 2 * index,
          index,
        })}
        keyExtractor={(item) => item.uri! + 'dot'}
        renderItem={({ item, index }) => (
          <Animated.View
            key={item.uri}
            style={{
              opacity: interpolate(dotPosition, {
                inputRange: [index - 1, index, index + 1],
                outputRange: [0.3, 1, 0.3], // when before: 0.3. when same index: 1. when after: 0.3
                extrapolate: Extrapolate.CLAMP,
              }),
              height: DOTS_SIZE,
              width: DOTS_SIZE,
              backgroundColor: colors.accent,
              margin: DOTS_PADDING,
              borderRadius: DOTS_SIZE / 2,
            }}
          />
        )}
        style={styles.dotsContainer}
      />

      <View style={styles.inputContainer}>
        <IconButton color={Colors.white} icon='image-plus' onPress={handleMakeAlbumAndBack} />

        <TextInput
          keyboardAppearance={dark ? 'dark' : 'light'}
          multiline
          placeholder={t('messageInput.placeholder')}
          placeholderTextColor={Colors.grey500}
          selectionColor={colors.primary}
          style={[
            {
              color: Colors.white,
              ...fonts.regular,
            },
            styles.inputText,
          ]}
          underlineColorAndroid='transparent'
          {...message}
        />

        <IconButton color={Colors.white} icon='send' onPress={handleSend} />
      </View>
    </View>
  );
};

export default PreparePicture;
