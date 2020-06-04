import React, { FC, RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  BackHandler,
  InteractionManager,
  StatusBar,
  View,
} from 'react-native';

import { FlashMode, RNCamera, WhiteBalance } from 'react-native-camera';
import FileSystem from 'react-native-fs';
import { Appbar, Button, Colors, Title } from 'react-native-paper';
import Animated, { Easing, timing } from 'react-native-reanimated';
import { useValue } from 'react-native-redash';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CameraRoll from '@react-native-community/cameraroll';

import { ATTACHMENT_MAX_AMOUNT, VIDEO_MAX_DURATION } from '!/config';
import useDimensions from '!/hooks/use-dimensions';
import useFocusEffect from '!/hooks/use-focus-effect';
import useMethod from '!/hooks/use-method';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { useStores } from '!/stores';
import { HeaderOptions, MainNavigationProp, MainRouteProp } from '!/types';
import getStatusBarColor from '!/utils/get-status-bar-color';
import { requestCameraPermission, requestStoragePermission } from '!/utils/permissions';

import CameraButtons from './CameraButtons';
import CameraContainer from './CameraContainer';
import PictureList from './PictureList';
import styles from './styles';
import { CameraIds, PicturesTaken, VideoRecorded } from './types';

interface Props {
  navigation: MainNavigationProp<'Camera'>;
  route: MainRouteProp<'Camera'>;
}

