import 'react-native-gesture-handler';
import 'mobx-react-lite/batchingForReactNative';
import '!/services/why-did-you-render';
import '!/services/localize';

import React, { FC, useEffect, useRef } from 'react';
import { Appearance } from 'react-native';

import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DatabaseProvider from '@nozbe/watermelondb/DatabaseProvider';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { useObserver } from 'mobx-react-lite';
import { Provider as UrqlProvider } from 'urql';

import Fab from './components/Fab';
import SubscriptionManager from './components/SubscriptionManager';
import SyncManager from './components/SyncManager';
import { CollapsibleHeaderProvider } from './contexts/collapsible-header';
import useMethod from './hooks/use-method';
import RootStack from './navigators/RootStack';
import { darkTheme, lightTheme } from './services/theme';
import { Stores } from './stores/Stores';
import { StoresProvider, useStores } from './stores';

const AppWithStores: FC = () => {
  const stores = useStores();

  const navigationContainer = useRef<NavigationContainerRef | null>(null);

  const handleSchemeChange = useMethod(({ colorScheme }: Appearance.AppearancePreferences) => {
    stores.themeStore.setColorSchemeCurrent(colorScheme!);
  });

  useEffect(() => {
    Appearance.addChangeListener(handleSchemeChange);
    return () => {
      Appearance.removeChangeListener(handleSchemeChange);
    };
  }, [handleSchemeChange]);

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
            <CollapsibleHeaderProvider>
              <NavigationContainer
                ref={navigationContainer}
                theme={colorSchemeCurrent === 'dark' ? darkTheme : lightTheme}
              >
                <RootStack />

                <Fab />

                <SyncManager />

                <SubscriptionManager
                  token={authStore.token}
                  user={authStore.user}
                  userId={authStore.user?.id}
                />
              </NavigationContainer>
            </CollapsibleHeaderProvider>
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
