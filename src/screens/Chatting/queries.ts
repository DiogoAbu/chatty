import { MutableRefObject } from 'react';

import { Database, Q } from '@nozbe/watermelondb';
import withObservables, { ExtractedObservables } from '@nozbe/with-observables';

import MessageModel from '!/models/MessageModel';
import RoomModel from '!/models/RoomModel';
import { MainRouteProp, Tables } from '!/types';

import { AttachmentPickerType } from './AttachmentPicker';

///////////////
// With Room //
///////////////
export interface WithRoomInput {
  database: Database;
  route: MainRouteProp<'Chatting'>;
}

const getRoom = ({ database, route }: WithRoomInput) => {
  // Get from route params
  const { roomId } = route.params;
  const roomTable = database.collections.get<RoomModel>(Tables.rooms);
  return { room: roomTable.findAndObserve(roomId) };
};

export const withRoom = withObservables(['database', 'route'], getRoom);

export type WithRoomOutput = WithRoomInput & ExtractedObservables<ReturnType<typeof getRoom>>;

//////////////////
// With Members //
//////////////////
export interface WithMembersInput {
  room: RoomModel;
}

const getMembers = ({ room }: WithMembersInput) => ({
  room: room?.observe(),
  members: room?.members.observe(),
});

export const withMembers = withObservables(['room'], getMembers);

export type WithMembersOutput = WithMembersInput & ExtractedObservables<ReturnType<typeof getMembers>>;

///////////////////
// With Messages //
///////////////////
export interface WithMessagesInput {
  room: RoomModel;
  title: string;
  attachmentPickerRef: MutableRefObject<AttachmentPickerType | null>;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

const getMessages = ({ room, page }: WithMessagesInput) => ({
  messages: room.messages
    .extend(
      Q.where('type', Q.notEq('sharedKey')),
      Q.experimentalSortBy('createdAt', 'desc'),
      Q.experimentalTake(100 * (page || 1)),
    )
    .observeWithColumns(['createdAt', 'sentAt']),
});

export const withMessages = withObservables(['room', 'page'], getMessages);

export type WithMessagesOutput = WithMessagesInput & ExtractedObservables<ReturnType<typeof getMessages>>;

//////////////////
// With Message //
//////////////////
export interface WithMessageInput {
  message: MessageModel;
  title: string;
  isPreviousSameSender?: boolean;
  attachmentPickerRef: MutableRefObject<AttachmentPickerType | null>;
}

const getMessage = ({ message }: WithMessageInput) => ({
  message: message.observe(),
  attachments: message.attachments.observe(),
  readReceipts: message.readReceipts.observe(),
  sender: message.sender.observe(),
  room: message.room.observe(),
});

export const withMessage = withObservables(['message'], getMessage);

export type WithMessageOutput = WithMessageInput & ExtractedObservables<ReturnType<typeof getMessage>>;
