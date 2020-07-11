import { Database, Model, Query, Relation, tableSchema } from '@nozbe/watermelondb';
import { children, date, field, immutableRelation, readonly } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

import { DeepPartial, Tables } from '!/types';
import { prepareUpsert, upsert } from '!/utils/upsert';

import AttachmentModel from './AttachmentModel';
import CommentModel from './CommentModel';
import UserModel from './UserModel';

class PostModel extends Model {
  static table = Tables.posts;

  static associations: Associations = {
    [Tables.attachments]: { type: 'has_many', foreignKey: 'messageId' },
    [Tables.comments]: { type: 'has_many', foreignKey: 'postId' },
    [Tables.users]: { type: 'belongs_to', key: 'userId' },
  };

  @field('content')
  content: string;

  @immutableRelation(Tables.users, 'userId')
  user: Relation<UserModel>;

  @children(Tables.attachments)
  attachments: Query<AttachmentModel>;

  @children(Tables.comments)
  comments: Query<CommentModel>;

  @readonly
  @date('createdAt')
  createdAt: number;
}

export const postSchema = tableSchema({
  name: Tables.posts,
  columns: [
    { name: 'content', type: 'string' },
    { name: 'userId', type: 'string' },
    { name: 'createdAt', type: 'number' },
  ],
});

export function postUpdater(changes: DeepPartial<PostModel>): (record: PostModel) => void {
  return (record: PostModel) => {
    if (typeof changes.id !== 'undefined') {
      record._raw.id = changes.id;
    }
    if (typeof changes.content !== 'undefined') {
      record.content = changes.content;
    }
    if (typeof changes.user?.id !== 'undefined') {
      record.user.id = changes.user.id;
    }
    if (typeof changes._raw?._status !== 'undefined') {
      record._raw._status = changes._raw._status;
    }
  };
}

export async function upsertPost(
  database: Database,
  post: DeepPartial<PostModel>,
  actionParent?: unknown,
): Promise<PostModel> {
  return upsert<PostModel>(database, Tables.posts, post.id, actionParent, postUpdater(post));
}

export async function prepareUpsertPost(
  database: Database,
  post: DeepPartial<PostModel>,
): Promise<PostModel> {
  return prepareUpsert<PostModel>(database, Tables.posts, post.id, postUpdater(post));
}

export default PostModel;
