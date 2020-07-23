import 'react-native-gesture-handler';
import 'mobx-react-lite/batchingForReactNative';
import '!/services/why-did-you-render';
import '!/services/localize';

import React, { FC, useEffect } from 'react';
import { Appearance } from 'react-native';

import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import { NavigationContainer } from '@react-navigation/native';
import { useObserver } from 'mobx-react-lite';
import { Provider as UrqlProvider } from 'urql';

import Fab from './components/Fab';
import NotificationsManager from './components/NotificationsManager';
import SubscriptionManager from './components/SubscriptionManager';
import SyncManager from './components/SyncManager';
import useMethod from './hooks/use-method';
import RootStack from './navigators/RootStack';
import { darkTheme, lightTheme } from './services/theme';
import { Stores } from './stores/Stores';
import { isReadyRef, navigationRef } from './utils/root-navigation';
import { StoresProvider, useStores } from './stores';

const AppWithStores: FC = () => {
  const stores = useStores();

  const handleSchemeChange = useMethod(({ colorScheme }: Appearance.AppearancePreferences) => {
    stores.themeStore.setColorSchemeCurrent(colorScheme!);
  });

  useEffect(() => {
    Appearance.addChangeListener(handleSchemeChange);
    return () => {
      Appearance.removeChangeListener(handleSchemeChange);
    };
  }, [handleSchemeChange]);

  useEffect(() => {
    return () => {
      // @ts-expect-error read-only
      isReadyRef.current = false;
    };
  }, []);

  return useObserver(() => {
    const {
      generalStore,
      authStore,
      themeStore: { colorSchemeCurrent },
    } = stores;

    if (!stores.hydrationComplete) {
      return null;
    }

    return (
      <UrqlProvider value={generalStore.client}>
        <DatabaseProvider database={generalStore.database}>
          <PaperProvider theme={colorSchemeCurrent === 'dark' ? darkTheme : lightTheme}>
            <NavigationContainer
              onReady={() => {
                // @ts-expect-error read-only
                isReadyRef.current = true;
              }}
              ref={navigationRef}
              theme={colorSchemeCurrent === 'dark' ? darkTheme : lightTheme}
            >
              <RootStack />

              <Fab />

              <SyncManager />

              <NotificationsManager token={authStore.token} userId={authStore.user?.id} />

              <SubscriptionManager
                token={authStore.token}
                user={authStore.user}
                userId={authStore.user?.id}
              />
            </NavigationContainer>
          </PaperProvider>
        </DatabaseProvider>
      </UrqlProvider>
    );
  }, 'App');
};

const App: FC<{ isHeadless?: boolean }> = ({ isHeadless }) => {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore. On Android, this prop will not exist.
    return null;
  }

  return (
    <SafeAreaProvider>
      <StoresProvider value={new Stores()}>
        <AppWithStores />
      </StoresProvider>
    </SafeAreaProvider>
  );
};

export default App;
