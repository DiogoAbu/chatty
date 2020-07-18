import React, { FC } from 'react';
import { Platform } from 'react-native';

import { useTheme } from '@react-navigation/native';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import { useObserver } from 'mobx-react-lite';

import Header from '!/components/Header';
import useTranslation from '!/hooks/use-translation';
import Camera from '!/screens/Camera/Camera';
import ChangePass from '!/screens/ChangePass/ChangePass';
import ChatsArchived from '!/screens/Chats/ChatsArchived';
import Chatting from '!/screens/Chatting/Chatting';
import CreateGroup from '!/screens/CreateGroup/CreateGroup';
import EditProfile from '!/screens/EditProfile/EditProfile';
import FindFriends from '!/screens/FindFriends/FindFriends';
import ForgotPass from '!/screens/ForgotPass/ForgotPass';
import PreparePicture from '!/screens/PreparePicture/PreparePicture';
import PrepareVideo from '!/screens/PrepareVideo/PrepareVideo';
import Settings from '!/screens/Settings/Settings';
import SignIn from '!/screens/SignIn/SignIn';
import Welcome from '!/screens/Welcome/Welcome';
import { useStores } from '!/stores';
import { MainStackParams } from '!/types';

import HomeTab from './HomeTab';

const Stack = createStackNavigator<MainStackParams>();

const MainStack: FC<unknown> = () => {
  const stores = useStores();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return useObserver(() => {
    const { authStore } = stores;

    return (
      <Stack.Navigator
        initialRouteName={authStore.token ? (authStore.user.name ? 'Home' : 'EditProfile') : 'Welcome'}
        screenOptions={{
          header: Header,
          headerTransparent: true,
          cardStyle: { backgroundColor: colors.background },
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
      >
        <Stack.Screen component={HomeTab} name='Home' options={{ title: 'Chatty' }} />

        <Stack.Screen
          component={ChatsArchived}
          name='ChatsArchived'
          options={{ title: t('title.chatsArchived') }}
        />

        <Stack.Screen component={Chatting} name='Chatting' options={{ title: ' ' }} />

        <Stack.Screen
          component={FindFriends}
          name='FindFriends'
          options={{ title: t('title.findFriends') }}
        />

        <Stack.Screen
          component={CreateGroup}
          name='CreateGroup'
          options={{ title: t('title.createGroup') }}
        />

        <Stack.Screen component={Settings} name='Settings' options={{ title: t('title.settings') }} />

        <Stack.Screen
          component={Camera}
          name='Camera'
          options={{
            headerTransparent: true,
            cardStyleInterpolator:
              Platform.OS === 'ios'
                ? CardStyleInterpolators.forModalPresentationIOS
                : CardStyleInterpolators.forFadeFromBottomAndroid,
          }}
        />

        <Stack.Screen
          component={PreparePicture}
          name='PreparePicture'
          options={{ headerTransparent: true }}
        />

        <Stack.Screen component={PrepareVideo} name='PrepareVideo' options={{ headerTransparent: true }} />

        <Stack.Screen component={Welcome} name='Welcome' options={{ headerShown: false }} />

        <Stack.Screen
          component={EditProfile}
          name='EditProfile'
          options={{ title: t('title.editProfile') }}
        />
        <Stack.Screen component={SignIn} name='SignIn' />
        <Stack.Screen component={ForgotPass} name='ForgotPass' options={{ title: t('forgotPassword') }} />
        <Stack.Screen component={ChangePass} name='ChangePass' options={{ title: t('changePassword') }} />
      </Stack.Navigator>
    );
  });
};

export default MainStack;
