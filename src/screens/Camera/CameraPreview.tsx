import React, { FC, memo, RefObject, useCallback, useRef, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { FlashMode, RNCamera, WhiteBalance } from 'react-native-camera';
import { call, Node, useCode } from 'react-native-reanimated';

import styles from './styles';
import { CameraIds } from './types';

const MIN_ZOOM = 0;
const MAX_ZOOM = 8;

const BACK_TYPE = RNCamera.Constants.Type.back;
const FRONT_TYPE = RNCamera.Constants.Type.front;

const getCameraType = (type: string) => {
  if (type === 'AVCaptureDeviceTypeBuiltInTelephotoCamera') {
    return 'zoomed';
  }
  if (type === 'AVCaptureDeviceTypeBuiltInUltraWideCamera') {
    return 'wide';
  }

  return 'normal';
};

interface Props {
  translationY: Node<number>;

  activeCameraId: string | null;
  flashMode: keyof FlashMode;
  whiteBalance: keyof WhiteBalance;
  cameraAspectRatio: string;
  cameraStyle: StyleProp<ViewStyle>;
  initialCameraType?: 'front' | 'back';

  handleSetActiveCameraId: (activeId: string) => any;
  handleSetCameraIds: (ids: CameraIds[]) => any;
  handleSetIsCameraReady: (status: boolean, cameraRef?: RefObject<RNCamera>) => any;
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

const CameraPreview: FC<Props> = ({
  translationY,
  flashMode,
  whiteBalance,
  cameraAspectRatio,
  cameraStyle,
  activeCameraId,
  initialCameraType,
  handleSetIsCameraReady,
  handleSetCameraIds,
  handleSetActiveCameraId,
  handleSetAudioEnabled,
  handleRecordingStart,
  handleRecordingEnd,
}) => {
  const [zoom, setZoom] = useState(0);

  const cameraRef = useRef<RNCamera | null>(null);

  const handleCameraReady = useCallback(() => {
    handleSetIsCameraReady(true, cameraRef);
  }, [handleSetIsCameraReady]);

  const handleStatusChange = useCallback(
    async (camera: {
      cameraStatus: 'READY' | 'PENDING_AUTHORIZATION' | 'NOT_AUTHORIZED';
      recordAudioPermissionStatus: 'PENDING_AUTHORIZATION' | 'NOT_AUTHORIZED' | 'AUTHORIZED';
    }) => {
      if (camera.cameraStatus !== 'READY' || !cameraRef.current) {
        handleSetIsCameraReady(false);
        return;
      }

      handleSetAudioEnabled(camera.recordAudioPermissionStatus !== 'NOT_AUTHORIZED');

      let ids: CameraIds[] = [];
      let activeId = '';

      try {
        // @ts-ignore
        ids = (await cameraRef.current.getCameraIdsAsync()).map((each: any) => {
          // Set back camera as active
          if (each.type === BACK_TYPE) {
            activeId = each.id;
          }
          each.cameraType = getCameraType(each.deviceType);
          return each;
        });

        // Check if any camera is active
        if (ids.length && !activeId) {
          activeId = ids[0].id;
        }
      } catch (err) {
        console.error('Failed to get camera ids', err);
      }

      // sort ids so front cameras are first
      ids.sort((a, b) => Number(b.type === FRONT_TYPE) - Number(a.type === FRONT_TYPE));

      handleSetCameraIds(ids);
      handleSetActiveCameraId(activeId);
    },
    [handleSetActiveCameraId, handleSetCameraIds, handleSetIsCameraReady, handleSetAudioEnabled],
  );

  const handleAudioConnected = useCallback(() => {
    handleSetAudioEnabled(true);
  }, [handleSetAudioEnabled]);

  const handleAudioInterrupted = useCallback(() => {
    handleSetAudioEnabled(false);
  }, [handleSetAudioEnabled]);

  useCode(() => {
    return call([translationY], (y) => {
      const value = y[0];
      setZoom(value < MIN_ZOOM ? MIN_ZOOM : value > MAX_ZOOM ? MAX_ZOOM : value);
    });
  }, [translationY]);

  return (
    <RNCamera
      // @ts-ignore
      cameraId={activeCameraId}
      flashMode={flashMode}
      maxZoom={MAX_ZOOM}
      onAudioConnected={handleAudioConnected}
      onAudioInterrupted={handleAudioInterrupted}
      onCameraReady={handleCameraReady}
      onRecordingEnd={handleRecordingEnd}
      onRecordingStart={handleRecordingStart}
      onStatusChange={handleStatusChange}
      ratio={cameraAspectRatio}
      ref={cameraRef}
      style={[styles.camera, cameraStyle]}
      type={initialCameraType}
      useNativeZoom={false}
      whiteBalance={whiteBalance}
      zoom={zoom}
    />
  );
};

export default memo(CameraPreview);
