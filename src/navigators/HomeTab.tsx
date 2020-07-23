import React, { FC, useCallback } from 'react';
import { Dimensions, StatusBar } from 'react-native';

import { overlay } from 'react-native-paper';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useNavigation } from '@react-navigation/native';
import color from 'color';

import HomeTabHeaderRight from '!/components/HomeTabHeaderRight';
import useFocusEffect from '!/hooks/use-focus-effect';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import Chats from '!/screens/Chats/Chats';
import Feed from '!/screens/Feed/Feed';
import { HomeTabParams, StackHeaderRightProps } from '!/types';
import getStatusBarColor from '!/utils/get-status-bar-color';

const Tab = createMaterialTopTabNavigator<HomeTabParams>();

const HomeTab: FC<unknown> = () => {
  const navigation = useNavigation();
  const { colors, dark, mode } = useTheme();
  const { t } = useTranslation();

  // Tab bar options
  const backgroundColor =
    dark && mode === 'adaptive' ? (overlay(0, colors.surface) as string) : colors.primary;

  const backgroundIsDark = color(backgroundColor).isDark();

  // Change status bar to match header with different elevation
  const updateStatusBar = useCallback(
    (elevation: number) => {
      const bgColor = getStatusBarColor(elevation, colors, dark, mode);

      StatusBar.setHidden(false);
      StatusBar.setBackgroundColor(bgColor, true);
      StatusBar.setBarStyle(colors.statusBarText);
      StatusBar.setTranslucent(false);
    },
    [colors, dark, mode],
  );

  useFocusEffect(() => {
    updateStatusBar(0);

    // Update navigation options
    navigation.setOptions({
      headerRight: (props: StackHeaderRightProps) => (
        <HomeTabHeaderRight {...props} navigation={navigation} />
      ),
    });

    return () => {
      updateStatusBar(4);
    };
  }, [navigation, updateStatusBar]);

  return (
    <Tab.Navigator
      backBehavior='initialRoute'
      initialLayout={{ width: Dimensions.get('window').width }}
      initialRouteName='Chats'
      tabBarOptions={{
        activeTintColor: backgroundIsDark ? colors.text : colors.textOnPrimary,
        pressColor: backgroundIsDark ? colors.text : colors.textOnPrimary,
        style: { backgroundColor },
        indicatorStyle: { backgroundColor: dark ? colors.primary : colors.surface },
        tabStyle: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
        iconStyle: { paddingTop: 2 },
        showIcon: false,
      }}
    >
      <Tab.Screen component={Chats} name='Chats' options={{ title: t('title.chats') }} />

      <Tab.Screen component={Feed} name='Feed' options={{ title: t('title.feed') }} />
    </Tab.Navigator>
  );
};

export default HomeTab;
