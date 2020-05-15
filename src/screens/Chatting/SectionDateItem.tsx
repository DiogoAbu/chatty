import React, { FC } from 'react';
import { SectionListData } from 'react-native';

import { Caption, Surface } from 'react-native-paper';

import useTheme from '!/hooks/use-theme';

import styles from './styles';

interface Props {
  section: SectionListData<any>;
}

const SectionDateItem: FC<Props> = ({ section: { title } }) => {
  const { roundness } = useTheme();

  return (
    <Surface style={[styles.sectionContainer, { borderRadius: roundness }]}>
      <Caption>{title}</Caption>
    </Surface>
  );
};

export default SectionDateItem;
