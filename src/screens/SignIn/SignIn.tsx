import React, { FC, useMemo, useRef, useState } from 'react';
import { Alert, Image, ScrollView, StatusBar, View } from 'react-native';

import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Button, HelperText, Surface, TextInput, Title } from 'react-native-paper';
import color from 'color';

import useFocusEffect from '!/hooks/use-focus-effect';
import useInput from '!/hooks/use-input';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import UserModel from '!/models/UserModel';
import { generateKeyPair } from '!/services/encryption';
import { useStores } from '!/stores';
import { DeepPartial, MainNavigationProp } from '!/types';
import { focusNext } from '!/utils/scroll-into-view';

import styles from './styles';

interface Props {
  navigation: MainNavigationProp<'SignIn'>;
}

const SignIn: FC<Props> = ({ navigation }) => {
  const { authStore, generalStore, themeStore } = useStores();
  const { colors, roundness } = useTheme();
  const { t } = useTranslation();

  // State for form
  const [isSigningIn, setIsSigningIn] = useState(false);

  const emailInput = useInput('');
  const passInput = useInput('');

  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');

  // Refs
  const scrollRef = useRef<ScrollView | null>(null);
  const passRef = useRef<any>(null);

  // Shift input focus
  const focusPass = useMemo(() => focusNext(passRef, scrollRef), []);

  const handleSignIn = usePress(async () => {
    try {
      setIsSigningIn(() => true);

      const { secretKey, publicKey } = await generateKeyPair();

      const user: DeepPartial<UserModel> = {
        id: '98a002bf-5ce3-4a28-a43f-eee3662687e7',
        name: 'Diogo Silva',
        email: 'diogodeazevedosilva@gmail.com',
        picture: 'https://randomuser.me/api/portraits/men/1.jpg',
        secretKey,
        publicKey,
      };

      await authStore.signIn(user, 'token');

      requestAnimationFrame(() => {
        setIsSigningIn(() => false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      });
    } catch (e) {
      Alert.alert(t('title.oops'), t('error.signInUserNotCreated'));
      setIsSigningIn(() => false);
    }
  });

  const handleForgotPass = usePress(() => {
    //
  });

  const handleToggleDarkMode = usePress(() => {
    requestAnimationFrame(() => {
      themeStore.toggleDarkMode();
    });
  });

  useFocusEffect(() => {
    setIsSigningIn(() => false);

    const textIsDark = color(colors.textOnPrimary).isDark();
    StatusBar.setHidden(false);
    StatusBar.setBackgroundColor(colors.primary, true);
    StatusBar.setBarStyle(textIsDark ? 'dark-content' : 'light-content');
    StatusBar.setTranslucent(false);

    // Sign out here so the other screens that depend on the user will be already disposed
    authStore.signOut();
    generalStore.setFab();
  }, [authStore, colors.primary, colors.textOnPrimary, generalStore]);

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      keyboardDismissMode='on-drag'
      keyboardShouldPersistTaps='handled'
      ref={scrollRef}
      style={{ backgroundColor: colors.background }}
    >
      <View style={[styles.logoContainer, { backgroundColor: colors.primary }]}>
        <TouchableWithoutFeedback onPress={handleToggleDarkMode}>
          <Image source={require('!/assets/logo/icon.png')} />
        </TouchableWithoutFeedback>
      </View>

      <View style={[styles.formContainer, { backgroundColor: colors.background }]}>
        <Surface style={[styles.formContent, { borderRadius: roundness * 2 }]}>
          <Title style={styles.title}>{t('label.welcome')}</Title>

          <TextInput
            autoCapitalize='none'
            autoCompleteType='email'
            autoCorrect={false}
            blurOnSubmit={false}
            error={!!emailError}
            keyboardType='email-address'
            label={t('label.email')}
            mode='flat'
            onSubmitEditing={focusPass}
            returnKeyType='next'
            style={{
              backgroundColor: colors.background,
              borderColor: emailError ? colors.error : colors.primary,
            }}
            textContentType='emailAddress'
            {...emailInput}
          />
          <HelperText type='error' visible>
            {emailError}
          </HelperText>

          <TextInput
            autoCapitalize='none'
            autoCompleteType='password'
            autoCorrect={false}
            blurOnSubmit={false}
            error={!!passError}
            label={t('label.password')}
            mode='flat'
            onSubmitEditing={handleSignIn}
            ref={passRef}
            returnKeyType='go'
            secureTextEntry
            style={[
              styles.inputBottom,
              {
                backgroundColor: colors.background,
                borderColor: emailError ? colors.error : colors.primary,
              },
            ]}
            textContentType='password'
            {...passInput}
          />
          <HelperText type='error' visible>
            {passError}
          </HelperText>

          <Button
            disabled={isSigningIn}
            labelStyle={{ color: colors.textOnPrimary }}
            loading={isSigningIn}
            mode='contained'
            onPress={handleSignIn}
            style={styles.button}
          >
            {t('signIn')}
          </Button>

          <Button
            disabled={isSigningIn}
            mode='text'
            onPress={handleForgotPass}
            style={styles.button}
          >
            {t('forgotPassword')}
          </Button>
        </Surface>
      </View>
    </ScrollView>
  );
};

export default SignIn;
