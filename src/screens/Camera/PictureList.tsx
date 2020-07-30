import React, { FC } from 'react';
import { View } from 'react-native';

import { FlatList } from 'react-native-gesture-handler';
import { FAB as Fab } from 'react-native-paper';

import useMethod from '!/hooks/use-method';
import useTheme from '!/hooks/use-theme';

import PictureListItem from './PictureListItem';
import styles from './styles';
import { PicturesTaken } from './types';

const THUMBNAIL_SIZE = 70;
const THUMBNAIL_PADDING = 4;

interface Props {
  picsTaken: PicturesTaken[];
  handleTogglePictureSelection: (args: any) => any;
  handleGoToPreparePicture: (pictures?: PicturesTaken[]) => any;
  handleClearPicturesTaken: () => any;
}

const PictureList: FC<Props> = ({
  picsTaken,
  handleTogglePictureSelection,
  handleGoToPreparePicture,
  handleClearPicturesTaken,
}) => {
  const { colors } = useTheme();

  const selectedAmount = picsTaken.filter((each) => each.isSelected).length;

  const handleDoneSelectingPics = useMethod(() => {
    handleGoToPreparePicture(picsTaken);
  });

  return (
    <View style={styles.pictureListContainer}>
      <FlatList
        contentContainerStyle={styles.pictureListContent}
        data={picsTaken}
        horizontal
        keyExtractor={(item) => item.localUri!}
        renderItem={(props) => (
          <PictureListItem
            {...props}
            onPress={handleTogglePictureSelection}
            padding={THUMBNAIL_PADDING}
            size={THUMBNAIL_SIZE}
          />
        )}
      />
      <Fab
        color={colors.textOnAccent}
        icon={selectedAmount > 0 ? 'check' : 'close'}
        label={selectedAmount.toString()}
        onPress={selectedAmount > 0 ? handleDoneSelectingPics : handleClearPicturesTaken}
      />
    </View>
  );
};

export default PictureList;
