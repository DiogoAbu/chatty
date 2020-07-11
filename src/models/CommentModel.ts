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
    [Tables.users]: { type: 'belongs_to', key: 'userId' },
    [Tables.posts]: { type: 'belongs_to', key: 'postId' },
  };

  @field('content')
  content: string;

  @immutableRelation(Tables.users, 'userId')
  user: Relation<UserModel>;

  @immutableRelation(Tables.posts, 'postId')
  post: Relation<PostModel>;

  @readonly
  @date('createdAt')
  createdAt: number;
}

export const commentSchema = tableSchema({
  name: Tables.comments,
  columns: [
    { name: 'content', type: 'string' },
    { name: 'userId', type: 'string' },
    { name: 'postId', type: 'string' },
    { name: 'createdAt', type: 'number' },
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
