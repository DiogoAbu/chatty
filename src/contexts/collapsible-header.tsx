import React, { createContext, FC, useContext } from 'react';

import Animated, { Extrapolate, interpolate, multiply } from 'react-native-reanimated';
import { diffClamp, onScrollEvent, useValue } from 'react-native-redash';

import { DEFAULT_APPBAR_HEIGHT } from '!/config';

interface CollapsibleHeader {
  onScroll: (...args: any[]) => void;
  translateY: Animated.Node<number>;
  containerPaddingTop: Animated.Node<number>;
}

const headerHeight = DEFAULT_APPBAR_HEIGHT;
const safeBounceHeight = 0;

export const CollapsibleHeaderContext = createContext<CollapsibleHeader | null>(null);

export const CollapsibleHeaderProvider: FC<unknown> = ({ children }) => {
  const y = useValue<number>(0);
  const onScroll = onScrollEvent({ y });

  const yClamp = diffClamp(y, 0, safeBounceHeight + headerHeight);
  const progress = interpolate(yClamp, {
    inputRange: [safeBounceHeight, safeBounceHeight + headerHeight],
    outputRange: [0, 1],
    extrapolate: Extrapolate.CLAMP,
  });

  const translateY = multiply(progress, -headerHeight);
  const containerPaddingTop = interpolate(progress, {
    inputRange: [0, 1],
    outputRange: [headerHeight, 0],
  });

  return (
    <CollapsibleHeaderContext.Provider value={{ onScroll, translateY, containerPaddingTop }}>
      {children}
    </CollapsibleHeaderContext.Provider>
  );
};

export const useCollapsibleHeader = (): CollapsibleHeader => {
  const collapsibleHeader = useContext(CollapsibleHeaderContext);

  if (!collapsibleHeader) {
    throw new Error('You have forgot to use CollapsibleHeaderProvider.. oops');
  }
  return collapsibleHeader;
};
