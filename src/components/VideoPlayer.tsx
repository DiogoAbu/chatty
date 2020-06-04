import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  InteractionManager,
  LayoutChangeEvent,
  StatusBar,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { TouchableOpacity } from 'react-native-gesture-handler';
import Orientation from 'react-native-orientation';
import { Colors, Text } from 'react-native-paper';
import Animated, { Easing, timing } from 'react-native-reanimated';
import { useValue } from 'react-native-redash';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Video, { OnLoadData, OnProgressData } from 'react-native-video';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';

import { VIDEO_CONTROL_VISIBLE_TIMEOUT } from '!/config';
import useDimensions from '!/hooks/use-dimensions';
import useFocusEffect from '!/hooks/use-focus-effect';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import AttachmentModel from '!/models/AttachmentModel';
import { DeepPartial } from '!/types';
import getNormalizedSize from '!/utils/get-normalized-size';
import getStatusBarColor from '!/utils/get-status-bar-color';

type Orientations = 'LANDSCAPE' | 'PORTRAIT' | 'UNKNOWN' | 'PORTRAITUPSIDEDOWN';

interface Props {
  video: DeepPartial<AttachmentModel>;
  onShowHideOverlay?: (state: boolean) => void;
  onShowHideControl?: (state: boolean) => void;
  onShowHideStatusBar?: (state: boolean) => void;
}

