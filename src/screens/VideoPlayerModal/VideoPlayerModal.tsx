import React, { FC, useCallback } from 'react';
import { StatusBar } from 'react-native';

import VideoPlayer from '!/components/VideoPlayer';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import { HeaderOptions, RootNavigationProp, RootRouteProp } from '!/types';
import getStatusBarColor from '!/utils/get-status-bar-color';

interface Props {
  navigation: RootNavigationProp<'VideoPlayerModal'>;
  route: RootRouteProp<'VideoPlayerModal'>;
}

const VideoPlayerModal: FC<Props> = ({ navigation, route }) => {
  const { attachment, title } = route.params;

  const { colors, dark, mode } = useTheme();

  const handlePressBack = usePress(() => {
    StatusBar.setBackgroundColor(getStatusBarColor(4, colors, dark, mode));
    StatusBar.setTranslucent(false);

    requestAnimationFrame(() => {
      navigation.goBack();
    });
  });

  const onShowHideControl = useCallback(
    (state: boolean) => {
      navigation.setOptions({
        headerShown: state,
      } as HeaderOptions);
    },
    [navigation],
  );

  const onShowHideStatusBar = useCallback(
    (state: boolean) => {
      navigation.setOptions({
        skipInset: state,
      } as HeaderOptions);
    },
    [navigation],
  );

  navigation.setOptions({
    title,
    handlePressBack,
  } as HeaderOptions);

  return (
    <VideoPlayer
      onShowHideControl={onShowHideControl}
      onShowHideStatusBar={onShowHideStatusBar}
      video={attachment}
    />
  );
};

export default VideoPlayerModal;
