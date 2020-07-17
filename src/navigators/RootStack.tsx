import React, { FC } from 'react';

import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import { CardStyleInterpolators } from '@react-navigation/stack';
import { TransitionSpec } from '@react-navigation/stack/lib/typescript/src/types';

import Header from '!/components/Header';
import AttachmentPickerModal from '!/screens/AttachmentPickerModal/AttachmentPickerModal';
import PictureScrollerModal from '!/screens/PictureScrollerModal/PictureScrollerModal';
import PictureViewerModal from '!/screens/PictureViewerModal/PictureViewerModal';
import RoomInfoModal from '!/screens/RoomInfoModal/RoomInfoModal';
import VideoPlayerModal from '!/screens/VideoPlayerModal/VideoPlayerModal';
import { RootStackParams } from '!/types';

import MainStack from './MainStack';

const AnimationStack = createSharedElementStackNavigator<RootStackParams>();

const transitionSpecConfig: TransitionSpec = {
  animation: 'spring',
  config: {
    stiffness: 1000,
    damping: 500,
    mass: 3,
    overshootClamping: true,
    restDisplacementThreshold: 10,
    restSpeedThreshold: 10,
  },
};

const RootStack: FC<unknown> = () => {
  return (
    <AnimationStack.Navigator
      initialRouteName='Main'
      mode='modal'
      screenOptions={{
        header: Header,
        headerTransparent: true,
        transitionSpec: {
          open: transitionSpecConfig,
          close: transitionSpecConfig,
        },
        cardStyle: { backgroundColor: 'transparent' },
        cardOverlayEnabled: true,
        cardStyleInterpolator: ({ current: { progress } }) => ({
          cardStyle: {
            opacity: progress.interpolate({
              inputRange: [0, 0.5, 0.9, 1],
              outputRange: [0, 0.25, 0.7, 1],
            }),
          },
          overlayStyle: {
            opacity: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.5],
              extrapolate: 'clamp',
            }),
          },
        }),
      }}
    >
      <AnimationStack.Screen component={MainStack} name='Main' options={{ headerShown: false }} />

      <AnimationStack.Screen
        component={RoomInfoModal}
        name='RoomInfoModal'
        options={{ headerShown: false }}
        sharedElementsConfig={(route) => {
          const { friendId, roomId } = route.params;
          return [friendId || roomId];
        }}
      />

      <AnimationStack.Screen
        component={PictureScrollerModal}
        name='PictureScrollerModal'
        sharedElementsConfig={(route, otherRoute) => {
          if (otherRoute.name === 'PictureViewerModal') {
            const { attachment } = otherRoute.params!;
            return [attachment.id];
          }
          const { attachments } = route.params!;
          return [attachments[0].id];
        }}
      />

      <AnimationStack.Screen
        component={PictureViewerModal}
        name='PictureViewerModal'
        sharedElementsConfig={(route) => {
          const { attachment } = route.params!;
          return [attachment.id];
        }}
      />

      <AnimationStack.Screen component={VideoPlayerModal} name='VideoPlayerModal' />

      <AnimationStack.Screen
        component={AttachmentPickerModal}
        name='AttachmentPickerModal'
        options={{
          headerShown: false,
          cardStyle: { backgroundColor: 'rgba(0,0,0,0.6)' },
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      />
    </AnimationStack.Navigator>
  );
};

export default RootStack;
