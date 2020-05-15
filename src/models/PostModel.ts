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
    [Tables.attachments]: { type: 'has_many', foreignKey: 'message_id' },
    [Tables.comments]: { type: 'has_many', foreignKey: 'post_id' },
    [Tables.users]: { type: 'belongs_to', key: 'user_id' },
  };

  // @ts-ignore
  @field('content')
  content: string;

  // @ts-ignore
  @immutableRelation(Tables.users, 'user_id')
  user: Relation<UserModel>;

  // @ts-ignore
  @children(Tables.attachments)
  attachments: Query<AttachmentModel>;

  // @ts-ignore
  @children(Tables.comments)
  comments: Query<CommentModel>;

  // @ts-ignore
  @readonly
  // @ts-ignore
  @date('created_at')
  createdAt: number;
}

export const postSchema = tableSchema({
  name: Tables.posts,
  columns: [
    { name: 'content', type: 'string' },
    { name: 'user_id', type: 'string' },
    { name: 'created_at', type: 'number' },
  ],
});

export function postUpdater(changes: DeepPartial<PostModel>) {
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
  };
}

export async function upsertPost(
  database: Database,
  post: DeepPartial<PostModel>,
  actionParent?: any,
) {
  return upsert<PostModel>(database, Tables.posts, post.id, actionParent, postUpdater(post));
}

export async function prepareUpsertPost(database: Database, post: DeepPartial<PostModel>) {
  return prepareUpsert<PostModel>(database, Tables.posts, post.id, postUpdater(post));
}

export default PostModel;
