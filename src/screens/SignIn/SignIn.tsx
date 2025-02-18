import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, InteractionManager, ScrollView } from 'react-native';

import { Button, HelperText, Surface, TextInput } from 'react-native-paper';
import { CombinedError } from 'urql';

import { SignInResponse, useCreateAccountMutation, useSignInMutation } from '!/generated/graphql';
import useFocusEffect from '!/hooks/use-focus-effect';
import useInput from '!/hooks/use-input';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import UserModel from '!/models/UserModel';
import debug from '!/services/debug';
import { useStores } from '!/stores';
import { DeepPartial, MainNavigationProp } from '!/types';
import getValidationErrors from '!/utils/get-validation-errors';
import { humanizeEmailError, humanizePasswordError } from '!/utils/humanize-errors';
import { focusNext } from '!/utils/scroll-into-view';

import styles from './styles';

const log = debug.extend('sign-in');

interface Props {
  navigation: MainNavigationProp<'SignIn'>;
}

const SignIn: FC<Props> = ({ navigation }) => {
  const { authStore } = useStores();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [, signInExec] = useSignInMutation();
  const [, createAccountExec] = useCreateAccountMutation();

  const [isSigningIn, setIsSigningIn] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');

  const emailInput = useInput('', () => setEmailError(''));
  const passInput = useInput('', () => setPassError(''));

  // Refs
  const isMounted = useRef(true);
  const scrollRef = useRef<ScrollView | null>(null);
  const emailRef = useRef<any>(null);
  const passRef = useRef<any>(null);

  // Shift input focus
  const focusPass = useMemo(() => focusNext(passRef, scrollRef), []);

  const handleSignIn = usePress(async () => {
    try {
      log('signing in');

      const email = emailInput.value.trim();
      const password = passInput.value.trim();

      if (!email || !password) {
        setEmailError(email ? '' : t('error.invalid.email'));
        setPassError(password ? '' : t('error.invalid.password'));
        return;
      }
      setEmailError('');
      setPassError('');

      setIsSigningIn(true);

      let res: SignInResponse | undefined;
      let error: CombinedError | undefined;

      // Sign in
      const resSignIn = await signInExec({
        data: {
          email,
          password,
        },
      });

      if (!isMounted.current) {
        log('not mounted');
        setIsSigningIn(false);
        return;
      }

      if (resSignIn.error?.message.includes('Network')) {
        Alert.alert(t('title.oops'), t('error.checkInternetConnection'));
        setIsSigningIn(false);
        return;
      }

      // Create account
      if (resSignIn.error?.graphQLErrors.some((e) => e.extensions?.code === 'NOT_FOUND')) {
        const resCreate = await createAccountExec({
          data: {
            email,
            password,
          },
        });

        if (!isMounted.current) {
          log('not mounted');
          setIsSigningIn(false);
          return;
        }

        if (resCreate.error?.message.includes('Network')) {
          Alert.alert(t('title.oops'), t('error.checkInternetConnection'));
          setIsSigningIn(false);
          return;
        }

        res = resCreate.data?.createAccount;
        error = resCreate.error;
      } else {
        res = resSignIn.data?.signIn;
        error = resSignIn.error;
      }

      // Check response
      if (error?.graphQLErrors?.[0].extensions?.exception?.validationErrors) {
        log(error?.graphQLErrors?.[0].extensions?.exception?.validationErrors);
        const errors = getValidationErrors(error, ['email', 'password']);
        setEmailError(humanizeEmailError(errors?.email, t));
        setPassError(humanizePasswordError(errors?.password, t));
        setIsSigningIn(false);
        return;
      }

      if (!res?.user || !res?.token) {
        log(error);
        setEmailError(t('error.signIn.user'));
        setIsSigningIn(false);
        return;
      }

      const { user, token } = res;

      const userData: DeepPartial<UserModel> = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        pictureUri: user.pictureUri,
        derivedSalt: user.derivedSalt,
      };

      await authStore.signIn(userData, token, password);
      log('signed in successfully');

      requestAnimationFrame(() => {
        setIsSigningIn(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'CreateProfile' }],
        });
      });
    } catch (err) {
      log(err);
      Alert.alert(t('title.oops'), t('error.signInUserNotCreated'));
      setIsSigningIn(false);
    }
  });

  const handleForgotPass = usePress(() => {
    requestAnimationFrame(() => {
      navigation.navigate('ForgotPass');
    });
  });

  useFocusEffect(() => {
    navigation.setOptions({
      title: t('label.continueWithEmail'),
    });

    void InteractionManager.runAfterInteractions(() => {
      emailRef.current?.focus();
      setTimeout(() => {
        emailRef.current?.focus();
      }, 0);
    });

    setIsSigningIn(false);
  }, [navigation, t]);

  useEffect(() => {
    isMounted.current = true;
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
      <Surface style={styles.formContent}>
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
          ref={emailRef}
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
          {t('label.continue')}
        </Button>
        <HelperText style={styles.accountHelperText} type='info' visible>
          {t('helper.autoCreateAccount')}
        </HelperText>

        <Button disabled={isSigningIn} mode='text' onPress={handleForgotPass} style={styles.button}>
          {t('forgotPassword')}
        </Button>
      </Surface>
    </ScrollView>
  );
};

export default SignIn;
