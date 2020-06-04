import React, { FC } from 'react';
import { StyleSheet } from 'react-native';

import FastImage from 'react-native-fast-image';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';
import { Colors } from 'react-native-paper';
import Animated, {
  and,
  block,
  call,
  cond,
  eq,
  lessThan,
  multiply,
  set,
  useCode,
} from 'react-native-reanimated';
import {
  pinchActive,
  pinchBegan,
  timing,
  translate,
  useGestureHandler,
  useValue,
  useVector,
  vec,
} from 'react-native-redash';
import { SharedElement } from 'react-navigation-shared-element';

import useDimensions from '!/hooks/use-dimensions';
import useTheme from '!/hooks/use-theme';
import AttachmentModel from '!/models/AttachmentModel';
import { DeepPartial } from '!/types';
import getNormalizedSize from '!/utils/get-normalized-size';

const FastImageAnim = Animated.createAnimatedComponent(FastImage) as typeof FastImage;

interface Props {
  image: DeepPartial<AttachmentModel>;
  shouldFillScreen?: boolean;
}

const ImageViewer: FC<Props> = ({ image, shouldFillScreen }) => {
  const [winWidth, winHeight, isLandscape] = useDimensions('window');
  const { animation } = useTheme();

  const state = useValue(State.UNDETERMINED);
  const numberOfPointers = useValue(0);

  const gestureScale = useValue(1);
  const scaleOffset = useValue(1);

  const origin = useVector(0, 0);
  const pinch = useVector(0, 0);
  const focal = useVector(0, 0);

  const scale = useValue(1);
  const offset = useVector(0, 0);

  const CENTER = useVector(winWidth / 2, winHeight / 2);
  const adjustedFocal = vec.sub(focal, vec.add(CENTER, offset));
  const translation = useVector(0, 0);

  const pinchGestureHandler = useGestureHandler({
    numberOfPointers,
    scale: gestureScale,
    state,
    focalX: focal.x,
    focalY: focal.y,
  });

  useCode(
    () =>
      block([
        cond(pinchBegan(state), vec.set(origin, adjustedFocal)),
        cond(pinchActive(state, numberOfPointers), [
          vec.set(pinch, vec.sub(adjustedFocal, origin)),
          vec.set(translation, vec.add(pinch, origin, vec.multiply(-1, gestureScale, origin))),
        ]),
        cond(eq(state, State.ACTIVE), [set(scale, multiply(gestureScale, scaleOffset))]),
        cond(eq(state, State.END), [
          vec.set(offset, vec.add(offset, translation)),
          set(scaleOffset, scale),
          set(gestureScale, 1),
          vec.set(translation, 0),
          vec.set(focal, 0),
          vec.set(pinch, 0),
        ]),
        cond(
          and(eq(state, State.END), lessThan(scale, 1)),
          call([], () => {
            setTimeout(() => {
              scale.setValue(1);
              scaleOffset.setValue(1);
              offset.x.setValue(0);
              offset.y.setValue(0);
            }, 200 * animation.scale + 50);
          }),
        ),
      ]),
    [
      adjustedFocal,
      animation.scale,
      focal,
      gestureScale,
      numberOfPointers,
      offset,
      origin,
      pinch,
      scale,
      scaleOffset,
      state,
      translation,
    ],
  );

  const offsetX = cond(
    and(eq(state, State.END), lessThan(scale, 1)),
    timing({ from: offset.x, to: 0, duration: 200 * animation.scale }),
    offset.x,
  );

  const offsetY = cond(
    and(eq(state, State.END), lessThan(scale, 1)),
    timing({ from: offset.y, to: 0, duration: 200 * animation.scale }),
    offset.y,
  );

  const scaleReset = cond(
    and(eq(state, State.END), lessThan(scale, 1)),
    timing({ from: scale, to: 1, duration: 200 * animation.scale }),
    scale,
  );

  const { aspectRatio, height, width } = getNormalizedSize(image, {
    winWidth,
    winHeight,
    isLandscape,
  });

  return (
    <PinchGestureHandler {...pinchGestureHandler}>
      <Animated.View style={[styles.imageContainer, shouldFillScreen && StyleSheet.absoluteFill]}>
        <SharedElement id={image.id!}>
          <FastImageAnim
            source={{ uri: image.uri }}
            style={{
              width,
              height,
              aspectRatio,
              transform: [
                ...(translate(vec.add({ x: offsetX, y: offsetY }, translation)) as any),
                { scale: scaleReset },
              ],
            }}
          />
        </SharedElement>
      </Animated.View>
    </PinchGestureHandler>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.black,
  },
});

export default ImageViewer;
