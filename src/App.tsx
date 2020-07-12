import 'react-native-gesture-handler';
import 'mobx-react-lite/batchingForReactNative';
import '!/services/why-did-you-render';
import '!/services/localize';

import React, { FC, useRef } from 'react';

import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { useObserver } from 'mobx-react-lite';
import { Provider as UrqlProvider } from 'urql';

import Fab from './components/Fab';
import SubscriptionManager from './components/SubscriptionManager';
import SyncManager from './components/SyncManager';
import RootStack from './navigators/RootStack';
import { darkTheme, lightTheme } from './services/theme';
import { Stores } from './stores/Stores';
import { StoresProvider, useStores } from './stores';

const AppWithStores: FC = () => {
  const stores = useStores();

  const navigationContainer = useRef<NavigationContainerRef | null>(null);

  return useObserver(() => {
    const {
      generalStore,
      authStore,
      themeStore: { isDarkMode },
    } = stores;

    if (!stores.hydrationComplete) {
      return null;
    }

    return (
      <UrqlProvider value={generalStore.client}>
        <DatabaseProvider database={generalStore.database}>
          <PaperProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <NavigationContainer ref={navigationContainer} theme={isDarkMode ? darkTheme : lightTheme}>
              <RootStack />

              <Fab />

              <SyncManager />

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

const App: FC = () => {
  return (
    <SafeAreaProvider>
      <StoresProvider value={new Stores()}>
        <AppWithStores />
      </StoresProvider>
    </SafeAreaProvider>
  );
};

export default App;
