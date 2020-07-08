import { Database, Model, Relation, tableSchema } from '@nozbe/watermelondb';
import { date, field, immutableRelation, readonly } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

import { DeepPartial, Tables } from '!/types';
import { prepareUpsert, upsert } from '!/utils/upsert';

import PostModel from './PostModel';
import UserModel from './UserModel';

class CommentModel extends Model {
  static table = Tables.comments;

  static associations: Associations = {
    [Tables.users]: { type: 'belongs_to', key: 'user_id' },
    [Tables.posts]: { type: 'belongs_to', key: 'post_id' },
  };

  @field('content')
  content: string;

  @immutableRelation(Tables.users, 'user_id')
  user: Relation<UserModel>;

  @immutableRelation(Tables.posts, 'post_id')
  post: Relation<PostModel>;

  @readonly
  @date('created_at')
  createdAt: number;
}

export const commentSchema = tableSchema({
  name: Tables.comments,
  columns: [
    { name: 'content', type: 'string' },
    { name: 'user_id', type: 'string' },
    { name: 'post_id', type: 'string' },
    { name: 'created_at', type: 'number' },
  ],
});

export function commentUpdater(changes: DeepPartial<CommentModel>): (record: CommentModel) => void {
  return (record: CommentModel) => {
    if (typeof changes.id !== 'undefined') {
      record._raw.id = changes.id;
    }
    if (typeof changes.content !== 'undefined') {
      record.content = changes.content;
    }
    if (typeof changes.user?.id !== 'undefined') {
      record.user.id = changes.user.id;
    }
    if (typeof changes.post?.id !== 'undefined') {
      record.post.id = changes.post.id;
    }
    if (typeof changes._raw?._status !== 'undefined') {
      record._raw._status = changes._raw._status;
    }
  };
}

export async function upsertComment(
  database: Database,
  comment: CommentModel,
  actionParent?: unknown,
): Promise<CommentModel> {
  return upsert<CommentModel>(database, Tables.comments, comment.id, actionParent, commentUpdater(comment));
}

export async function prepareUpsertComment(database: Database, comment: CommentModel): Promise<CommentModel> {
  return prepareUpsert<CommentModel>(database, Tables.comments, comment.id, commentUpdater(comment));
}

export default CommentModel;
