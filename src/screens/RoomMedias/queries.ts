import { Database } from '@nozbe/watermelondb';
import withObservables, { ExtractedObservables } from '@nozbe/with-observables';

import RoomModel from '!/models/RoomModel';
import { MainRouteProp, Tables } from '!/types';

///////////////
// With Room //
///////////////
export interface WithRoomInput {
  database: Database;
  route: MainRouteProp<'RoomMedias'>;
}

const getRoom = ({ database, route }: WithRoomInput) => {
  // Get from route params
  const { roomId } = route.params;
  const roomTable = database.collections.get<RoomModel>(Tables.rooms);
  return { room: roomTable.findAndObserve(roomId) };
};

export const withRoom = withObservables(['database', 'route'], getRoom);

export type WithRoomOutput = WithRoomInput & ExtractedObservables<ReturnType<typeof getRoom>>;

//////////////////////
// With Attachments //
//////////////////////
export interface WithAttachmentsInput {
  room: RoomModel;
}

const getAttachments = ({ room }: WithAttachmentsInput) => {
  return {
    attachments: room.attachments.observe(),
  };
};

export const withAttachments = withObservables(['room'], getAttachments);

export type WithAttachmentsOutput = WithAttachmentsInput &
  ExtractedObservables<ReturnType<typeof getAttachments>>;
