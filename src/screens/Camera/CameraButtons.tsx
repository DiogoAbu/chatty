import React, { FC, memo, useMemo } from 'react';
import { View } from 'react-native';

import { FlashMode } from 'react-native-camera';
import { Colors, IconButton } from 'react-native-paper';
import Animated, { Value } from 'react-native-reanimated';

import styles from './styles';

interface Props {
  isCameraReady: boolean;
  isCameraBusy: boolean;
  flashMode: keyof FlashMode;
  isTakingPictureAnim: Value<number>;
  isRecordingAnim: Value<number>;

  handleToggleFlash: (...args: any) => any;
  handleTakePicture: (...args: any) => any;
  handleShootVideo: (...args: any) => any;
  handleChangeCamera: (...args: any) => any;
}

const CameraButtons: FC<Props> = ({
  isCameraReady,
  isCameraBusy,
  flashMode,
  isTakingPictureAnim,
  isRecordingAnim,
  handleToggleFlash,
  handleTakePicture,
  handleShootVideo,
  handleChangeCamera,
}) => {
  const flashIcon = useMemo(() => {
    if (flashMode === 'on') {
      return 'flash';
    }
    if (flashMode === 'off') {
      return 'flash-off';
    }
    if (flashMode === 'torch') {
      return 'flashlight';
    }
    return 'flash-auto';
  }, [flashMode]);

  return (
    <View style={styles.buttonsContainer}>
      <Animated.View style={{ opacity: isTakingPictureAnim }}>
        <IconButton
          animated
          color={Colors.white}
          disabled={isCameraBusy}
          icon={flashIcon}
          onPress={handleToggleFlash}
          size={24}
        />
      </Animated.View>

      <Animated.View style={{ transform: [{ scale: isRecordingAnim }] } as any}>
        <IconButton
          color={Colors.white}
          disabled={!isCameraReady}
          icon='radiobox-marked'
          onLongPress={handleShootVideo}
          onPress={handleTakePicture}
          size={64}
          style={styles.shutterIcon}
        />
      </Animated.View>

      <Animated.View style={{ opacity: isTakingPictureAnim }}>
        <IconButton
          color={Colors.white}
          disabled={isCameraBusy}
          icon='camera-party-mode'
          onPress={handleChangeCamera}
          size={24}
        />
      </Animated.View>
    </View>
  );
};

export default memo(CameraButtons);
