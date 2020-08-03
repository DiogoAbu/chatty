import React, { FC, useEffect } from 'react';
import { ImageBackground, TouchableOpacity, View } from 'react-native';

import { IconButton, Surface, Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SharedElement } from 'react-navigation-shared-element';

import useDimensions from '!/hooks/use-dimensions';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import { useStores } from '!/stores';
import { MainNavigationProp, MainRouteProp } from '!/types';
import transformUri from '!/utils/transform-uri';

import styles from './styles';

interface Props {
  navigation: MainNavigationProp<'RoomInfoModal'>;
  route: MainRouteProp<'RoomInfoModal'>;
}

const RoomInfoModal: FC<Props> = ({ navigation, route }) => {
  const [winWidth, winHeight] = useDimensions('window');
  const { generalStore } = useStores();
  const { colors, roundness } = useTheme();

  const size = Math.min(256, winWidth);

  const { roomTitle, roomPictureUri, friendId, roomId } = route.params;

  const handleDismiss = usePress(() => {
    requestAnimationFrame(() => {
      navigation.goBack();
    });
  });

  const handleStartChatting = usePress(() => {
    requestAnimationFrame(() => {
      navigation.navigate('Chatting', { roomId });
    });
  });

  const handleSeeProfile = usePress(() => {
    //
  });

  // Hide FAB
  useEffect(() => {
    generalStore.setFab();
  });

  return (
    <>
      <TouchableOpacity
        activeOpacity={1.0}
        onPress={handleDismiss}
        style={{
          width: winWidth,
          height: winHeight,
        }}
      />

      <View style={[styles.overlay, { width: winWidth, height: winHeight }]}>
        <Surface style={[styles.container, { borderRadius: roundness * 2 }]}>
          <View
            style={{
              width: size,
              height: size,
              backgroundColor: !roomPictureUri ? colors.primary : undefined,
            }}
          >
            <SharedElement id={friendId || roomId}>
              <ImageBackground
                source={{ uri: transformUri(roomPictureUri, { width: size, height: size }) }}
                style={[
                  { width: size, height: size, backgroundColor: colors.primary },
                  styles.pictureContainer,
                ]}
              >
                <Text style={styles.title}>{roomTitle}</Text>
                {!roomPictureUri ? (
                  <Icon
                    color={colors.textOnPrimary}
                    name={friendId ? 'account' : 'account-group'}
                    size={size * 0.6}
                  />
                ) : null}
              </ImageBackground>
            </SharedElement>
          </View>

          <View
            style={[
              styles.buttonsContainer,
              {
                width: size,
                backgroundColor: colors.background,
                borderBottomStartRadius: roundness * 2,
                borderBottomEndRadius: roundness * 2,
              },
            ]}
          >
            <IconButton color={colors.text} icon='message-text' onPress={handleStartChatting} />
            <IconButton color={colors.text} icon='information' onPress={handleSeeProfile} />
          </View>
        </Surface>
      </View>
    </>
  );
};

export default RoomInfoModal;
