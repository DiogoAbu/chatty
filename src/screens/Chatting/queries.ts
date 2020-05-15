import { MutableRefObject } from 'react';

import { Database } from '@nozbe/watermelondb';
import withObservables from '@nozbe/with-observables';

import AttachmentModel from '!/models/AttachmentModel';
import MessageModel from '!/models/MessageModel';
import RoomModel from '!/models/RoomModel';
import UserModel from '!/models/UserModel';
import { MainRouteProp, Observable, Tables } from '!/types';

import { AttachmentPickerType } from './AttachmentPicker';

export interface WithRoomInput {
  database: Database;
  route: MainRouteProp<'Chatting'>;
}
export interface WithRoomOutput {
  room: Observable<RoomModel>;
}
export const withRoom = withObservables<WithRoomInput, WithRoomOutput>(
  ['database', 'route'],
  ({ database, route }) => {
    // Get from route params
    const { roomId } = route.params;
    const roomTable = database.collections.get<RoomModel>(Tables.rooms);
    return { room: roomTable.findAndObserve(roomId) };
  },
);

export interface WithMembersInput {
  room: RoomModel;
}
export interface WithMembersOutput {
  room: Observable<RoomModel>;
  members: Observable<UserModel[]>;
}
export const withMembers = withObservables<WithMembersInput, WithMembersOutput>(
  ['room'],
  ({ room }) => ({
    room: room?.observe(),
    members: room?.members.observe(),
  }),
);

export interface WithMessagesInput {
  room: RoomModel;
  title: string;
  updateReadTime: () => void;
  attachmentPickerRef: MutableRefObject<AttachmentPickerType | null>;
}
export interface WithMessagesOutput {
  messages: Observable<MessageModel[]>;
}
export const withMessages = withObservables<WithMessagesInput, WithMessagesOutput>(
  ['room'],
  ({ room }) => ({
    messages: room.messages.observeWithColumns(['local_created_at']),
  }),
);

export interface WithMessageInput {
  message: MessageModel;
  title: string;
  isPreviousSameSender?: boolean;
  attachmentPickerRef: MutableRefObject<AttachmentPickerType | null>;
}
export interface WithMessageOutput {
  message: Observable<MessageModel>;
  attachments: Observable<AttachmentModel[]>;
  sender: Observable<UserModel>;
  room: Observable<RoomModel>;
}
export const withMessage = withObservables<WithMessageInput, WithMessageOutput>(
  ['message'],
  ({ message }) => ({
    message: message.observe(),
    attachments: message.attachments.observe(),
    sender: message.sender.observe(),
    room: message.room.observe(),
  }),
);
