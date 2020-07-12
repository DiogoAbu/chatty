import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, InteractionManager, ScrollView, TextInput as NativeInput, View } from 'react-native';

import { Button, Dialog, HelperText, Paragraph, Portal, Subheading, TextInput } from 'react-native-paper';

import { ONE_TIME_CODE_MAX_LENGTH } from '!/config';
import { useChangePasswordMutation } from '!/generated/graphql';
import useFocusEffect from '!/hooks/use-focus-effect';
import useInput from '!/hooks/use-input';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { MainNavigationProp } from '!/types';
import { focusNext } from '!/utils/scroll-into-view';

import styles from './styles';

interface Props {
  navigation: MainNavigationProp<'ChangePass'>;
}

const ChangePass: FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [, changePassExec] = useChangePasswordMutation();

  const oneTimeCodeInput = useInput('');
  const passInput = useInput('');

  const [oneTimeCodeError, setOneTimeCodeError] = useState('');
  const [passError, setPassError] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [isDialogVisible, setIsDialogVisible] = useState(false);

  const isMounted = useRef(true);
  const scrollRef = useRef<ScrollView>(null);
  const codeRef = useRef<NativeInput>(null);
  const passRef = useRef<NativeInput>(null);

  // Shift input focus
  const focusPass = useMemo(() => focusNext(passRef, scrollRef), []);

  const handleSendChangePass = usePress(async () => {
    try {
      const oneTimeCode = oneTimeCodeInput.value.trim();
      const pass = passInput.value.trim();

      if (!oneTimeCode || !pass) {
        setOneTimeCodeError(oneTimeCode ? '' : t('error.invalid.oneTimeCode'));
        setPassError(pass ? '' : t('error.invalid.password'));
        return;
      }
      setOneTimeCodeError('');
      setPassError('');

      setIsSending(true);

      const res = await changePassExec({
        data: {
          code: parseInt(oneTimeCode, 10),
          password: pass,
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

      if (!res.data?.changePassword) {
        setOneTimeCodeError(t('error.invalid.oneTimeCode'));
        return;
      }

      setIsDialogVisible(true);
    } catch (err) {
      console.log(err);
      Alert.alert(t('title.oops'), t('error.somethingWentWrong'));
      setIsSending(false);
    }
  });

  const handleDismissDialog = usePress(() => {
    setIsDialogVisible(false);
  });

  const handleLeaveScreen = usePress(() => {
    setIsDialogVisible(false);
    requestAnimationFrame(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    });
  });

  useFocusEffect(() => {
    void InteractionManager.runAfterInteractions(() => {
      codeRef.current?.focus();
      setTimeout(() => {
        codeRef.current?.focus();
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
    <>
      <ScrollView
        contentContainerStyle={[styles.contentContainer, { backgroundColor: colors.background }]}
        keyboardDismissMode='on-drag'
        keyboardShouldPersistTaps='handled'
        ref={scrollRef}
      >
        <View style={styles.formContainer}>
          <Subheading style={styles.description}>{t('changePass.desc')}</Subheading>

          <TextInput
            autoCapitalize='none'
            autoCorrect={false}
            blurOnSubmit={false}
            error={!!oneTimeCodeError}
            keyboardType='numeric'
            label={t('label.digitCode')}
            maxLength={ONE_TIME_CODE_MAX_LENGTH}
            mode='outlined'
            onSubmitEditing={focusPass}
            ref={codeRef}
            returnKeyType='next'
            textContentType='oneTimeCode'
            {...oneTimeCodeInput}
          />
          <HelperText type='error' visible>
            {oneTimeCodeError}
          </HelperText>

          <TextInput
            autoCapitalize='none'
            autoCompleteType='password'
            autoCorrect={false}
            blurOnSubmit={false}
            error={!!passError}
            label={t('label.newPassword')}
            mode='outlined'
            onSubmitEditing={handleSendChangePass}
            ref={passRef}
            returnKeyType='go'
            secureTextEntry
            style={styles.passInput}
            textContentType='password'
            {...passInput}
          />
          <HelperText type='error' visible>
            {passError}
          </HelperText>
        </View>

        <Button
          disabled={isSending}
          labelStyle={{ color: isSending ? colors.disabled : colors.textOnPrimary }}
          loading={isSending}
          mode='contained'
          onPress={handleSendChangePass}
          style={styles.button}
        >
          {t('label.confirm')}
        </Button>
      </ScrollView>

      <Portal>
        <Dialog onDismiss={handleDismissDialog} visible={isDialogVisible}>
          <Dialog.Content>
            <Paragraph>{t('passwordChangedSuccess')}</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleLeaveScreen}>Done</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
};

export default ChangePass;
