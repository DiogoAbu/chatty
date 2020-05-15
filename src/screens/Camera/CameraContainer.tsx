import React, { FC, memo, ReactNode, RefObject, useMemo } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { FlashMode, RNCamera, WhiteBalance } from 'react-native-camera';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  add,
  block,
  call,
  cond,
  divide,
  eq,
  multiply,
  set,
  useCode,
} from 'react-native-reanimated';
import { clamp, useGestureHandler, useValue } from 'react-native-redash';

import parseRatio from '!/utils/parse-ratio';

import CameraPreview from './CameraPreview';
import styles from './styles';
import { CameraIds } from './types';

interface Props {
  children?: ReactNode;

  activeCameraId: string | null;
  flashMode: keyof FlashMode;
  whiteBalance: keyof WhiteBalance;
  winWidth: number;
  winHeight: number;
  isLandscape: boolean;
  cameraAspectRatio: string;

  handleSetActiveCameraId: (activeId: string) => any;
  handleSetCameraIds: (ids: CameraIds[]) => any;
  handleSetIsCameraReady: (status: boolean, cameraRef?: RefObject<RNCamera>) => any;
  handleStopRecording: () => boolean;
  handleSetAudioEnabled: (status: boolean) => any;

  handleRecordingStart: (event: {
    nativeEvent: {
      uri: string;
      videoOrientation: number;
      deviceOrientation: number;
    };
  }) => void;
  handleRecordingEnd: () => void;
}

const CameraContainer: FC<Props> = ({
  children,
  activeCameraId,
  flashMode,
  whiteBalance,
  winWidth,
  winHeight,
  isLandscape,
  cameraAspectRatio,
  handleStopRecording,
  handleSetIsCameraReady,
  handleSetCameraIds,
  handleSetActiveCameraId,
  handleSetAudioEnabled,
  handleRecordingStart,
  handleRecordingEnd,
}) => {
  const state = useValue(State.UNDETERMINED);
  const translationY = useValue<number>(0);
  const offsetY = useValue<number>(0);

  const gestureHandler = useGestureHandler({ state, translationY });

  const transY = cond(
    eq(state, State.ACTIVE),
    clamp(add(offsetY, divide(multiply(translationY, -1), 100)), 0, 1),
    set(offsetY, clamp(add(offsetY, divide(multiply(translationY, -1), 100)), 0, 1)),
  );

  // Call function when the touch stops
  useCode(() => {
    return block([
      cond(
        eq(state, State.END),
        call([], () => {
          const wasRecording = handleStopRecording();
          if (wasRecording) {
            set(translationY, 0);
            set(offsetY, 0);
          }
        }),
      ),
    ]);
  }, [state, handleStopRecording, offsetY, translationY]);

  const cameraStyle = useMemo(() => {
    const style: StyleProp<ViewStyle> = {
      width: winWidth,
      height: winHeight,
      left: 0,
      top: 0,
    };

    const cameraRatio = parseRatio(cameraAspectRatio);

    if (isLandscape) {
      const cameraWidth = winHeight * cameraRatio;
      style.width = cameraWidth;
      style.left = (winWidth - cameraWidth) / 2;
    } else {
      const cameraHeight = winWidth * cameraRatio;
      style.height = cameraHeight;
      style.top = (winHeight - cameraHeight) / 2;
    }

    return style;
  }, [cameraAspectRatio, winHeight, isLandscape, winWidth]);

  return (
    <PanGestureHandler {...gestureHandler} maxPointers={1}>
      <Animated.View style={styles.gestureHandlerView}>
        <CameraPreview
          activeCameraId={activeCameraId}
          cameraAspectRatio={cameraAspectRatio}
          cameraStyle={cameraStyle}
          flashMode={flashMode}
          handleRecordingEnd={handleRecordingEnd}
          handleRecordingStart={handleRecordingStart}
          handleSetActiveCameraId={handleSetActiveCameraId}
          handleSetAudioEnabled={handleSetAudioEnabled}
          handleSetCameraIds={handleSetCameraIds}
          handleSetIsCameraReady={handleSetIsCameraReady}
          translationY={transY}
          whiteBalance={whiteBalance}
        />
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
};

export default memo(CameraContainer);
