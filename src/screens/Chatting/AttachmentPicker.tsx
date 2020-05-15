import React, { forwardRef, memo, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { TouchableOpacity } from 'react-native';

import { Colors, FAB as Fab, Surface, Text } from 'react-native-paper';
import Animated, { Easing, timing, Value } from 'react-native-reanimated';
import { useMemoOne } from 'use-memo-one';

import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { AttachmentTypes } from '!/models/AttachmentModel';
import getChildrenIds from '!/utils/get-children-ids';

import styles from './styles';

export interface AttachmentPickerType {
  isShowing: boolean;
  show: () => void;
  hide: () => void;
  toggle: () => void;
  onPress: (callback: (type: AttachmentTypes) => any) => void;
}

interface Props {
  handleSetTouchableIds: (ids: number[]) => void;
}

const AttachmentPicker = forwardRef<AttachmentPickerType, Props>(
  ({ handleSetTouchableIds }, ref) => {
    const { animation, roundness } = useTheme();
    const { t } = useTranslation();

    const { animValue } = useMemoOne(() => ({ animValue: new Value(0) }), []);

    const animRef = useRef<Animated.BackwardCompatibleWrapper | null>(null);
    const [isShowing, setIsShowing] = useState(false);
    const containerRef = useRef<Animated.View | null>(null);

    const onPress = useRef<((type: AttachmentTypes) => any) | null>(null);

    const handleOnPress = usePress((type: AttachmentTypes) => {
      handleToggleAttachmentPicker(false);
      onPress.current?.(type);
    });

    const handleOnPressDocument = usePress(() => handleOnPress(AttachmentTypes.document));
    const handleOnPressImage = usePress(() => handleOnPress(AttachmentTypes.image));

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
      onPress: (callback: (type: AttachmentTypes) => any) => {
        onPress.current = callback;
      },
    }));

    useEffect(() => {
      // @ts-ignore
      const surface = containerRef.current?._component._children[0];
      // eslint-disable-next-line no-underscore-dangle
      const childrenIds = getChildrenIds(surface._children);
      // eslint-disable-next-line no-underscore-dangle
      childrenIds.push(surface._nativeTag);

      handleSetTouchableIds(childrenIds);
    }, [handleSetTouchableIds, isShowing]);

    return (
      <Animated.View
        pointerEvents={isShowing ? 'auto' : 'none'}
        ref={containerRef}
        style={
          [
            styles.attachmentTypePickerContainer,
            {
              opacity: animValue,
              transform: [
                { translateY: 80, translateX: 130 }, // Tranlate to origin point
                { scale: animValue },
                { translateY: -80, translateX: -130 }, // Tranlate back to final position
              ],
            },
          ] as any
        }
      >
        <Surface style={[styles.attachmentTypePicker, { borderRadius: roundness * 2 }]}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={handleOnPressDocument}
            style={styles.attachmentTypeIconContainer}
          >
            <Fab
              icon='file-document'
              style={[styles.attachmentTypeIcon, { backgroundColor: Colors.blue500 }]}
            />
            <Text>{t('label.documents')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.6}
            onPress={handleOnPressImage}
            style={styles.attachmentTypeIconContainer}
          >
            <Fab
              icon='image'
              style={[styles.attachmentTypeIcon, { backgroundColor: Colors.yellow700 }]}
            />
            <Text>{t('label.images')}</Text>
          </TouchableOpacity>
        </Surface>
      </Animated.View>
    );
  },
);

export default memo(AttachmentPicker);