const VideoPlayer: FC<Props> = ({
  video,
  onShowHideOverlay,
  onShowHideControl,
  onShowHideStatusBar,
}) => {
  const [winWidth, winHeight, isLandscape] = useDimensions('window');
  const navigation = useNavigation();
  const { colors, dark, mode, animation } = useTheme();

  const controlValue = useValue(1);

  const videoRef = useRef<Video | null>(null);
  const showingControlTimer = useRef<NodeJS.Timeout | null>(null);
  const initialOrientation = useRef<Orientations | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingOverlay, setIsShowingOverlay] = useState(true);
  const [isShowingControl, setIsShowingControl] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playFromBeginning, setPlayFromBeginning] = useState(false);

  const animateControl = useCallback(
    (toValue: number) => {
      timing(controlValue, {
        duration: animation.scale * 100,
        easing: Easing.linear,
        toValue,
      }).start();
    },
    [animation.scale, controlValue],
  );

  const controlTimeout = useCallback(() => {
    if (showingControlTimer.current) {
      clearTimeout(showingControlTimer.current);
    }
    if (isShowingControl) {
      showingControlTimer.current = setTimeout(() => {
        animateControl(0);
        setIsShowingControl(false);
      }, VIDEO_CONTROL_VISIBLE_TIMEOUT);
    }
    return () => {
      if (showingControlTimer.current) {
        clearTimeout(showingControlTimer.current);
      }
    };
  }, [animateControl, isShowingControl]);

  const handlePressShowControl = usePress(() => {
    animateControl(isShowingControl ? 0 : 1);
    setIsShowingOverlay(true);
    setIsShowingControl((prev) => !prev);
  });

  const handlePressPlay = usePress(() => {
    controlTimeout();
    setIsShowingOverlay(false);
    if (playFromBeginning && videoRef.current) {
      videoRef.current.seek(0);
      setPlayFromBeginning(false);
    }
    requestAnimationFrame(() => {
      setIsPlaying((prev) => !prev);
    });
  });

  const handlePressPlayOverlay = usePress(() => {
    if (playFromBeginning && videoRef.current) {
      videoRef.current.seek(0);
      setPlayFromBeginning(false);
    }
    requestAnimationFrame(() => {
      if (!isPlaying) {
        // Hide cause we're gonna play it
        setIsShowingOverlay(false);
      }
      setIsPlaying((prev) => !prev);
    });
  });

  const handlePlayEnd = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
    setPlayFromBeginning(true);
  }, []);

  const handlePlayError = useCallback(() => {
    Alert.alert('', 'Video playblack failed', [{ onPress: () => navigation.goBack() }]);
  }, [navigation]);

  const handleLoaded = useCallback((data: OnLoadData) => {
    setDuration(data.duration);
  }, []);

  const handleProgressChanged = useCallback(
    (data: OnProgressData) => {
      if (isPlaying) {
        setCurrentTime(data.currentTime);
      }
    },
    [isPlaying],
  );

  const handleSliderValueChanged = useCallback(
    (sliderValue: number) => {
      controlTimeout();
      if (!videoRef.current) {
        return;
      }

      videoRef.current.seek(sliderValue);

      setCurrentTime(sliderValue);
      setIsPlaying(true);
    },
    [controlTimeout],
  );

  const handleOnLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;

      if (width > height) {
        StatusBar.setHidden(true);
        onShowHideStatusBar?.(true);
      } else {
        StatusBar.setHidden(false);
        onShowHideStatusBar?.(false);
      }

      Orientation.unlockAllOrientations();
    },
    [onShowHideStatusBar],
  );

  useEffect(controlTimeout, [controlTimeout]);

  useFocusEffect(() => {
    initialOrientation.current = Orientation.getInitialOrientation();

    void InteractionManager.runAfterInteractions(() => {
      Orientation.unlockAllOrientations();
      StatusBar.setBackgroundColor('rgba(0,0,0,0.6)');
      StatusBar.setTranslucent(true);
      setIsReady(true);
    });

    return () => {
      StatusBar.setBackgroundColor(getStatusBarColor(4, colors, dark, mode));
      StatusBar.setTranslucent(false);
      StatusBar.setHidden(false);
      setIsReady(false);
      if (initialOrientation.current === 'LANDSCAPE') {
        Orientation.lockToLandscape();
      } else {
        Orientation.lockToPortrait();
      }
    };
  }, [colors, dark, mode]);

  useEffect(() => {
    onShowHideOverlay?.(isShowingOverlay);
  }, [isShowingOverlay, onShowHideOverlay]);

  useEffect(() => {
    onShowHideControl?.(isShowingControl);
  }, [isShowingControl, onShowHideControl]);

  if (!isReady) {
    return <View style={styles.container} />;
  }

  const { aspectRatio, height, width } = getNormalizedSize(video, {
    winWidth,
    winHeight,
    isLandscape,
  });

  const overlayColor = isShowingOverlay || !isPlaying ? 'rgba(0, 0, 0, 0.3)' : 'transparent';

  // const translateY = controlValue.interpolate({ inputRange: [0, 1], outputRange: [50, 0] });

  return (
    <View onLayout={handleOnLayout} style={styles.container}>
      <Video
        ignoreSilentSwitch='ignore'
        muted={false}
        onEnd={handlePlayEnd}
        onError={handlePlayError}
        onLoad={handleLoaded}
        onProgress={handleProgressChanged}
        paused={!isPlaying}
        playInBackground={false}
        playWhenInactive={false}
        progressUpdateInterval={250.0}
        rate={1.0}
        ref={videoRef}
        resizeMode='contain'
        source={{ uri: video.uri }}
        style={{ width, height, aspectRatio, backgroundColor: Colors.black }}
        volume={1.0}
      />

      <TouchableWithoutFeedback onPress={handlePressShowControl}>
        <View
          style={[
            { width, height, aspectRatio, backgroundColor: overlayColor },
            styles.overlayContainer,
          ]}
        >
          {isShowingOverlay || !isPlaying ? (
            <TouchableWithoutFeedback onPress={handlePressPlayOverlay}>
              <Icon name={isPlaying ? 'pause-circle' : 'play-circle'} style={styles.playIcon} />
            </TouchableWithoutFeedback>
          ) : null}
        </View>
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.controlContainer,
          isLandscape && styles.controlContainerBottom,
          { width, opacity: controlValue },
        ]}
      >
        <TouchableOpacity activeOpacity={0.3} onPress={handlePressPlay}>
          <Icon name={isPlaying ? 'pause-circle' : 'play-circle'} style={styles.playPauseIcon} />
        </TouchableOpacity>

        <Text style={styles.time}>{new Date(currentTime * 1000).toISOString().substr(14, 5)}</Text>

        <Slider
          maximumTrackTintColor={Colors.grey100}
          maximumValue={duration}
          minimumTrackTintColor={colors.primary}
          minimumValue={0}
          onValueChange={handleSliderValueChanged}
          style={styles.slider}
          thumbTintColor={Colors.white}
          value={currentTime}
        />

        <Text style={styles.time}>{new Date(duration * 1000).toISOString().substr(14, 5)}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
    position: 'relative',
  },

  overlayContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    color: Colors.white,
    fontSize: 64,
  },

  controlContainer: {
    height: 50,
    marginTop: -50,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.66)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlContainerBottom: {
    position: 'absolute',
    bottom: 0,
  },
  playPauseIcon: {
    color: Colors.white,
    fontSize: 40,
  },
  slider: {
    flex: 1,
  },
  time: {
    color: Colors.white,
    marginLeft: 12,
    marginRight: 12,
  },
  fullscreenIcon: {
    color: Colors.white,
    fontSize: 32,
  },
});

export default VideoPlayer;
