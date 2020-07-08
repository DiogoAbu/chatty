import UUIDGenerator from 'react-native-uuid-generator';
import { Database, Model, Q, Relation, tableSchema } from '@nozbe/watermelondb';
import { date, immutableRelation } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Bottleneck from 'bottleneck';

import { DeepPartial, Tables } from '!/types';
import { prepareUpsert, upsert } from '!/utils/upsert';

import MessageModel from './MessageModel';
import RoomModel from './RoomModel';
import UserModel from './UserModel';

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

class ReadReceiptModel extends Model {
  static table = Tables.readReceipts;

  static associations: Associations = {
    [Tables.users]: { type: 'belongs_to', key: 'user_id' },
    [Tables.messages]: { type: 'belongs_to', key: 'message_id' },
    [Tables.rooms]: { type: 'belongs_to', key: 'room_id' },
  };

  @immutableRelation(Tables.users, 'user_id')
  user: Relation<UserModel>;

  @immutableRelation(Tables.messages, 'message_id')
  message: Relation<MessageModel>;

  @immutableRelation(Tables.rooms, 'room_id')
  room: Relation<RoomModel>;

  @date('received_at')
  receivedAt: number | null;

  @date('seen_at')
  seenAt: number | null;
}

export const readReceiptSchema = tableSchema({
  name: Tables.readReceipts,
  columns: [
    { name: 'user_id', type: 'string' },
    { name: 'message_id', type: 'string' },
    { name: 'room_id', type: 'string' },
    { name: 'received_at', type: 'number', isOptional: true },
    { name: 'seen_at', type: 'number', isOptional: true },
  ],
});

export function readReceiptUpdater(
  changes: DeepPartial<ReadReceiptModel>,
): (record: ReadReceiptModel) => void {
  return (record: ReadReceiptModel) => {
    if (typeof changes.id !== 'undefined' && changes.id !== record._raw.id) {
      record._raw.id = changes.id;
    }
    if (typeof changes.user?.id !== 'undefined') {
      record.user.id = changes.user?.id;
    }
    if (typeof changes.message?.id !== 'undefined') {
      record.message.id = changes.message?.id;
    }
    if (typeof changes.room?.id !== 'undefined') {
      record.room.id = changes.room?.id;
    }
    if (typeof changes.receivedAt !== 'undefined') {
      record.receivedAt = changes.receivedAt;
    }
    if (typeof changes.seenAt !== 'undefined') {
      record.seenAt = changes.seenAt;
    }
    if (typeof changes._raw?._status !== 'undefined') {
      record._raw._status = changes._raw._status;
    }
  };
}

export async function upsertReadReceipt(
  database: Database,
  readReceipt: DeepPartial<ReadReceiptModel>,
  actionParent?: unknown,
): Promise<ReadReceiptModel> {
  return upsert<ReadReceiptModel>(
    database,
    Tables.readReceipts,
    readReceipt.id,
    actionParent,
    readReceiptUpdater(readReceipt),
  );
}

export async function prepareUpsertReadReceipt(
  database: Database,
  readReceipt: DeepPartial<ReadReceiptModel>,
): Promise<ReadReceiptModel> {
  return prepareUpsert<ReadReceiptModel>(
    database,
    Tables.readReceipts,
    readReceipt.id,
    readReceiptUpdater(readReceipt),
  );
}

/**
 * If filter is true, get only readReceipts that do not have ID, will return only readReceipts with new ID.
 * */
export async function prepareReadReceipts(
  readReceipts?: DeepPartial<ReadReceiptModel>[],
): Promise<DeepPartial<ReadReceiptModel>[]> {
  if (!readReceipts?.length) {
    return [];
  }

  const wrapped = limiter.wrap(async (readReceipt: DeepPartial<ReadReceiptModel>) => {
    const id = readReceipt.id || (await UUIDGenerator.getRandomUUID());
    return { ...readReceipt, id } as DeepPartial<ReadReceiptModel>;
  });

  return Promise.all(readReceipts.map(wrapped));
}

export async function setReadReceiptsReceivedAt(database: Database, userId: string): Promise<void> {
  const readReceiptsTable = database.collections.get<ReadReceiptModel>(Tables.readReceipts);

  const readReceipts = await readReceiptsTable
    .query(Q.where('user_id', userId), Q.where('received_at', Q.eq(null)))
    .fetch();

  const receivedAt = Date.now();

  const updates = readReceipts.map((e) => {
    return e.prepareUpdate(readReceiptUpdater({ ...e, receivedAt }));
  });

  await database.action(async () => {
    await database.batch(...updates);
  }, 'ReadReceiptModel -> setReadReceiptsReceivedAt');
}

export default ReadReceiptModel;
