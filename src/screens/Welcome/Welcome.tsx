import React, { FC, useEffect } from 'react';
import { StatusBar, View } from 'react-native';

import Config from 'react-native-config';
import { Button, Colors, FAB as Fab, Text } from 'react-native-paper';
import LottieView from 'lottie-react-native';

import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { useStores } from '!/stores';
import { MainNavigationProp } from '!/types';

import styles from './styles';
import Subtitle from './Subtitle';

interface Props {
  navigation: MainNavigationProp<'Welcome'>;
}

const Welcome: FC<Props> = ({ navigation }) => {
  const { authStore, deviceTokenStore, generalStore } = useStores();
  const { colors, fonts } = useTheme();
  const { t } = useTranslation();

  const handleSignInWithEmail = usePress(() => {
    requestAnimationFrame(() => {
      navigation.navigate('SignIn');
    });
  });

  useEffect(() => {
    StatusBar.setHidden(false);
    StatusBar.setBackgroundColor(colors.statusBar, true);
    StatusBar.setBarStyle(colors.statusBarText);
    StatusBar.setTranslucent(false);

    generalStore.setFab();

    // Sign out here so the other screens that depend on the user will be already disposed
    void authStore
      .signOut()
      .then(async () => deviceTokenStore.unregister())
      .catch(() => null);

    // Hit the server to wake it up
    const fetchControl = new AbortController();
    const fetchTimeout = setTimeout(() => {
      fetchControl.abort();
    }, 5000);

    void fetch(Config.API_URL, { method: 'GET', signal: fetchControl.signal }).catch(() => null);

    return () => {
      clearTimeout(fetchTimeout);
      fetchControl.abort();
    };
  }, [authStore, colors.statusBar, colors.statusBarText, deviceTokenStore, generalStore]);

  return (
    <View style={[{ backgroundColor: colors.background }, styles.container]}>
      <Text style={styles.title}>Chatty</Text>
      <Subtitle />

      <View style={styles.contentContainer}>
        <LottieView autoPlay loop source={require('!/assets/animations/16360-girl-with-phone.json')} />
      </View>

      <View>
        <Text style={[fonts.medium, styles.socialTitle]}>{t('label.signInWithSocialNetwork')}</Text>
        <View style={styles.socialContainer}>
          <Fab
            color={Colors.white}
            disabled
            icon='google'
            style={styles.fabButton}
            theme={{ colors: { accent: '#0F9D58' } }}
          />
          <Fab
            color={Colors.white}
            disabled
            icon='facebook'
            style={styles.fabButton}
            theme={{ colors: { accent: '#1877f2' } }}
          />
          <Fab
            color={Colors.white}
            disabled
            icon='twitter'
            style={styles.fabButton}
            theme={{ colors: { accent: '#1da1f2' } }}
          />
        </View>

        <Button
          labelStyle={{ color: colors.textOnPrimary }}
          mode='contained'
          onPress={handleSignInWithEmail}
          style={styles.button}
        >
          {t('label.continueWithEmail')}
        </Button>
      </View>
    </View>
  );
};

export default Welcome;
