import React, { FC } from 'react';
import { BackHandler, StatusBar } from 'react-native';

import ImageViewer from '!/components/ImageViewer';
import useFocusEffect from '!/hooks/use-focus-effect';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import { HeaderOptions, RootNavigationProp, RootRouteProp } from '!/types';
import getStatusBarColor from '!/utils/get-status-bar-color';

interface Props {
  navigation: RootNavigationProp<'PictureViewerModal'>;
  route: RootRouteProp<'PictureViewerModal'>;
}

const PictureViewerModal: FC<Props> = ({ navigation, route }) => {
  const { attachment, title, skipStatusBar } = route.params;

  const { colors, dark, mode } = useTheme();

  const handlePressBack = usePress(() => {
    StatusBar.setBackgroundColor(getStatusBarColor(4, colors, dark, mode));
    StatusBar.setTranslucent(false);

    requestAnimationFrame(() => {
      navigation.goBack();
    });
  });

  navigation.setOptions({
    title,
    handlePressBack: skipStatusBar ? undefined : handlePressBack,
  } as HeaderOptions);

  useFocusEffect(() => {
    if (skipStatusBar) {
      return () => null;
    }
    requestAnimationFrame(() => {
      StatusBar.setBackgroundColor('rgba(0,0,0,0.6)');
      StatusBar.setTranslucent(true);
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      StatusBar.setBackgroundColor(getStatusBarColor(4, colors, dark, mode));
      StatusBar.setTranslucent(false);
      return false;
    });

    return () => {
      backHandler.remove();
    };
  }, [colors, dark, mode, skipStatusBar]);

  return <ImageViewer image={attachment} shouldFillScreen />;
};

export default PictureViewerModal;
