import React, { FC } from 'react';

import { Button, Checkbox, Dialog, Divider, RadioButton } from 'react-native-paper';

import useTheme from '!/hooks/use-theme';
import useTranslation from '!/hooks/use-translation';
import { MuteUntilOption } from '!/types';

interface Props {
  isMuteOptionsVisible: boolean;
  selectedMuteOption: MuteUntilOption;
  muteUntilOptions: MuteUntilOption[];
  shouldStillNotify: boolean;
  handleHideMuteOptions: () => any;
  handleChangeMuteOption: (value: string) => void;
  toggleShouldStillNotify: () => any;
  handleMuteSelected: () => any;
}

const MuteOptions: FC<Props> = ({
  isMuteOptionsVisible,
  muteUntilOptions,
  selectedMuteOption,
  shouldStillNotify,
  handleHideMuteOptions,
  handleChangeMuteOption,
  toggleShouldStillNotify,
  handleMuteSelected,
}) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <Dialog onDismiss={handleHideMuteOptions} visible={isMuteOptionsVisible}>
      <Dialog.Title>{t('title.muteOptions')}</Dialog.Title>

      <Dialog.Content>
        <RadioButton.Group onValueChange={handleChangeMuteOption} value={selectedMuteOption.key}>
          {muteUntilOptions.map((each) => (
            <RadioButton.Item
              key={each.key}
              label={t(`label.${each.value[1] as string}`, { count: each.value[0] as number })}
              value={each.key}
            />
          ))}
        </RadioButton.Group>

        <Divider />
        <Checkbox.Item
          label={t('label.displaySilentNotifications')}
          labelStyle={{ color: colors.text }}
          onPress={toggleShouldStillNotify}
          status={shouldStillNotify ? 'checked' : 'unchecked'}
        />
      </Dialog.Content>

      <Dialog.Actions>
        <Button onPress={handleHideMuteOptions}>{t('label.return')}</Button>
        <Button onPress={handleMuteSelected}>{t('label.save')}</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default MuteOptions;
