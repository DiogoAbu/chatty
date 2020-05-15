import { FC } from 'react';

import { Theme } from 'react-native-paper';
// @ts-ignore
import CrossFadeIconPaper from 'react-native-paper/lib/module/components/CrossFadeIcon';
import { IconSource } from 'react-native-paper/lib/typescript/src/components/Icon';

interface Props {
  source: IconSource;
  color: string;
  size: number;
  theme?: Theme;
}

const CrossFadeIcon: FC<Props> = CrossFadeIconPaper;

export default CrossFadeIcon;
