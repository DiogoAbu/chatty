import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, TouchableWithoutFeedback, View } from 'react-native';

import { Button, HelperText, Surface, TextInput, Title } from 'react-native-paper';

import { useSignInMutation } from '!/generated/graphql';
import useFocusEffect from '!/hooks/use-focus-effect';
import useInput from '!/hooks/use-input';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import UserModel from '!/models/UserModel';
import { generateKeyPair } from '!/services/encryption';
import { useStores } from '!/stores';
import { DeepPartial, MainNavigationProp } from '!/types';
import getValidationErrors from '!/utils/get-validation-errors';
import { humanizeEmailError, humanizePasswordError } from '!/utils/humanize-errors';
import { focusNext } from '!/utils/scroll-into-view';

import styles from './styles';

interface Props {
  navigation: MainNavigationProp<'SignIn'>;
}

const SignIn: FC<Props> = ({ navigation }) => {
  const { authStore } = useStores();
  const { colors, roundness } = useTheme();
  const { t } = useTranslation();

  const [, signInExec] = useSignInMutation();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');

  const emailInput = useInput('', () => setEmailError(''));
  const passInput = useInput('', () => setPassError(''));

  // Refs
  const isMounted = useRef(true);
  const scrollRef = useRef<ScrollView | null>(null);
  const passRef = useRef<any>(null);

  // Shift input focus
  const focusPass = useMemo(() => focusNext(passRef, scrollRef), []);

  const handleSignIn = usePress(async () => {
    try {
      const email = emailInput.value.trim();
      const pass = passInput.value.trim();

      if (!email || !pass) {
        setEmailError(email ? '' : t('error.invalid.email'));
        setPassError(pass ? '' : t('error.invalid.password'));
        return;
      }
      setEmailError('');
      setPassError('');

      setIsSigningIn(true);

      const res = await signInExec({
        data: {
          email,
          password: pass,
        },
      });

      if (!isMounted.current) {
        return;
      }

      if (res.error?.message.includes('Network')) {
        Alert.alert(t('title.oops'), t('error.checkInternetConnection'));
        setIsSigningIn(false);
        return;
      }

      if (res.error?.graphQLErrors?.[0].extensions?.exception?.validationErrors) {
        const errors = getValidationErrors(res.error, ['email', 'password']);
        setEmailError(humanizeEmailError(errors?.email, t));
        setPassError(humanizePasswordError(errors?.password, t));
        setIsSigningIn(false);
        return;
      }

      if (!res.data?.signIn?.user || !res.data?.signIn?.token) {
        setEmailError(t('error.signIn.user'));
        setIsSigningIn(false);
        return;
      }

      const { secretKey, publicKey } = await generateKeyPair();

      const userFetched = res.data.signIn.user;

      const user: DeepPartial<UserModel> = {
        id: userFetched.id,
        email: userFetched.email,
        name: userFetched.name,
        role: userFetched.role,
        pictureUri: userFetched.pictureUri,
        secretKey,
        publicKey,
      };

      await authStore.signIn(user, 'token');

      navigation.popToTop();
      requestAnimationFrame(() => {
        setIsSigningIn(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        });
      });
    } catch (err) {
      console.log(err);
      Alert.alert(t('title.oops'), t('error.signInUserNotCreated'));
      setIsSigningIn(false);
    }
  });

  const handleForgotPass = usePress(() => {
    requestAnimationFrame(() => {
      navigation.navigate('ForgotPass');
    });
  });

  const handleGoBack = usePress(() => {
    requestAnimationFrame(() => {
      navigation.goBack();
    });
  });

  useFocusEffect(() => {
    setIsSigningIn(false);
  }, []);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      keyboardDismissMode='on-drag'
      keyboardShouldPersistTaps='handled'
      ref={scrollRef}
    >
      <TouchableWithoutFeedback onPress={handleGoBack}>
        <View style={styles.touchable} />
      </TouchableWithoutFeedback>

      <Surface style={[{ borderRadius: roundness * 4 }, styles.formContent]}>
        <Title style={styles.title}>Entrar com email</Title>

        <TextInput
          autoCapitalize='none'
          autoCompleteType='email'
          autoCorrect={false}
          blurOnSubmit={false}
          error={!!emailError}
          keyboardType='email-address'
          label={t('label.email')}
          mode='outlined'
          onSubmitEditing={focusPass}
          returnKeyType='next'
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
          mode='outlined'
          onSubmitEditing={handleSignIn}
          ref={passRef}
          returnKeyType='go'
          secureTextEntry
          style={styles.inputBottom}
          textContentType='password'
          {...passInput}
        />
        <HelperText type='error' visible>
          {passError}
        </HelperText>

        <Button
          disabled={isSigningIn}
          labelStyle={{ color: isSigningIn ? colors.disabled : colors.textOnPrimary }}
          loading={isSigningIn}
          mode='contained'
          onPress={handleSignIn}
          style={styles.button}
        >
          {t('signIn')}
        </Button>

        <Button disabled={isSigningIn} mode='text' onPress={handleForgotPass} style={styles.button}>
          {t('forgotPassword')}
        </Button>
      </Surface>
    </ScrollView>
  );
};

export default SignIn;
