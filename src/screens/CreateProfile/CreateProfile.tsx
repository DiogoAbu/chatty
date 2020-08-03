import React, { FC, useEffect, useState } from 'react';
import { Alert, BackHandler, StatusBar, StyleSheet, View } from 'react-native';

import DocumentPicker from 'react-native-document-picker';
import FastImage from 'react-native-fast-image';
import FileSystem from 'react-native-fs';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import {
  ActivityIndicator,
  Appbar,
  Avatar,
  Button,
  FAB as Fab,
  HelperText,
  TextInput,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import CameraRoll from '@react-native-community/cameraroll';

import { USER_NAME_MAX_LENGTH, USER_NAME_MIN_LENGTH } from '!/config';
import useDimensions from '!/hooks/use-dimensions';
import useFocusEffect from '!/hooks/use-focus-effect';
import useInput from '!/hooks/use-input';
import useMethod from '!/hooks/use-method';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { userUpdater } from '!/models/UserModel';
import { uploadMedia } from '!/services/remote-media';
import { useStores } from '!/stores';
import { HeaderOptions, MainNavigationProp, MainRouteProp, StackHeaderRightProps } from '!/types';
import getStatusBarColor from '!/utils/get-status-bar-color';
import transformUri from '!/utils/transform-uri';

import styles from './styles';

interface Props {
  navigation: MainNavigationProp<'CreateProfile'>;
  route: MainRouteProp<'CreateProfile'>;
}

const CreateProfile: FC<Props> = ({ navigation, route }) => {
  const database = useDatabase();
  const [winWidth] = useDimensions('window');
  const { authStore, syncStore } = useStores();
  const { colors, dark, mode, grid, gridBigger } = useTheme();
  const { t } = useTranslation();

  const { params } = route;

  const [pictureUri, setPictureUri] = useState('');

  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const nameInput = useInput(authStore.user.name, () => setErrorMessage(''));

  const handlePressBack = usePress(() => {
    navigation.navigate('Settings', { reload: true });
  });

  const handleOpenAttachmentPicker = usePress(() => {
    requestAnimationFrame(() => {
      navigation.navigate('AttachmentPickerModal', {
        callbackScreen: 'CreateProfile',
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

    if (params?.picturesTaken?.[0].localUri) {
      try {
        const file = params.picturesTaken[0].localUri;
        const fileInfo = await FileSystem.stat(file);

        await CameraRoll.deletePhotos([fileInfo.originalFilepath]);
        await FileSystem.unlink(fileInfo.originalFilepath);
      } catch (err) {
        console.log(err);
      }
    }
  });

  const handleRemoveSavedPicture = usePress(() => {
    Alert.alert(
      t('title.removePicture'),
      t('alert.doYouWantTheRemoveTheCurrentPicture'),
      [
        { text: t('label.no') },
        {
          text: t('label.yes'),
          onPress: () => {
            requestAnimationFrame(() => {
              navigation.setParams({ picturesTaken: undefined });
            });

            void database.action(async () => {
              await authStore.user.update(
                userUpdater({
                  pictureUri: null,
                }),
              );
            });
          },
        },
      ],
      { cancelable: true },
    );
  });

  const handleFinishSetup = usePress(async () => {
    try {
      const name = nameInput.value.trim();

      if (!name || name.length < USER_NAME_MIN_LENGTH || name.length > USER_NAME_MAX_LENGTH) {
        setErrorMessage(t('helper.fieldRequired'));
        return;
      }

      setIsUploadingPic(true);

      let remoteUri: string | undefined;

      const pictureUriToUpload = params?.picturesTaken?.[0].localUri ?? pictureUri;
      if (pictureUriToUpload) {
        const res = await uploadMedia(pictureUriToUpload);
        remoteUri = res.secure_url;
      }

      // Save user data
      if (remoteUri || authStore.user.name !== name) {
        await database.action(async () => {
          await authStore.user.update(
            userUpdater({
              name,
              pictureUri: remoteUri,
            }),
          );
        });
      }

      // Wait only if it`s setting up the profile for the first time
      if (params?.isEditing) {
        void syncStore.sync();
      } else {
        await syncStore.sync();
      }

      requestAnimationFrame(() => {
        if (params?.isEditing) {
          handlePressBack();
        } else {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
      });
    } catch (err) {
      console.log(err);
      Alert.alert(t('title.oops'));
      setIsUploadingPic(false);
    }
  });

  const handleSignOut = usePress(() => {
    requestAnimationFrame(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    });
  });

  useFocusEffect(() => {
    const type = `${params?.attachmentType || ''}`;

    navigation.setParams({ attachmentType: undefined });

    if (type === 'camera') {
      requestAnimationFrame(() => {
        setPictureUri('');
        navigation.navigate('Camera', {
          screenNameAfterPicture: 'CreateProfile',
          disableRecordVideo: true,
          initialCameraType: 'front',
          showCameraMask: true,
        });
      });
    } else if (type === 'image') {
      void handlePickImage();
    }

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (params?.isEditing) {
        handlePressBack();
        return true;
      }
      Alert.alert(t('title.closeTheApp'), t('alert.youCanAlwaysChangeYourProfileLater'), [
        { text: t('label.no') },
        { text: t('label.yes'), onPress: () => BackHandler.exitApp() },
      ]);
      return true;
    });

    return () => {
      backHandler.remove();
    };
  }, [handlePickImage, handlePressBack, navigation, params?.attachmentType, params?.isEditing, t]);

  useEffect(() => {
    const elevation = 4;
    const bgColor = getStatusBarColor(elevation, colors, dark, mode);

    StatusBar.setHidden(false);
    StatusBar.setBackgroundColor(bgColor, true);
    StatusBar.setBarStyle(colors.statusBarText);
    StatusBar.setTranslucent(false);

    navigation.setOptions({
      headerShown: params?.isEditing,
      handlePressBack: params?.isEditing ? handlePressBack : undefined,
      headerRight: ({ tintColor }: StackHeaderRightProps) =>
        !params?.isEditing ? (
          <Button color={dark ? colors.primary : tintColor} disabled={isUploadingPic} onPress={handleSignOut}>
            {t('signOut')}
          </Button>
        ) : (
          <Appbar.Action
            color={tintColor}
            disabled={isUploadingPic}
            icon='check-bold'
            onPress={handleFinishSetup}
          />
        ),
    } as HeaderOptions);
  }, [
    colors,
    dark,
    handleFinishSetup,
    handlePressBack,
    handleSignOut,
    isUploadingPic,
    mode,
    navigation,
    params?.isEditing,
    t,
  ]);

  const avatarSize = Math.min(200, winWidth - grid * 10);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.avatarContainer}>
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
                  style={styles.avatar}
                />
              ) : params?.picturesTaken?.[0]?.localUri ? (
                <Avatar.Image
                  ImageComponent={FastImage}
                  size={avatarSize}
                  source={{ uri: params.picturesTaken[0].localUri }}
                  style={styles.avatar}
                />
              ) : authStore.user.pictureUri ? (
                <Avatar.Image
                  ImageComponent={FastImage}
                  size={avatarSize}
                  source={{ uri: transformUri(authStore.user.pictureUri, { width: avatarSize }) }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Icon
                  color={colors.textOnPrimary}
                  icon='image-plus'
                  size={avatarSize}
                  style={styles.avatar}
                />
              )}
            </TouchableOpacity>

            {pictureUri ?? params?.picturesTaken?.[0] ? (
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
          <HelperText
            style={[styles.avatarHelper, { marginTop: grid, marginBottom: gridBigger }]}
            type='info'
            visible
          >
            {t('label.tapToChangeIt')}
          </HelperText>

          <TextInput
            autoCapitalize='sentences'
            blurOnSubmit
            disabled={isUploadingPic}
            error={!!errorMessage}
            label={t('label.userName')}
            maxLength={USER_NAME_MAX_LENGTH}
            mode='outlined'
            returnKeyType='done'
            {...nameInput}
          />
          <HelperText type={errorMessage ? 'error' : 'info'} visible>
            {errorMessage ||
              (nameInput.value.trim().length
                ? t('helper.charactersLeft', { count: USER_NAME_MAX_LENGTH - nameInput.value.trim().length })
                : t('helper.charactersBetween', { min: USER_NAME_MIN_LENGTH, max: USER_NAME_MAX_LENGTH }))}
          </HelperText>
        </View>

        {!params?.isEditing ? (
          <Button
            disabled={isUploadingPic}
            labelStyle={{ color: isUploadingPic ? colors.disabled : colors.textOnPrimary }}
            loading={isUploadingPic}
            mode='contained'
            onPress={handleFinishSetup}
            style={styles.button}
          >
            {t('label.continue')}
          </Button>
        ) : null}
      </SafeAreaView>
    </ScrollView>
  );
};

export default CreateProfile;
