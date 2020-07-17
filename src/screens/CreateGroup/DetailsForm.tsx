import React, { FC } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import DocumentPicker from 'react-native-document-picker';
import FastImage from 'react-native-fast-image';
import FileSystem from 'react-native-fs';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { ActivityIndicator, Avatar, FAB as Fab, HelperText, TextInput, Title } from 'react-native-paper';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import CameraRoll from '@react-native-community/cameraroll';
import { useNavigation, useRoute } from '@react-navigation/native';

import { ROOM_NAME_MAX_LENGTH } from '!/config';
import useDimensions from '!/hooks/use-dimensions';
import useFocusEffect from '!/hooks/use-focus-effect';
import useMethod from '!/hooks/use-method';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { upsertRoom } from '!/models/RoomModel';
import { MainNavigationProp, MainRouteProp } from '!/types';

import styles from './styles';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  errorMessage: string;
  pictureUri: string;
  setPictureUri: (text: string) => void;
  isUploadingPic: boolean;
}

const DetailsForm: FC<Props> = ({
  value,
  onChangeText,
  errorMessage,
  pictureUri,
  setPictureUri,
  isUploadingPic,
}) => {
  const database = useDatabase();
  const [winWidth] = useDimensions('window');
  const navigation = useNavigation<MainNavigationProp<'CreateGroup'>>();
  const { params } = useRoute<MainRouteProp<'CreateGroup'>>();
  const { colors, grid, gridBigger } = useTheme();
  const { t } = useTranslation();

  const handleOpenAttachmentPicker = usePress(() => {
    requestAnimationFrame(() => {
      navigation.navigate('AttachmentPickerModal', {
        callbackScreen: 'CreateGroup',
        types: ['camera', 'image'],
      });
    });
  });

  const handlePickImage = useMethod(async () => {
    try {
      const fileChosen = await DocumentPicker.pick({
        type: [DocumentPicker.types.images],
      });

      navigation.setParams({ picturesTaken: undefined });
      requestAnimationFrame(() => {
        setPictureUri(fileChosen.uri);
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        console.error(err);
      }
    }
  });

  const handleDiscardPicture = usePress(async () => {
    navigation.setParams({ picturesTaken: undefined });
    requestAnimationFrame(() => {
      setPictureUri('');
    });

    if (params?.picturesTaken?.[0].uri) {
      try {
        const file = params.picturesTaken[0].uri;
        const fileInfo = await FileSystem.stat(file);

        await CameraRoll.deletePhotos([fileInfo.originalFilepath]);
        await FileSystem.unlink(fileInfo.originalFilepath);
      } catch (err) {
        console.log(err);
      }
    }
  });

  const handleRemoveSavedPicture = usePress(() => {
    if (!params.id) {
      return;
    }
    Alert.alert(
      t('title.removePicture'),
      t('alert.doYouWantTheRemoveTheCurrentPicture'),
      [
        { text: t('label.no') },
        {
          text: t('label.yes'),
          onPress: () => {
            navigation.setParams({ picturesTaken: undefined });
            requestAnimationFrame(() => {
              setPictureUri('');
            });

            void upsertRoom(database, { id: params.id, pictureUri: null });
          },
        },
      ],
      { cancelable: true },
    );
  });

  useFocusEffect(() => {
    const type = `${params.attachmentType || ''}`;

    navigation.setParams({ attachmentType: undefined });

    if (type === 'camera') {
      requestAnimationFrame(() => {
        setPictureUri('');
        navigation.navigate('Camera', {
          screenNameAfterPicture: 'CreateGroup',
          disableRecordVideo: true,
          initialCameraType: 'front',
          showCameraMask: true,
        });
      });
    } else if (type === 'image') {
      void handlePickImage();
    }
  }, [handlePickImage, navigation, params.attachmentType, setPictureUri]);

  const avatarSize = Math.min(200, winWidth - grid * 10);

  return (
    <View style={[styles.detailsContainer, { padding: grid }]}>
      <View style={[styles.detailsAvatarContainer, { margin: gridBigger }]}>
        <TouchableOpacity
          delayLongPress={600}
          disabled={isUploadingPic}
          onLongPress={handleRemoveSavedPicture}
          onPress={handleOpenAttachmentPicker}
        >
          {pictureUri ? (
            <Avatar.Image
              ImageComponent={FastImage}
              size={avatarSize}
              source={{ uri: pictureUri }}
              style={styles.detailsAvatar}
            />
          ) : params?.picturesTaken?.[0] ? (
            <Avatar.Image
              ImageComponent={FastImage}
              size={avatarSize}
              source={{ uri: params.picturesTaken[0].uri }}
              style={styles.detailsAvatar}
            />
          ) : params.pictureUri ? (
            <Avatar.Image
              ImageComponent={FastImage}
              size={avatarSize}
              source={{ uri: params.pictureUri }}
              style={styles.detailsAvatar}
            />
          ) : (
            <Avatar.Icon
              color={colors.textOnPrimary}
              icon='image-plus'
              size={avatarSize}
              style={styles.detailsAvatar}
            />
          )}
        </TouchableOpacity>

        {pictureUri || params?.picturesTaken?.[0] ? (
          <Fab
            color={colors.textOnAccent}
            disabled={isUploadingPic}
            icon='close'
            onPress={handleDiscardPicture}
            small
            style={styles.fabDiscardPicture}
          />
        ) : null}

        {isUploadingPic ? (
          <ActivityIndicator color={colors.accent} size='large' style={StyleSheet.absoluteFill} />
        ) : null}
      </View>

      <TextInput
        autoCapitalize='sentences'
        blurOnSubmit
        disabled={isUploadingPic}
        error={!!errorMessage}
        label={t('label.groupName')}
        maxLength={ROOM_NAME_MAX_LENGTH}
        mode='outlined'
        onChangeText={onChangeText}
        returnKeyType='done'
        value={value}
      />
      <HelperText type={errorMessage ? 'error' : 'info'} visible>
        {errorMessage || t('helper.charactersLeft', { count: ROOM_NAME_MAX_LENGTH - value.trim().length })}
      </HelperText>

      <Title style={{ marginTop: grid }}>{t('label.members')}</Title>
    </View>
  );
};

export default DetailsForm;
