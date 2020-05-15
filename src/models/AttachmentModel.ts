import UUIDGenerator from 'react-native-uuid-generator';
import { Database, Model, Relation, tableSchema } from '@nozbe/watermelondb';
import { field, immutableRelation } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Bottleneck from 'bottleneck';

import { DeepPartial, Tables } from '!/types';
import { prepareUpsert, upsert } from '!/utils/upsert';

import MessageModel from './MessageModel';
import PostModel from './PostModel';
import RoomModel from './RoomModel';
import UserModel from './UserModel';

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

export enum AttachmentTypes {
  'image' = 'image',
  'video' = 'video',
  'document' = 'document',
}

class AttachmentModel extends Model {
  static table = Tables.attachments;

  static associations: Associations = {
    [Tables.users]: { type: 'belongs_to', key: 'user_id' },

    // For rooms
    [Tables.rooms]: { type: 'belongs_to', key: 'room_id' },
    [Tables.messages]: { type: 'belongs_to', key: 'message_id' },

    // For posts
    [Tables.posts]: { type: 'belongs_to', key: 'post_id' },
  };

  // @ts-ignore
  @field('uri')
  uri: string;

  // @ts-ignore
  @field('remoteUri')
  remoteUri: string;

  // @ts-ignore
  @field('type')
  type: AttachmentTypes;

  // @ts-ignore
  @field('width')
  width: number;

  // @ts-ignore
  @field('height')
  height: number;

  // @ts-ignore
  @immutableRelation(Tables.users, 'user_id')
  sender: Relation<UserModel>;

  // @ts-ignore
  @immutableRelation(Tables.rooms, 'room_id')
  room: Relation<RoomModel>;

  // @ts-ignore
  @immutableRelation(Tables.messages, 'message_id')
  message: Relation<MessageModel>;

  // @ts-ignore
  @immutableRelation(Tables.posts, 'post_id')
  post: Relation<PostModel>;
}

export const attachmentSchema = tableSchema({
  name: Tables.attachments,
  columns: [
    { name: 'uri', type: 'string' },
    { name: 'remoteUri', type: 'string' },
    { name: 'type', type: 'string' },
    { name: 'width', type: 'number' },
    { name: 'height', type: 'number' },
    { name: 'user_id', type: 'string' },
    { name: 'room_id', type: 'string' },
    { name: 'message_id', type: 'string' },
    { name: 'post_id', type: 'string' },
  ],
});

export function attachmentUpdater(changes: DeepPartial<AttachmentModel>) {
  return (record: AttachmentModel) => {
    if (typeof changes.id !== 'undefined') {
      record._raw.id = changes.id;
    }
    if (typeof changes.uri !== 'undefined') {
      record.uri = changes.uri;
    }
    if (typeof changes.remoteUri !== 'undefined') {
      record.remoteUri = changes.remoteUri;
    }
    if (typeof changes.type !== 'undefined') {
      record.type = changes.type;
    }
    if (typeof changes.width !== 'undefined') {
      record.width = changes.width;
    }
    if (typeof changes.height !== 'undefined') {
      record.height = changes.height;
    }
    if (typeof changes.sender?.id !== 'undefined') {
      record.sender.id = changes.sender?.id;
    }
    if (typeof changes.room?.id !== 'undefined') {
      record.room.id = changes.room?.id;
    }
    if (typeof changes.message?.id !== 'undefined') {
      record.message.id = changes.message?.id;
    }
    if (typeof changes.post?.id !== 'undefined') {
      record.post.id = changes.post?.id;
    }
  };
}

export async function upsertAttachment(
  database: Database,
  attachment: DeepPartial<AttachmentModel>,
  actionParent?: any,
) {
  return upsert<AttachmentModel>(
    database,
    Tables.attachments,
    attachment.id,
    actionParent,
    attachmentUpdater(attachment),
  );
}

export async function prepareUpsertAttachment(
  database: Database,
  attachment: DeepPartial<AttachmentModel>,
) {
  return prepareUpsert<AttachmentModel>(
    database,
    Tables.attachments,
    attachment.id,
    attachmentUpdater(attachment),
  );
}

/**
 * If filter is true, get only attachments that do not have ID, will return only attachments with new ID.
 * */
export async function prepareAttachmentsId(
  attachments?: DeepPartial<AttachmentModel>[],
  filter = true,
) {
  if (!attachments?.length) {
    return [];
  }
  let withoutId = attachments;

  if (filter) {
    // Get only attachments that do not have ID, will return only attachments with new ID.
    withoutId = withoutId.filter((e) => !e.id);
  }

  if (!withoutId.length) {
    return [];
  }

  const wrapped = limiter.wrap(async (attachment: DeepPartial<AttachmentModel>) => {
    const id = await UUIDGenerator.getRandomUUID();
    return { ...attachment, id } as DeepPartial<AttachmentModel>;
  });

  return Promise.all(withoutId.map(wrapped));
}

export default AttachmentModel;
