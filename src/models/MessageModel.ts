import UUIDGenerator from 'react-native-uuid-generator';
import { Database, Model, Query, Relation, tableSchema } from '@nozbe/watermelondb';
import { children, date, field, immutableRelation } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Bottleneck from 'bottleneck';

import { DeepPartial, Tables } from '!/types';
import { prepareUpsert, upsert } from '!/utils/upsert';

import AttachmentModel from './AttachmentModel';
import RoomModel from './RoomModel';
import UserModel from './UserModel';

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

export enum MessageTypes {
  'default' = 'default',
  'announcement' = 'announcement',
  'sharedKey' = 'sharedKey',
}

class MessageModel extends Model {
  static table = Tables.messages;

  static associations: Associations = {
    [Tables.attachments]: { type: 'has_many', foreignKey: 'message_id' },
    [Tables.users]: { type: 'belongs_to', key: 'user_id' },
    [Tables.rooms]: { type: 'belongs_to', key: 'room_id' },
  };

  @field('content')
  content: string;

  @field('type')
  type: MessageTypes;

  @children(Tables.attachments)
  attachments: Query<AttachmentModel>;

  @immutableRelation(Tables.users, 'user_id')
  sender: Relation<UserModel>;

  @immutableRelation(Tables.rooms, 'room_id')
  room: Relation<RoomModel>;

  @date('local_created_at')
  localCreatedAt: number;

  @date('local_sent_at')
  localSentAt: number | null;

  @date('remote_received_at')
  remoteReceivedAt: number | null;

  @date('remote_opened_at')
  remoteOpenedAt: number | null;
}

export const messageSchema = tableSchema({
  name: Tables.messages,
  columns: [
    { name: 'content', type: 'string' },
    { name: 'type', type: 'string' },
    { name: 'local_created_at', type: 'number' },
    { name: 'local_sent_at', type: 'number', isOptional: true },
    { name: 'remote_received_at', type: 'number', isOptional: true },
    { name: 'remote_opened_at', type: 'number', isOptional: true },
    { name: 'user_id', type: 'string' },
    { name: 'room_id', type: 'string' },
  ],
});

export function messageUpdater(changes: DeepPartial<MessageModel>): (record: MessageModel) => void {
  return (record: MessageModel) => {
    if (typeof changes.id !== 'undefined') {
      record._raw.id = changes.id;
    }
    if (typeof changes.content !== 'undefined') {
      record.content = changes.content;
    }
    if (typeof changes.type !== 'undefined') {
      record.type = changes.type;
    }
    if (typeof changes.localCreatedAt !== 'undefined') {
      record.localCreatedAt = changes.localCreatedAt;
    }
    if (typeof changes.localSentAt !== 'undefined') {
      record.localSentAt = changes.localSentAt;
    }
    if (typeof changes.remoteReceivedAt !== 'undefined') {
      record.remoteReceivedAt = changes.remoteReceivedAt;
    }
    if (typeof changes.remoteOpenedAt !== 'undefined') {
      record.remoteOpenedAt = changes.remoteOpenedAt;
    }
    if (typeof changes.sender?.id !== 'undefined') {
      record.sender.id = changes.sender?.id;
    }
    if (typeof changes.room?.id !== 'undefined') {
      record.room.id = changes.room?.id;
    }
  };
}

export async function upsertMessage(
  database: Database,
  message: DeepPartial<MessageModel>,
  actionParent?: unknown,
): Promise<MessageModel> {
  return upsert<MessageModel>(
    database,
    Tables.messages,
    message.id,
    actionParent,
    messageUpdater(message),
  );
}

export async function prepareUpsertMessage(
  database: Database,
  message: DeepPartial<MessageModel>,
): Promise<MessageModel> {
  return prepareUpsert<MessageModel>(
    database,
    Tables.messages,
    message.id,
    messageUpdater(message),
  );
}

export async function prepareMessagesId(
  messages: DeepPartial<MessageModel>[],
  filter = true,
): Promise<DeepPartial<MessageModel>[]> {
  if (!messages) {
    return [];
  }
  let withoutId = messages;

  if (filter) {
    // Get only messages that do not have ID, will return only messages with new ID.
    withoutId = withoutId.filter((e) => !e.id);
  }

  if (!withoutId.length) {
    return [];
  }

  const wrapped = limiter.wrap(async (message: DeepPartial<MessageModel>) => {
    const id = await UUIDGenerator.getRandomUUID();
    return { ...message, id } as DeepPartial<MessageModel>;
  });

  return Promise.all(withoutId.map(wrapped));
}

export default MessageModel;
