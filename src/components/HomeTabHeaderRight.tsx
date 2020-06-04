import React, { FC, useState } from 'react';

import { Appbar, Menu } from 'react-native-paper';
import { NavigationProp, NavigationState } from '@react-navigation/native';

import usePress from '!/hooks/use-press';
import useTranslation from '!/hooks/use-translation';
import { StackHeaderRightProps } from '!/types';

interface Props extends StackHeaderRightProps {
  // eslint-disable-next-line @typescript-eslint/ban-types
  navigation: NavigationProp<Record<string, object | undefined>, string, NavigationState, {}, {}>;
}

const HomeTabHeaderRight: FC<Props> = ({ tintColor: textColor, navigation }) => {
  const { t } = useTranslation();

  // State for menu visiblity
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Handlers
  const handleHideMenu = usePress(() => {
    setIsMenuVisible(() => false);
  });

  const handleShowMenu = usePress(() => {
    setIsMenuVisible(() => true);
  });

  const handleSettingsPress = usePress(() => {
    handleHideMenu();
    requestAnimationFrame(() => {
      navigation.navigate('Settings');
    });
  });

  const handleSignOut = usePress(() => {
    handleHideMenu();
    requestAnimationFrame(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    });
  });

  return (
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
      <Menu.Item onPress={handleSettingsPress} title={t('title.settings')} />
      <Menu.Item onPress={handleSignOut} title={t('signOut')} />
    </Menu>
  );
};

export default HomeTabHeaderRight;
