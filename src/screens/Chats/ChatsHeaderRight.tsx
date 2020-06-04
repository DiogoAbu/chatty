import React, { FC, useEffect, useRef, useState } from 'react';

import { Appbar, Menu } from 'react-native-paper';
import Animated, { Easing, timing, Value } from 'react-native-reanimated';

import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { StackHeaderRightProps } from '!/types';

import styles from './styles';

interface Props extends StackHeaderRightProps {
  archivedOnly?: boolean;
  handleSelectAll: () => any;
  handleDeselectAll: () => any;
  handleDeleteSelected: () => any;
  handleArchiveSelected: () => any;
}

const ChatsHeaderRight: FC<Props> = ({
  tintColor: textColor,
  archivedOnly,
  handleSelectAll,
  handleDeselectAll,
  handleDeleteSelected,
  handleArchiveSelected,
}) => {
  const { t } = useTranslation();
  const {
    animation: { scale },
  } = useTheme();

  // State for menu visiblity
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const opacity = useRef(new Value(0));

  // Animation
  useEffect(() => {
    timing(opacity.current, {
      toValue: 1,
      duration: scale * 200,
      easing: Easing.linear,
    }).start();
  }, [scale]);

  // Handlers
  const handleHideMenu = usePress(() => {
    setIsMenuVisible(() => false);
  });

  const handleShowMenu = usePress(() => {
    setIsMenuVisible(() => true);
  });

  const hijackOnPress = (func: () => any) => {
    return () => {
      handleHideMenu();
      return func();
    };
  };

  return (
    <>
      <Animated.View style={[styles.headerActionsContainer, { opacity: opacity.current }]}>
        <Appbar.Action
          color={textColor}
          icon='delete'
          onPress={hijackOnPress(handleDeleteSelected)}
        />
        <Appbar.Action
          color={textColor}
          icon={archivedOnly ? 'package-up' : 'package-down'}
          onPress={hijackOnPress(handleArchiveSelected)}
        />
      </Animated.View>

      <Menu
        anchor={
          <Appbar.Action
            color={textColor}
            disabled={isMenuVisible}
            icon='dots-vertical'
            onPress={handleShowMenu}
          />
        }
        onDismiss={handleHideMenu}
        visible={isMenuVisible}
      >
        <Menu.Item onPress={hijackOnPress(handleSelectAll)} title={t('label.selectAll')} />
        <Menu.Item onPress={hijackOnPress(handleDeselectAll)} title={t('label.deselectAll')} />
      </Menu>
    </>
  );
};

export default React.memo(ChatsHeaderRight);
