import React, { FC, useEffect, useRef, useState } from 'react';
import { Alert, InteractionManager, ScrollView, TextInput as NativeInput, View } from 'react-native';

import { Button, HelperText, Subheading, TextInput } from 'react-native-paper';

import { useForgotPasswordMutation } from '!/generated/graphql';
import useFocusEffect from '!/hooks/use-focus-effect';
import useInput from '!/hooks/use-input';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { MainNavigationProp } from '!/types';

import styles from './styles';

interface Props {
  navigation: MainNavigationProp<'ForgotPass'>;
}

const ForgotPass: FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [, forgotPassExec] = useForgotPasswordMutation();

  const emailInput = useInput('');
  const [emailError, setEmailError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const isMounted = useRef(true);
  const emailRef = useRef<NativeInput>(null);

  const handleSendForgotPass = usePress(async () => {
    try {
      const email = emailInput.value.trim();

      if (!email) {
        setEmailError(t('error.invalid.email'));
        return;
      }
      setEmailError('');

      setIsSending(true);

      const res = await forgotPassExec({
        data: {
          email,
        },
      });

      if (!isMounted.current) {
        return;
      }

      setIsSending(false);

      if (res.error?.message.includes('Network')) {
        Alert.alert(t('title.oops'), t('error.checkInternetConnection'));
        return;
      }

      if (!res.data?.forgotPassword) {
        setEmailError(t('error.signIn.user'));
        return;
      }

      requestAnimationFrame(() => {
        navigation.navigate('ChangePass');
      });
    } catch (err) {
      console.log(err);
      Alert.alert(t('title.oops'), t('error.somethingWentWrong'));
      setIsSending(false);
    }
  });

  const handleGotDigitCode = usePress(() => {
    setEmailError('');
    requestAnimationFrame(() => {
      navigation.navigate('ChangePass');
    });
  });

  useFocusEffect(() => {
    void InteractionManager.runAfterInteractions(() => {
      emailRef.current?.focus();
      setTimeout(() => {
        emailRef.current?.focus();
      }, 0);
    });
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <ScrollView
      contentContainerStyle={[styles.contentContainer, { backgroundColor: colors.background }]}
      keyboardDismissMode='on-drag'
      keyboardShouldPersistTaps='handled'
    >
      <View style={styles.formContainer}>
        <Subheading style={styles.description}>{t('forgotPass.desc')}</Subheading>

        <TextInput
          autoCapitalize='none'
          autoCompleteType='email'
          autoCorrect={false}
          blurOnSubmit={false}
          error={!!emailError}
          keyboardType='email-address'
          label={t('label.email')}
          mode='outlined'
          onSubmitEditing={handleSendForgotPass}
          ref={emailRef}
          returnKeyType='go'
          textContentType='emailAddress'
          {...emailInput}
        />
        <HelperText type='error' visible>
          {emailError}
        </HelperText>

        <Button
          disabled={isSending}
          labelStyle={{ color: isSending ? colors.disabled : colors.accent }}
          mode='outlined'
          onPress={handleGotDigitCode}
          style={[
            styles.button,
            { borderColor: isSending ? colors.disabled : colors.accent },
            styles.buttonOutlined,
          ]}
        >
          {t('gotDigitCode')}
        </Button>
      </View>

      <Button
        disabled={isSending}
        labelStyle={{ color: isSending ? colors.disabled : colors.textOnPrimary }}
        loading={isSending}
        mode='contained'
        onPress={handleSendForgotPass}
        style={styles.button}
      >
        {t('receiveDigitCode')}
      </Button>
    </ScrollView>
  );
};

export default ForgotPass;
