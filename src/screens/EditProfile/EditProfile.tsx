import React, { FC, useEffect, useState } from 'react';
import { Alert, BackHandler, View } from 'react-native';

import FastImage from 'react-native-fast-image';
import FileSystem from 'react-native-fs';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import { Avatar, Button, FAB as Fab, HelperText, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import CameraRoll from '@react-native-community/cameraroll';

import { USER_NAME_MAX_LENGTH } from '!/config';
import { useBackHandlerOnFocus } from '!/hooks/use-back-handler';
import useDimensions from '!/hooks/use-dimensions';
import useInput from '!/hooks/use-input';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { userUpdater } from '!/models/UserModel';
import { uploadMedia } from '!/services/remote-media';
import { useStores } from '!/stores';
import { MainNavigationProp, MainRouteProp, StackHeaderRightProps } from '!/types';

import styles from './styles';

interface Props {
  navigation: MainNavigationProp<'EditProfile'>;
  route: MainRouteProp<'EditProfile'>;
}

const EditProfile: FC<Props> = ({ navigation, route }) => {
  const database = useDatabase();
  const [winWidth] = useDimensions('window');
  const { authStore, syncStore } = useStores();
  const { colors, dark, grid, gridBigger } = useTheme();
  const { t } = useTranslation();

  const { params } = route;

  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [nameError, setNameError] = useState('');

  const nameInput = useInput(authStore.user.name, () => setNameError(''));

  const handleChangePicture = usePress(() => {
    requestAnimationFrame(() => {
      navigation.navigate('Camera', {
        screenNameAfterPicture: 'EditProfile',
        disableRecordVideo: true,
        initialCameraType: 'front',
        showCameraMask: true,
      });
    });
  });

  const handleDiscardPicture = usePress(async () => {
    requestAnimationFrame(() => {
      navigation.setParams({ ...params, picturesTaken: undefined });
    });

    try {
      const file = params!.picturesTaken![0].uri!;
      const fileInfo = await FileSystem.stat(file);

      await CameraRoll.deletePhotos([fileInfo.originalFilepath]);
      await FileSystem.unlink(fileInfo.originalFilepath);
    } catch (err) {
      console.log(err);
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
              navigation.setParams({ ...params, picturesTaken: undefined });
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

      if (!name) {
        setNameError(t('helper.fieldRequired'));
        return;
      }

      setIsUploadingPic(true);

      let remoteUri: string | undefined;

      // Upload picture
      if (params?.picturesTaken?.[0]) {
        const res = await uploadMedia(params.picturesTaken[0].uri!);
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
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      });
    } catch (e) {
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

  useBackHandlerOnFocus(() => {
    if (params?.isEditing) {
      return false;
    }
    Alert.alert(t('title.closeTheApp'), t('alert.youCanAlwaysChangeYourProfileLater'), [
      { text: t('label.no') },
      { text: t('label.yes'), onPress: () => BackHandler.exitApp() },
    ]);
    return true;
  }, [params?.isEditing, t]);

  useEffect(() => {
    navigation.setOptions({
      headerShown: params?.isEditing,
      headerRight: !params?.isEditing
        ? ({ tintColor }: StackHeaderRightProps) => (
            <Button
              color={dark ? colors.primary : tintColor}
              disabled={isUploadingPic}
              onPress={handleSignOut}
            >
              {t('signOut')}
            </Button>
          )
        : undefined,
    });
  }, [colors.primary, dark, handleSignOut, isUploadingPic, navigation, params?.isEditing, t]);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.avatarContainer}>
            <TouchableOpacity
              delayLongPress={600}
              disabled={isUploadingPic}
              onLongPress={handleRemoveSavedPicture}
              onPress={handleChangePicture}
            >
              {params?.picturesTaken?.[0] ? (
                <Avatar.Image
                  ImageComponent={FastImage}
                  size={Math.min(200, winWidth - grid * 10)}
                  source={{ uri: params.picturesTaken[0].uri }}
                  style={styles.avatar}
                />
              ) : authStore.user.pictureUri ? (
                <Avatar.Image
                  ImageComponent={FastImage}
                  size={Math.min(200, winWidth - grid * 10)}
                  source={{ uri: authStore.user.pictureUri }}
                  style={styles.avatar}
                />
              ) : (
                <Avatar.Icon
                  color={colors.textOnPrimary}
                  icon='image-plus'
                  size={Math.min(200, winWidth - grid * 10)}
                  style={styles.avatar}
                />
              )}
            </TouchableOpacity>

            {params?.picturesTaken?.[0] ? (
              <Fab
                color={colors.textOnAccent}
                disabled={isUploadingPic}
                icon='close'
                onPress={handleDiscardPicture}
                small
                style={styles.fabDiscardPicture}
              />
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
            error={!!nameError}
            label={t('label.userName')}
            maxLength={USER_NAME_MAX_LENGTH}
            mode='outlined'
            returnKeyType='done'
            {...nameInput}
          />
          <HelperText type='error' visible>
            {nameError || null}
          </HelperText>
        </View>

        <Button
          disabled={isUploadingPic}
          labelStyle={{ color: isUploadingPic ? colors.disabled : colors.textOnPrimary }}
          loading={isUploadingPic}
          mode='contained'
          onPress={handleFinishSetup}
          style={styles.button}
        >
          {t(params?.isEditing ? 'label.save' : 'label.continue')}
        </Button>
      </SafeAreaView>
    </ScrollView>
  );
};

export default EditProfile;
