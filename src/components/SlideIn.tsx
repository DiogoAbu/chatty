import React, { FC, useEffect } from 'react';

import Animated, { Easing, timing } from 'react-native-reanimated';
import { useValue } from 'react-native-redash';

import useTheme from '!/hooks/use-theme';

const SlideIn: FC<unknown> = ({ children }) => {
  const {
    animation: { scale },
  } = useTheme();

  const anim = useValue<number>(0);

  useEffect(() => {
    timing(anim, {
      toValue: 1,
      duration: scale * 200,
      easing: Easing.linear,
    }).start();
  }, [anim, scale]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  return <Animated.View style={{ opacity: anim, transform: [{ translateY }] }}>{children}</Animated.View>;
};

export default SlideIn;
