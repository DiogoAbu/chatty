import React, { FC } from 'react';
import { View } from 'react-native';

import { TouchableOpacity } from 'react-native-gesture-handler';
import { Avatar, HelperText, TextInput, Title } from 'react-native-paper';

import { ROOM_NAME_MAX_LENGTH } from '!/config';
import useDimensions from '!/hooks/use-dimensions';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';

import styles from './styles';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  errorMessage: string;
}

const DetailsForm: FC<Props> = ({ value, onChangeText, errorMessage }) => {
  const [winWidth] = useDimensions('window');
  const { colors, grid, gridBigger } = useTheme();
  const { t } = useTranslation();

  const handleOpenAttachmentPicker = usePress(() => {
    requestAnimationFrame(() => {
      // a
    });
  });

  return (
    <View style={[styles.detailsContainer, { padding: grid }]}>
      <TouchableOpacity onPress={handleOpenAttachmentPicker}>
        <Avatar.Icon
          color={colors.textOnPrimary}
          icon='image-plus'
          size={Math.min(200, winWidth - grid * 10)}
          style={[styles.detailsAvatar, { margin: gridBigger }]}
        />
      </TouchableOpacity>

      <TextInput
        autoCapitalize='sentences'
        blurOnSubmit
        error={!!errorMessage}
        label={t('label.groupName')}
        maxLength={ROOM_NAME_MAX_LENGTH}
        mode='outlined'
        onChangeText={onChangeText}
        returnKeyType='done'
        value={value}
      />
      <HelperText type={errorMessage ? 'error' : 'info'} visible>
        {errorMessage || t('helper.charactersLeft', { count: ROOM_NAME_MAX_LENGTH - value.trim().length })}
      </HelperText>

      <Title style={{ marginTop: grid }}>{t('label.members')}</Title>
    </View>
  );
};

export default DetailsForm;
