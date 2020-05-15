import React, { FC } from 'react';
import { View } from 'react-native';

import { Avatar, HelperText, TextInput, Title } from 'react-native-paper';

import useDimensions from '!/hooks/use-dimensions';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';

import styles from './styles';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  errorMessage: string;
}

const roomNameMaxLength = 30;

const DetailsForm: FC<Props> = ({ value, onChangeText, errorMessage }) => {
  const { colors, grid, gridBigger } = useTheme();
  const { t } = useTranslation();
  const [winWidth] = useDimensions('window');

  return (
    <View style={[styles.detailsContainer, { padding: grid }]}>
      <Avatar.Icon
        color={colors.textOnPrimary}
        icon='image-plus'
        size={Math.min(300, winWidth - grid * 10)}
        style={[styles.detailsAvatar, { margin: gridBigger }]}
      />

      <TextInput
        autoCapitalize='sentences'
        blurOnSubmit
        error={!!errorMessage}
        label={t('label.groupName')}
        maxLength={roomNameMaxLength}
        mode='outlined'
        onChangeText={onChangeText}
        returnKeyType='done'
        value={value}
      />
      <HelperText type={errorMessage ? 'error' : 'info'} visible>
        {errorMessage ||
          t('helper.charactersLeft', { amount: roomNameMaxLength - value.trim().length })}
      </HelperText>

      <Title style={{ marginTop: grid }}>{t('label.members')}</Title>
    </View>
  );
};

export default DetailsForm;
