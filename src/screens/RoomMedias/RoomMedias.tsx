import React, { FC } from 'react';

import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';

import { MainNavigationProp, MainRouteProp } from '!/types';

import MediaList from './MediaList';
import { withRoom, WithRoomOutput } from './queries';

interface Props {
  navigation: MainNavigationProp<'RoomMedias'>;
  route: MainRouteProp<'RoomMedias'>;
}

const RoomMedias: FC<WithRoomOutput & Props> = ({ navigation, route, room }) => {
  const { params } = route;

  navigation.setOptions({
    title: params.title,
  });

  return <MediaList room={room} />;
};

export default withDatabase(withRoom(RoomMedias));
