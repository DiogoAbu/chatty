import { Database, Q } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';
import { of as of$ } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import AttachmentModel from '!/models/AttachmentModel';
import MessageModel from '!/models/MessageModel';
import RoomModel from '!/models/RoomModel';
import UserModel from '!/models/UserModel';
import { Observable, Tables } from '!/types';

export interface WithRoomsInput {
  user: UserModel;
  archivedOnly?: boolean;
}
export interface WithRoomsOutput {
  rooms: Observable<RoomModel[]>;
}
export const withRooms = withObservables<WithRoomsInput, WithRoomsOutput>(
  ['user', 'archivedOnly'],
  ({ user, archivedOnly }) => {
    if (archivedOnly) {
      return {
        rooms: user.roomsArchived.observeWithColumns(['is_archived']),
      };
    }
    return {
      rooms: user.rooms.observeWithColumns(['last_change_at', 'last_message_id', 'is_archived']),
    };
  },
);

export interface WithRoomInput {
  database: Database;
  signedUser: UserModel;
  room: RoomModel;
  isSelecting: boolean;
  toggleSelected: (userId: string) => void;
  getSelected: (userId: string) => boolean;
}
export interface WithRoomOutput {
  room: Observable<RoomModel>;
  members: Observable<UserModel[]>;
  newMessagesCount: Observable<number>;
  lastMessage: Observable<MessageModel | null>;
  lastMessageSender: Observable<UserModel | null>;
  lastMessageAttachments: Observable<AttachmentModel[] | null>;
}
export const withRoom = withObservables<WithRoomInput, WithRoomOutput>(
  ['database', 'signedUser', 'room'],
  ({ database, signedUser, room }) => ({
    room: room.observe(),
    members: room.members.observe(),
    newMessagesCount: database.collections
      .get<MessageModel>(Tables.messages)
      .query(
        Q.where('room_id', room.id),
        Q.where('user_id', Q.notEq(signedUser.id)),
        Q.where(
          'local_created_at',
          Q.gt(room.lastReadAt ? new Date(room.lastReadAt).getTime() : 0),
        ),
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
        .pipe(switchMap((lastMessage) => lastMessage?.attachments?.observe() || of$(null))) ||
      of$(null),
  }),
);
