import UUIDGenerator from 'react-native-uuid-generator';
import { Database, Model, Q, Query, Relation, tableSchema } from '@nozbe/watermelondb';
import { action, children, date, field, immutableRelation } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Bottleneck from 'bottleneck';

import { decryptContentUsingPair, decryptContentUsingShared } from '!/services/encryption';
import { DeepPartial, Tables } from '!/types';
import { prepareUpsert, upsert } from '!/utils/upsert';

import AttachmentModel from './AttachmentModel';
import ReadReceiptModel from './ReadReceiptModel';
import RoomModel from './RoomModel';
import UserModel from './UserModel';

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

export type MessageType = 'default' | 'announcement' | 'sharedKey';

class MessageModel extends Model {
  static table = Tables.messages;

  static associations: Associations = {
    [Tables.attachments]: { type: 'has_many', foreignKey: 'messageId' },
    [Tables.readReceipts]: { type: 'has_many', foreignKey: 'messageId' },
    [Tables.users]: { type: 'belongs_to', key: 'userId' },
    [Tables.rooms]: { type: 'belongs_to', key: 'roomId' },
  };

  @field('content')
  content: string;

  @field('cipher')
  cipher: string;

  @field('type')
  type: MessageType;

  @date('sentAt')
  sentAt: number | null;

  @date('createdAt')
  createdAt: number;

  @immutableRelation(Tables.users, 'userId')
  sender: Relation<UserModel>;

  @immutableRelation(Tables.rooms, 'roomId')
  room: Relation<RoomModel>;

  @children(Tables.attachments)
  attachments: Query<AttachmentModel>;

  @children(Tables.readReceipts)
  readReceipts: Query<ReadReceiptModel>;

  @action
  async prepareMarkAsSeen(userId: string, timestamp: number): Promise<ReadReceiptModel> {
    const readReceiptsTable = this.collections.get<ReadReceiptModel>(Tables.readReceipts);

    const readReceipts = await readReceiptsTable
      .query(Q.where('userId', userId), Q.where('messageId', this.id))
      .fetch();

    if (!readReceipts?.length) {
      const id = await UUIDGenerator.getRandomUUID();
      return readReceiptsTable.prepareCreate((record) => {
        record._raw.id = id;
        record.user.id = userId;
        record.message.id = this.id;
        record.receivedAt = timestamp;
        record.seenAt = timestamp;
      });
    }

    const readReceipt = readReceipts[0];

    if (readReceipts.length > 1) {
      await Promise.all(
        readReceipts.map(async (e) => {
          if (readReceipt.id === e.id) {
            return null;
          }
          return e.destroyPermanently();
        }),
      );
    }

    if (!readReceipt.seenAt) {
      return readReceipt.prepareUpdate((record) => {
        record.receivedAt = record.receivedAt ?? timestamp;
        record.seenAt = timestamp;
      });
    }

    return (null as unknown) as ReadReceiptModel;
  }
}

export const messageSchema = tableSchema({
  name: Tables.messages,
  columns: [
    { name: 'content', type: 'string' },
    { name: 'cipher', type: 'string' },
    { name: 'type', type: 'string' },
    { name: 'sentAt', type: 'number', isOptional: true },
    { name: 'createdAt', type: 'number' },
    { name: 'userId', type: 'string' },
    { name: 'roomId', type: 'string' },
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
    if (typeof changes.cipher !== 'undefined') {
      record.cipher = changes.cipher;
    }
    if (typeof changes.type !== 'undefined') {
      record.type = changes.type;
    }
    if (typeof changes.sentAt !== 'undefined') {
      record.sentAt = changes.sentAt;
    }
    if (typeof changes.createdAt !== 'undefined') {
      record.createdAt = changes.createdAt;
    }
    if (typeof changes.sender?.id !== 'undefined') {
      record.sender.id = changes.sender?.id;
    }
    if (typeof changes.room?.id !== 'undefined') {
      record.room.id = changes.room?.id;
    }
    if (typeof changes._raw?._status !== 'undefined') {
      record._raw._status = changes._raw._status;
    }
  };
}

export async function upsertMessage(
  database: Database,
  message: DeepPartial<MessageModel>,
  actionParent?: unknown,
): Promise<MessageModel> {
  return upsert<MessageModel>(database, Tables.messages, message.id, actionParent, messageUpdater(message));
}

export async function prepareUpsertMessage(
  database: Database,
  message: DeepPartial<MessageModel>,
): Promise<MessageModel> {
  return prepareUpsert<MessageModel>(database, Tables.messages, message.id, messageUpdater(message));
}

export async function prepareMessages(
  messages?: DeepPartial<MessageModel>[],
  room?: DeepPartial<RoomModel>,
  members?: DeepPartial<UserModel>[],
  signedUser?: UserModel,
): Promise<DeepPartial<MessageModel>[]> {
  if (!messages?.length) {
    return [];
  }

  const wrapped = limiter.wrap(async (message: DeepPartial<MessageModel>) => {
    const id = message.id || (await UUIDGenerator.getRandomUUID());

    let content = message.content;
    if (message.cipher) {
      if (room?.name && room.sharedKey) {
        content = await decryptContentUsingShared(message.cipher, room.sharedKey);
      } else {
        const sender = members?.find((e) => e.id === message.sender?.id);
        if (sender?.publicKey) {
          content = await decryptContentUsingPair(message.cipher, sender.publicKey, signedUser!.secretKey!);
        } else {
          console.log('prepareMessages sender publicKey not found');
        }
      }
    }

    return { ...message, content, id } as DeepPartial<MessageModel>;
  });

  return Promise.all(messages.map(wrapped));
}

export default MessageModel;
