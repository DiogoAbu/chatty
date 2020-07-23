import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { Surface } from 'react-native-paper';
import Animated, { Easing, timing, Value } from 'react-native-reanimated';
import { useMemoOne } from 'use-memo-one';

import AttachmentIcon from '!/components/AttachmentIcon';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import { AttachmentType } from '!/models/AttachmentModel';
import getChildrenIds from '!/utils/get-children-ids';

import styles from './styles';

export interface AttachmentPickerType {
  isShowing: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  onPress: (callback: (type: AttachmentType) => any) => void;
}

interface Props {
  handleSetTouchableIds: (ids: number[]) => void;
}

const AttachmentPicker = forwardRef<AttachmentPickerType, Props>(({ handleSetTouchableIds }, ref) => {
  const { animation, roundness } = useTheme();

  const { animValue } = useMemoOne(() => ({ animValue: new Value(0) }), []);

  const animRef = useRef<Animated.BackwardCompatibleWrapper | null>(null);
  const [isShowing, setIsShowing] = useState(false);
  const containerRef = useRef<Animated.View | null>(null);

  const onPress = useRef<((type: AttachmentType) => any) | null>(null);

  const handleOnPress = usePress((type: AttachmentType) => {
    handleToggleAttachmentPicker(false);
    onPress.current?.(type);
  });

  const handleToggleAttachmentPicker = usePress((state?: boolean) => {
    if (state === false) {
      setIsShowing(false);
    }
    animRef.current?.stop();

    animRef.current = timing(animValue, {
      toValue: state === false ? 0 : state === true ? 1 : isShowing ? 0 : 1,
      duration: 200 * animation.scale,
      easing: Easing.linear,
    });
    animRef.current.start(() => {
      animRef.current = null;
    });

    if (state === true) {
      setIsShowing(true);
    } else if (state !== false) {
      setIsShowing((prev) => !prev);
    }
  });

  useImperativeHandle(ref, () => ({
    isShowing,
    show: () => {
      handleToggleAttachmentPicker(true);
    },
    hide: () => {
      handleToggleAttachmentPicker(false);
    },
    toggle: (state?: boolean) => {
      handleToggleAttachmentPicker(state);
    },
    onPress: (callback: (type: AttachmentType) => any) => {
      onPress.current = callback;
    },
  }));

  useEffect(() => {
    // @ts-ignore
    const surface = containerRef.current?._component._children[0];
    const childrenIds = getChildrenIds(surface._children);
    childrenIds.push(surface._nativeTag);

    handleSetTouchableIds(childrenIds);
  }, [handleSetTouchableIds, isShowing]);

  return (
    <Animated.View
      pointerEvents={isShowing ? 'auto' : 'none'}
      ref={containerRef}
      style={[
        styles.attachmentTypePickerContainer,
        {
          opacity: animValue,
          transform: [
            { translateY: 80, translateX: 130 }, // Translate to origin point
            { scale: animValue },
            { translateY: -80, translateX: -130 }, // Translate back to final position
          ],
        },
      ]}
    >
      <Surface style={[styles.attachmentTypePicker, { borderRadius: roundness * 2 }]}>
        <AttachmentIcon onPress={handleOnPress} type='document' />
        <AttachmentIcon onPress={handleOnPress} type='image' />
      </Surface>
    </Animated.View>
  );
});

export default memo(AttachmentPicker);
