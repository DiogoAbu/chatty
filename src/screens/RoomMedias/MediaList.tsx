import React, { FC } from 'react';
import { FlatList, ListRenderItem, View } from 'react-native';

import FastImage from 'react-native-fast-image';

import useDimensions from '!/hooks/use-dimensions';
import AttachmentModel from '!/models/AttachmentModel';
import createEmptyRows from '!/utils/create-empty-rows';

import { withAttachments, WithAttachmentsInput, WithAttachmentsOutput } from './queries';

const MediaList: FC<WithAttachmentsOutput> = ({ attachments }) => {
  const [width, , isLandscape] = useDimensions('window');

  const columns = isLandscape ? 6 : 4;
  const size = width / columns;

  const renderItem: ListRenderItem<AttachmentModel | null> = ({ item }) =>
    item ? (
      <FastImage resizeMode='cover' source={{ uri: item.localUri }} style={{ width: size, height: size }} />
    ) : (
      <View style={{ width: size, height: size }} />
    );

  return (
    <FlatList data={createEmptyRows(attachments, columns)} numColumns={columns} renderItem={renderItem} />
  );
};

export default withAttachments(MediaList) as FC<WithAttachmentsInput>;
