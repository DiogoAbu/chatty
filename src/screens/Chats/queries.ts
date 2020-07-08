import { Database, Q } from '@nozbe/watermelondb';
import withObservables, { ExtractedObservables } from '@nozbe/with-observables';
import { of as of$ } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import MessageModel from '!/models/MessageModel';
import RoomModel from '!/models/RoomModel';
import UserModel from '!/models/UserModel';
import { Tables } from '!/types';

////////////////////
// With All Rooms //
////////////////////
export interface WithAllRoomsInput {
  user: UserModel;
  archivedOnly?: boolean;
}

const getAllRooms = ({ user, archivedOnly }: WithAllRoomsInput) => {
  if (!user?.rooms) {
    return null;
  }
  if (archivedOnly) {
    return {
      rooms: user.roomsArchived.observeWithColumns(['is_archived']),
    };
  }
  return {
    rooms: user.rooms.observeWithColumns(['last_change_at', 'last_message_id', 'is_archived']),
  };
};

export const withAllRooms = withObservables(['user', 'archivedOnly'], getAllRooms);

export type WithAllRoomsOutput = WithAllRoomsInput & ExtractedObservables<ReturnType<typeof getAllRooms>>;

///////////////////
// With One Room //
///////////////////
export interface WithOneRoomInput {
  database: Database;
  signedUser: UserModel;
  room: RoomModel;
  isSelecting: boolean;
  toggleSelected: (userId: string) => void;
  getSelected: (userId: string) => boolean;
}

const getOneRoom = ({ database, signedUser, room }: WithOneRoomInput) => ({
  room: room.observe(),
  members: room.members.observe(),
  newMessagesCount: database.collections
    .get<MessageModel>(Tables.messages)
    .query(
      Q.where('room_id', room.id),
      Q.where('user_id', Q.notEq(signedUser.id)),
      Q.where('created_at', Q.gt(room.lastReadAt ? new Date(room.lastReadAt).getTime() : 0)),
    )
    .observeCount(),
  lastMessage: room.lastMessage?.observe() || of$(null),
  lastMessageSender:
    room.lastMessage
      ?.observe()
      .pipe(switchMap((lastMessage) => lastMessage?.sender?.observe() || of$(null))) || of$(null),
  lastMessageAttachments:
    room.lastMessage
      ?.observe()
      .pipe(switchMap((lastMessage) => lastMessage?.attachments?.observe() || of$(null))) || of$(null),
  lastMessageReadReceipts:
    room.lastMessage
      ?.observe()
      .pipe(
        switchMap(
          (lastMessage) =>
            lastMessage?.readReceipts?.observeWithColumns(['received_at', 'seen_at']) || of$(undefined),
        ),
      ) || of$(undefined),
});

export const withOneRoom = withObservables(['database', 'signedUser', 'room'], getOneRoom);

export type WithOneRoomOutput = WithOneRoomInput & ExtractedObservables<ReturnType<typeof getOneRoom>>;
