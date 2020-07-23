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

export type AttachmentType = 'image' | 'video' | 'document';

class AttachmentModel extends Model {
  static table = Tables.attachments;

  static associations: Associations = {
    [Tables.users]: { type: 'belongs_to', key: 'userId' },

    // For rooms
    [Tables.rooms]: { type: 'belongs_to', key: 'roomId' },
    [Tables.messages]: { type: 'belongs_to', key: 'messageId' },

    // For posts
    [Tables.posts]: { type: 'belongs_to', key: 'postId' },
  };

  @field('uri')
  uri: string;

  @field('remoteUri')
  remoteUri: string;

  @field('cipherUri')
  cipherUri: string;

  @field('type')
  type: AttachmentType;

  @field('width')
  width: number;

  @field('height')
  height: number;

  @immutableRelation(Tables.users, 'userId')
  sender: Relation<UserModel>;

  @immutableRelation(Tables.rooms, 'roomId')
  room: Relation<RoomModel>;

  @immutableRelation(Tables.messages, 'messageId')
  message: Relation<MessageModel>;

  @immutableRelation(Tables.posts, 'postId')
  post: Relation<PostModel>;
}

export const attachmentSchema = tableSchema({
  name: Tables.attachments,
  columns: [
    { name: 'uri', type: 'string' },
    { name: 'remoteUri', type: 'string' },
    { name: 'cipherUri', type: 'string' },
    { name: 'type', type: 'string' },
    { name: 'width', type: 'number' },
    { name: 'height', type: 'number' },
    { name: 'userId', type: 'string' },
    { name: 'roomId', type: 'string' },
    { name: 'messageId', type: 'string' },
    { name: 'postId', type: 'string' },
  ],
});

export function attachmentUpdater(changes: DeepPartial<AttachmentModel>): (record: AttachmentModel) => void {
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
    if (typeof changes.cipherUri !== 'undefined') {
      record.cipherUri = changes.cipherUri;
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
    if (typeof changes._raw?._status !== 'undefined') {
      record._raw._status = changes._raw._status;
    }
  };
}

export async function upsertAttachment(
  database: Database,
  attachment: DeepPartial<AttachmentModel>,
  actionParent?: unknown,
): Promise<AttachmentModel> {
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
): Promise<AttachmentModel> {
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
export async function prepareAttachments(
  attachments?: DeepPartial<AttachmentModel>[],
): Promise<DeepPartial<AttachmentModel>[]> {
  if (!attachments?.length) {
    return [];
  }

  const wrapped = limiter.wrap(async (attachment: DeepPartial<AttachmentModel>) => {
    const id = attachment.id || (await UUIDGenerator.getRandomUUID());
    return { ...attachment, id } as DeepPartial<AttachmentModel>;
  });

  return Promise.all(attachments.map(wrapped));
}

export default AttachmentModel;