// Main component
const Camera: FC<Props> = ({ navigation, route }) => {
  const [winWidth, winHeight, isLandscape] = useDimensions('window');
  const { generalStore } = useStores();
  const { animation, colors, dark, mode } = useTheme();
  const { t } = useTranslation();

  const { params } = route;

  // Shoot/Record icon animation
  const isRecordingAnim = useValue<number>(1);
  const isTakingPictureAnim = useValue<number>(1);

  const messageSaved = useRef('');

  // Camera state and options
  const [isCameraAvailable, setIsCameraAvailable] = useState(false);
  const [storageGranted, setStorageGranted] = useState<boolean | null>(null);
  const [cameraGranted, setCameraGranted] = useState<boolean | null>(null);
  const [audioEnabled, setAudioEnabled] = useState<boolean | null>(null);
  const [cameraAspectRatio] = useState('4:3');

  const cameraRef = useRef<RNCamera | null>(null);
  const isTakingPicture = useRef(false);
  const isRecording = useRef(false);
  const elapsedInterval = useRef<NodeJS.Timeout | null>(null);

  // Pictures
  const [picsTaken, setPicsTaken] = useState<PicturesTaken[]>([]);

  // Update on camera status change or on camera change
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraIds, setCameraIds] = useState<CameraIds[] | null>(null);
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [flashMode, setFlashMode] = useState<keyof FlashMode>('off');
  const [whiteBalance, setWhiteBalance] = useState<keyof WhiteBalance>('auto');
  const [elapsed, setElapsed] = useState(-1);

  // Handlers for the state setters
  const handleSetActiveCameraId = useCallback((value: string) => setActiveCameraId(value), []);
  const handleSetCameraIds = useCallback((value: CameraIds[]) => setCameraIds(value), []);
  const handleSetIsCameraReady = useCallback(
    (status: boolean, cameraRefObj?: RefObject<RNCamera>) => {
      setIsCameraReady(status);
      if (cameraRefObj?.current) {
        cameraRef.current = cameraRefObj.current;
      }
    },
    [],
  );
  const handleSetAudioEnabled = useCallback((value: boolean) => setAudioEnabled(value), []);
  const handleSaveMessage = useCallback((message?: string) => {
    messageSaved.current = message?.trim() ?? '';
  }, []);

  // Helpers
  const isCameraBusy = !isCameraReady || elapsed >= 0;
  const pictureSelectedAmount = picsTaken.filter((e) => e.isSelected).length;

  const handleGoToPreparePicture = usePress((pictures?: PicturesTaken[]) => {
    requestAnimationFrame(() => {
      navigation.navigate('PreparePicture', {
        roomId: params.roomId,
        roomTitle: params.roomTitle,
        roomPictureUri: params.roomPictureUri,
        skipStatusBar: true,
        initialMessage: messageSaved.current,
        picturesTaken: pictures || picsTaken,
        handleSaveMessage,
        handleClearPicturesTaken,
        handleTogglePictureSelection,
      });
    });
  });

  // Handlers
  const handleTakePicture = usePress(async () => {
    if (!cameraRef.current || isTakingPicture.current) {
      return;
    }
    isTakingPicture.current = true;

    timing(isTakingPictureAnim, {
      toValue: 0.5,
      duration: animation.scale * 200,
      easing: Easing.linear,
    }).start();

    try {
      // Get image from app folder
      const pictureTaken = await cameraRef.current.takePictureAsync({
        quality: 0.66,
        orientation: 'auto',
        writeExif: true,
      });

      const { uri, width, height, deviceOrientation } = pictureTaken;

      // Save to camera roll
      const rollUri = await CameraRoll.saveToCameraRoll(uri, 'photo');

      const notAboveMax = pictureSelectedAmount < ATTACHMENT_MAX_AMOUNT;

      // deviceOrientation = 1 | 2 | 3 | 4;
      // 'landscapeLeft' | 'landscapeRight' | 'portrait' | 'portraitUpsideDown'
      const newPic: PicturesTaken = {
        uri: rollUri,
        width: [3, 4].includes(deviceOrientation) ? width : height,
        height: [3, 4].includes(deviceOrientation) ? height : width,
        isSelected: notAboveMax,
      };

      if (picsTaken.length === 0) {
        // Go to screen passing newly added picture
        handleGoToPreparePicture(picsTaken.concat(newPic));
      }

      requestAnimationFrame(() => {
        setPicsTaken((prev) => prev.concat(newPic));
      });

      // Delete image from app folder
      await FileSystem.unlink(uri);
    } catch (err) {
      console.error(err);
    } finally {
      isTakingPicture.current = false;

      isTakingPictureAnim.setValue(1);
    }
  });

  const handleRecordingStart = useCallback(() => {
    isRecording.current = true;

    if (elapsedInterval.current) {
      clearInterval(elapsedInterval.current);
    }

    // Start with zero so it will be visible
    setElapsed(0);
    elapsedInterval.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    timing(isRecordingAnim, {
      toValue: 1.3,
      duration: animation.scale * 200,
      easing: Easing.linear,
    }).start();
  }, [animation.scale, isRecordingAnim]);

  const handleRecordingEnd = useCallback(() => {
    if (!isRecording.current) {
      return false;
    }
    isRecording.current = false;

    if (elapsedInterval.current) {
      clearInterval(elapsedInterval.current);
      setElapsed(-1);
    }

    timing(isRecordingAnim, {
      toValue: 1,
      duration: animation.scale * 200,
      easing: Easing.linear,
    }).start();

    return true;
  }, [animation.scale, isRecordingAnim]);

  const handleShootVideo = usePress(async () => {
    if (!cameraRef.current || isRecording.current) {
      handleStopShootingVideo();
    }
    isRecording.current = true;

    try {
      const quality = '1080p';
      const dimensions = {
        '2160p': { width: 3840, height: 2160 },
        '1080p': { width: 1920, height: 1080 },
        '720p': { width: 1280, height: 720 },
        '480p': { width: 640, height: 480 },
        '4:3': { width: 640, height: 480 },
        '288p': { width: 352, height: 288 },
      };

      const { uri, deviceOrientation } = await cameraRef.current!.recordAsync({
        quality,
        maxDuration: VIDEO_MAX_DURATION,
        orientation: 'auto',
      });

      // Save to camera roll
      const rollUri = await CameraRoll.saveToCameraRoll(uri, 'video');

      const { width, height } = dimensions[quality];

      // deviceOrientation = 1 | 2 | 3 | 4;
      // 'landscapeLeft' | 'landscapeRight' | 'portrait' | 'portraitUpsideDown'
      const videoRecorded: VideoRecorded = {
        uri: rollUri,
        width: [3, 4].includes(deviceOrientation) ? width : height,
        height: [3, 4].includes(deviceOrientation) ? height : width,
      };

      requestAnimationFrame(() => {
        navigation.navigate('PrepareVideo', {
          roomId: params.roomId,
          roomTitle: params.roomTitle,
          roomPictureUri: params.roomPictureUri,
          videoRecorded,
        });
      });

      // Delete video from app folder
      await FileSystem.unlink(uri);
    } catch (err) {
      console.warn('VIDEO RECORD FAIL', err);
    }
  });

  const handleStopShootingVideo = usePress(() => {
    if (!isRecording.current) {
      return false;
    }
    cameraRef.current?.stopRecording();
    return true;
  });

  // Loop through available cameras
  const handleChangeCamera = usePress(() => {
    if (isTakingPicture.current || isRecording.current) {
      return;
    }
    requestAnimationFrame(() => {
      setIsCameraReady(false);
      setFlashMode('off');
      setWhiteBalance('auto');

      void InteractionManager.runAfterInteractions(() => {
        if (!cameraIds?.length) {
          setActiveCameraId(null);
          return;
        }
        const index = cameraIds.findIndex((each: CameraIds) => each.id === activeCameraId) + 1;
        setActiveCameraId(cameraIds[index % cameraIds.length].id);
      });
    });
  });

  const handleToggleFlash = usePress(() => {
    if (isTakingPicture.current || isRecording.current) {
      return;
    }
    requestAnimationFrame(() => {
      if (flashMode === 'torch') {
        setFlashMode('off');
        return;
      }
      if (flashMode === 'off') {
        setFlashMode('auto');
        return;
      }
      if (flashMode === 'auto') {
        setFlashMode('on');
        return;
      }
      if (flashMode === 'on') {
        setFlashMode('torch');
        return;
      }
    });
  });

  const handleChangeWhiteBalance = usePress(() => {
    if (isTakingPicture.current || isRecording.current) {
      return;
    }
    if (whiteBalance === 'auto') {
      setWhiteBalance('sunny');
      return;
    }
    if (whiteBalance === 'sunny') {
      setWhiteBalance('cloudy');
      return;
    }
    if (whiteBalance === 'cloudy') {
      setWhiteBalance('shadow');
      return;
    }
    if (whiteBalance === 'shadow') {
      setWhiteBalance('incandescent');
      return;
    }
    if (whiteBalance === 'incandescent') {
      setWhiteBalance('fluorescent');
      return;
    }
    if (whiteBalance === 'fluorescent') {
      setWhiteBalance('auto');
      return;
    }
  });

  const whiteBalanceIcon = useMemo(() => {
    if (whiteBalance === 'cloudy') {
      return 'cloud';
    }
    if (whiteBalance === 'fluorescent') {
      return 'white-balance-iridescent';
    }
    if (whiteBalance === 'incandescent') {
      return 'white-balance-incandescent';
    }
    if (whiteBalance === 'shadow') {
      return 'box-shadow';
    }
    if (whiteBalance === 'sunny') {
      return 'white-balance-sunny';
    }
    return 'white-balance-auto';
  }, [whiteBalance]);

  const handleTogglePictureSelection = useMethod((index: number) => {
    requestAnimationFrame(() => {
      setPicsTaken((prev) => {
        const next = [...prev];
        if (next[index].isSelected === false) {
          const notAboveMax = pictureSelectedAmount + 1 < ATTACHMENT_MAX_AMOUNT;
          next[index].isSelected = notAboveMax;
        } else {
          next[index].isSelected = false;
        }
        return next;
      });
    });
  });

  const handleClearPicturesTaken = useCallback(() => {
    isTakingPictureAnim.setValue(1);

    requestAnimationFrame(() => {
      setPicsTaken([]);
      isTakingPicture.current = false;
      generalStore.setFab();
    });
  }, [generalStore, isTakingPictureAnim]);

  const handlePressBack = usePress(() => {
    handleStopShootingVideo();

    if (picsTaken.length > 0) {
      handleClearPicturesTaken();
      return;
    }

    StatusBar.setBackgroundColor(getStatusBarColor(4, colors, dark, mode));
    StatusBar.setTranslucent(false);

    messageSaved.current = '';
    requestAnimationFrame(() => {
      navigation.goBack();
    });
  });

  // Stop recording if app is no longer active
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background') {
        handleStopShootingVideo();
        if (elapsedInterval.current) {
          clearInterval(elapsedInterval.current);
        }
      }
    },
    [handleStopShootingVideo],
  );

  useEffect(() => {
    AppState.addEventListener('change', handleAppStateChange);
    return () => {
      AppState.removeEventListener('change', handleAppStateChange);
    };
  }, [handleAppStateChange]);

  useEffect(() => {
    navigation.setOptions({
      handlePressBack,
      headerCenter: () =>
        isCameraAvailable ? (
          <View style={styles.elapsedTimeContainer}>
            {elapsed >= 0 ? (
              <Title style={styles.elapsedTime}>
                {new Date(elapsed * 1000).toISOString().substr(14, 5)}
              </Title>
            ) : null}
            {elapsed >= 0 && !audioEnabled ? (
              <Icon name='microphone-off' style={styles.microphoneIcon} />
            ) : null}
          </View>
        ) : null,
      headerRight: () =>
        isCameraAvailable ? (
          <Animated.View style={{ opacity: isTakingPictureAnim }}>
            <Appbar.Action
              animated
              color={Colors.white}
              disabled={isCameraBusy}
              icon={whiteBalanceIcon}
              onPress={handleChangeWhiteBalance}
              size={24}
            />
          </Animated.View>
        ) : null,
    } as HeaderOptions);
  }, [
    audioEnabled,
    elapsed,
    handleChangeWhiteBalance,
    handlePressBack,
    isCameraAvailable,
    isCameraBusy,
    isTakingPictureAnim,
    navigation,
    whiteBalanceIcon,
  ]);

  // Ask for permission on focus, stop recording on blur
  useFocusEffect(() => {
    requestAnimationFrame(() => {
      StatusBar.setBackgroundColor('rgba(0,0,0,0.6)');
      StatusBar.setTranslucent(true);
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      messageSaved.current = '';
      if (picsTaken.length > 0) {
        handleClearPicturesTaken();
        return true;
      }
      StatusBar.setBackgroundColor(getStatusBarColor(4, colors, dark, mode));
      StatusBar.setTranslucent(false);
      return false;
    });

    void InteractionManager.runAfterInteractions(async () => {
      const storageStatus = await requestStoragePermission();
      setStorageGranted(storageStatus);
      if (!storageStatus) {
        return;
      }

      const cameraStatus = await requestCameraPermission();
      setCameraGranted(cameraStatus);
      if (!cameraStatus) {
        return;
      }

      if (storageStatus && cameraStatus) {
        setIsCameraAvailable(true);
      }
    });

    return () => {
      backHandler.remove();
      handleStopShootingVideo();
      if (elapsedInterval.current) {
        clearInterval(elapsedInterval.current);
      }
    };
  }, [colors, dark, handleClearPicturesTaken, handleStopShootingVideo, mode, picsTaken.length]);

  return (
    <View style={styles.container}>
      {storageGranted === false ? (
        <View style={styles.fullCenter}>
          <Title>{t('error.storagePermission')}</Title>
          <Button
            labelStyle={{ color: colors.textOnPrimary }}
            mode='contained'
            onPress={handlePressBack}
            style={styles.buttonPermission}
          >
            {t('label.goBack')}
          </Button>
        </View>
      ) : cameraGranted === false ? (
        <View style={styles.fullCenter}>
          <Title>{t('error.cameraPermission')}</Title>
          <Button
            labelStyle={{ color: colors.textOnPrimary }}
            mode='contained'
            onPress={handlePressBack}
            style={styles.buttonPermission}
          >
            {t('label.goBack')}
          </Button>
        </View>
      ) : isCameraAvailable ? (
        <CameraContainer
          activeCameraId={activeCameraId}
          cameraAspectRatio={cameraAspectRatio}
          flashMode={flashMode}
          handleRecordingEnd={handleRecordingEnd}
          handleRecordingStart={handleRecordingStart}
          handleSetActiveCameraId={handleSetActiveCameraId}
          handleSetAudioEnabled={handleSetAudioEnabled}
          handleSetCameraIds={handleSetCameraIds}
          handleSetIsCameraReady={handleSetIsCameraReady}
          handleStopRecording={handleStopShootingVideo}
          isLandscape={isLandscape}
          whiteBalance={whiteBalance}
          winHeight={winHeight}
          winWidth={winWidth}
        >
          <CameraButtons
            flashMode={flashMode}
            handleChangeCamera={handleChangeCamera}
            handleShootVideo={handleShootVideo}
            handleTakePicture={handleTakePicture}
            handleToggleFlash={handleToggleFlash}
            isCameraBusy={isCameraBusy}
            isCameraReady={isCameraReady}
            isRecordingAnim={isRecordingAnim}
            isTakingPictureAnim={isTakingPictureAnim}
          />
        </CameraContainer>
      ) : null}

      {picsTaken.length > 0 && (
        <PictureList
          handleClearPicturesTaken={handleClearPicturesTaken}
          handleGoToPreparePicture={handleGoToPreparePicture}
          handleTogglePictureSelection={handleTogglePictureSelection}
          picsTaken={picsTaken}
        />
      )}
    </View>
  );
};

export default Camera;
