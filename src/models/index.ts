import { appSchema } from '@nozbe/watermelondb';

import RoomMemberModel, { roomMemberSchema } from './relations/RoomMemberModel';
import AttachmentModel, { attachmentSchema } from './AttachmentModel';
import CommentModel, { commentSchema } from './CommentModel';
import MessageModel, { messageSchema } from './MessageModel';
import PostModel, { postSchema } from './PostModel';
import ReadReceiptModel, { readReceiptSchema } from './ReadReceiptModel';
import RoomModel, { roomSchema } from './RoomModel';
import UserModel, { userSchema } from './UserModel';

export { default as migrations } from './migrations';

export const schema = appSchema({
  version: 6,
  tables: [
    attachmentSchema,
    commentSchema,
    messageSchema,
    postSchema,
    readReceiptSchema,
    roomSchema,
    userSchema,

    // Join tables
    roomMemberSchema,
  ],
});

export const modelClasses = [
  AttachmentModel,
  CommentModel,
  MessageModel,
  PostModel,
  ReadReceiptModel,
  RoomModel,
  UserModel,

  // Join tables
  RoomMemberModel,
] as any[];
