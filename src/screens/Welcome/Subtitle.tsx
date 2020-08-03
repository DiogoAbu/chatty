import React, { FC } from 'react';

import { Text } from 'react-native-paper';

import useTranslation from '!/hooks/use-translation';

import styles from './styles';

const Subtitle: FC<unknown> = () => {
  const { t } = useTranslation();

  return <Text style={styles.subtitle}>{t('slogan1')}</Text>;
};

export default Subtitle;
