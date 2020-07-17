import React, { FC, useEffect } from 'react';
import { TouchableOpacity } from 'react-native';

import { Surface } from 'react-native-paper';

import AttachmentIcon from '!/components/AttachmentIcon';
import useDimensions from '!/hooks/use-dimensions';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import { AttachmentTypes } from '!/models/AttachmentModel';
import { useStores } from '!/stores';
import { MainNavigationProp, MainRouteProp } from '!/types';

import styles from './styles';

interface Props {
  navigation: MainNavigationProp<'AttachmentPickerModal'>;
  route: MainRouteProp<'AttachmentPickerModal'>;
}

const AttachmentPickerModal: FC<Props> = ({ navigation, route }) => {
  const [winWidth] = useDimensions('window');
  const { generalStore } = useStores();
  const { roundness, grid } = useTheme();

  const { params } = route;

  const handleOnPress = usePress((type: keyof typeof AttachmentTypes | 'camera') => {
    if (params?.callbackScreen) {
      requestAnimationFrame(() => {
        navigation.navigate(params.callbackScreen, {
          ...params,
          attachmentType: type,
        });
      });
    }
  });

  const handleDismiss = usePress(() => {
    requestAnimationFrame(() => {
      navigation.goBack();
    });
  });

  // Hide FAB
  useEffect(() => {
    generalStore.setFab();
  });

  const types = params.types || ['camera', 'document', 'image', 'video'];

  return (
    <>
      <TouchableOpacity activeOpacity={1.0} onPress={handleDismiss} style={styles.touchableDismiss} />

      <Surface
        style={[
          styles.container,
          {
            width: winWidth,
            padding: grid,
            borderTopEndRadius: roundness,
            borderTopStartRadius: roundness,
          },
        ]}
      >
        {types.includes('camera') ? <AttachmentIcon onPressCamera={handleOnPress} type='camera' /> : null}

        {types.includes('document') ? <AttachmentIcon onPress={handleOnPress} type='document' /> : null}

        {types.includes('image') ? <AttachmentIcon onPress={handleOnPress} type='image' /> : null}

        {types.includes('video') ? <AttachmentIcon onPress={handleOnPress} type='video' /> : null}
      </Surface>
    </>
  );
};

export default AttachmentPickerModal;
