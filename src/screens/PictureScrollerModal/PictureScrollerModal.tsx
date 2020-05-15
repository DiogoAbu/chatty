import React, { FC } from 'react';
import { BackHandler, ListRenderItemInfo, StatusBar, View } from 'react-native';

import { FlatList } from 'react-native-gesture-handler';

import useFocusEffect from '!/hooks/use-focus-effect';
import usePress from '!/hooks/use-press';
import useTheme from '!/hooks/use-theme';
import AttachmentModel from '!/models/AttachmentModel';
import { DeepPartial, HeaderOptions, RootNavigationProp, RootRouteProp } from '!/types';
import getStatusBarColor from '!/utils/get-status-bar-color';

import PictureItem from './PictureItem';
import styles from './styles';

const SEPARATOR_PADDING = 6;

interface Props {
  navigation: RootNavigationProp<'PictureScrollerModal'>;
  route: RootRouteProp<'PictureScrollerModal'>;
}

const Separator = () => <View style={{ marginVertical: SEPARATOR_PADDING }} />;

const PictureScrollerModal: FC<Props> = ({ navigation, route }) => {
  const { attachments, title } = route.params;

  const { dark, mode, colors } = useTheme();

  const handlePressBack = usePress(() => {
    StatusBar.setBackgroundColor(getStatusBarColor(4, colors, dark, mode));
    StatusBar.setTranslucent(false);

    requestAnimationFrame(() => {
      navigation.goBack();
    });
  });

  useFocusEffect(() => {
    requestAnimationFrame(() => {
      StatusBar.setBackgroundColor('rgba(0,0,0,0.6)');
      StatusBar.setTranslucent(true);
    });

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      StatusBar.setBackgroundColor(getStatusBarColor(4, colors, dark, mode));
      StatusBar.setTranslucent(false);
      return false;
    });

    return () => {
      backHandler.remove();
    };
  }, [colors, dark, mode]);

  navigation.setOptions({
    title,
    handlePressBack,
  } as HeaderOptions);

  const renderItem = (props: ListRenderItemInfo<DeepPartial<AttachmentModel>>) => (
    <PictureItem {...props} title={title} />
  );

  return (
    <FlatList
      contentContainerStyle={styles.contentContainer}
      data={attachments}
      ItemSeparatorComponent={Separator}
      keyExtractor={(item) => item.id!}
      pinchGestureEnabled={false}
      renderItem={renderItem}
    />
  );
};

export default PictureScrollerModal;
