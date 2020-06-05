import React, { FC, useEffect } from 'react';
import { StatusBar, View } from 'react-native';

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
  const { authStore, generalStore } = useStores();
  const { colors, fonts } = useTheme();
  const { t } = useTranslation();

  const handleSignInWithEmail = usePress(() => {
    navigation.navigate('SignIn');
  });

  useEffect(() => {
    StatusBar.setHidden(false);
    StatusBar.setBackgroundColor(colors.statusBar, true);
    StatusBar.setBarStyle(colors.statusBarText);
    StatusBar.setTranslucent(false);

    // Sign out here so the other screens that depend on the user will be already disposed
    void authStore.signOut();
    generalStore.setFab();
  }, [authStore, colors.statusBar, colors.statusBarText, generalStore]);

  return (
    <View style={[{ backgroundColor: colors.background }, styles.container]}>
      <Text style={styles.title}>Chatty</Text>
      <Subtitle />

      <View style={styles.contentContainer}>
        <LottieView
          autoPlay
          loop
          source={require('!/assets/animations/16360-girl-with-phone.json')}
        />
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
          {t('label.signInWithEmail')}
        </Button>
      </View>
    </View>
  );
};

export default Welcome;
