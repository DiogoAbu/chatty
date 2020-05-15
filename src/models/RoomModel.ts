import UUIDGenerator from 'react-native-uuid-generator';
import { Database, Model, Q, Query, Relation, tableSchema } from '@nozbe/watermelondb';
import { action, children, date, field, lazy, relation } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Bottleneck from 'bottleneck';

import { DeepPartial, Tables } from '!/types';
import { prepareUpsert, upsert } from '!/utils/upsert';

import RoomMemberModel, {
  getAllMembersOfRoom,
  prepareUpsertRoomMember,
} from './relations/RoomMemberModel';
import AttachmentModel, { attachmentUpdater, prepareAttachmentsId } from './AttachmentModel';
import MessageModel, { prepareMessagesId, prepareUpsertMessage } from './MessageModel';
import UserModel, { prepareUpsertUser, prepareUsersId } from './UserModel';

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

class RoomModel extends Model {
  static table = Tables.rooms;

  static associations: Associations = {
    [Tables.messages]: { type: 'has_many', foreignKey: 'room_id' },
    [Tables.roomMembers]: { type: 'has_many', foreignKey: 'room_id' },
  };

  // @ts-ignore
  @field('name')
  name: string | null;

  // @ts-ignore
  @field('picture')
  picture: string | null;

  // @ts-ignore
  @field('is_local_only')
  isLocalOnly: boolean;

  // @ts-ignore
  @field('is_archived')
  isArchived: boolean;

  // @ts-ignore
  @field('shared_key')
  sharedKey: string;

  // @ts-ignore
  // Last time read by me so we can show the badge,
  // messages after this will make up the number
  @date('last_read_at')
  lastReadAt: number | null;

  // @ts-ignore
  @date('last_change_at')
  lastChangeAt: number;

  // @ts-ignore
  @relation(Tables.messages, 'last_message_id')
  lastMessage: Relation<MessageModel>;

  // @ts-ignore
  @children(Tables.messages)
  messages: Query<MessageModel>;

  @lazy
  members = this.collections
    .get<UserModel>(Tables.users)
    .query(Q.on(Tables.roomMembers, 'room_id', this.id));

  @action
  async addMessage({
    content,
    senderId,
    messageId,
    attachments,
  }: {
    content: string;
    senderId: string;
    messageId?: string;
    attachments?: DeepPartial<AttachmentModel>[];
  }) {
    const messageDb = this.collections.get<MessageModel>(Tables.messages);
    const attachmentDb = this.collections.get<AttachmentModel>(Tables.attachments);

    const uuid = messageId ?? (await UUIDGenerator.getRandomUUID());

    const attachmentsWithId = await prepareAttachmentsId(attachments);

    const batches = attachmentsWithId.map((each) => {
      const att: DeepPartial<AttachmentModel> = {
        ...each,
        sender: { id: senderId },
        room: { id: this.id },
        message: { id: uuid },
      };
      return attachmentDb.prepareCreate(attachmentUpdater(att));
    });

    const localCreatedAt = Date.now();

    await this.batch(
      messageDb.prepareCreate((record) => {
        record._raw.id = uuid;
        record.content = content;
        record.localCreatedAt = localCreatedAt;
        record.sender.id = senderId;
        record.room.set(this);

        // Already has ID from server
        if (messageId) {
          record._raw._status = 'synced';
        }
      }),
      // @ts-ignore Expected 1 arguments, but got 3 or more
      ...batches,
      this.prepareUpdate((record) => {
        record.isLocalOnly = false;
        record.isArchived = false;
        record.lastChangeAt = localCreatedAt;
        record.lastMessage.id = uuid;
        record._raw._status = 'synced';
      }),
    );
  }
}

export const roomSchema = tableSchema({
  name: Tables.rooms,
  columns: [
    { name: 'name', type: 'string', isOptional: true },
    { name: 'picture', type: 'string', isOptional: true },
    { name: 'is_local_only', type: 'boolean' },
    { name: 'is_archived', type: 'boolean' },
    { name: 'shared_key', type: 'string' },
    { name: 'last_read_at', type: 'number', isOptional: true },
    { name: 'last_change_at', type: 'number' },
    { name: 'last_message_id', type: 'string' },
  ],
});

export function roomUpdater(changes: DeepPartial<RoomModel>) {
  return (record: RoomModel) => {
    if (typeof changes.id !== 'undefined') {
      record._raw.id = changes.id;
    }
    if (typeof changes.name !== 'undefined') {
      record.name = changes.name;
    }
    if (typeof changes.picture !== 'undefined') {
      record.picture = changes.picture;
    }
    if (typeof changes.isLocalOnly !== 'undefined') {
      record.isLocalOnly = changes.isLocalOnly;
    }
    if (typeof changes.isArchived !== 'undefined') {
      record.isArchived = changes.isArchived;
    }
    if (typeof changes.sharedKey !== 'undefined') {
      record.sharedKey = changes.sharedKey;
    }
    if (typeof changes.lastReadAt !== 'undefined') {
      record.lastReadAt = changes.lastReadAt;
    }
    if (typeof changes.lastChangeAt !== 'undefined') {
      record.lastChangeAt = changes.lastChangeAt;
    }
    if (typeof changes.lastMessage?.id !== 'undefined') {
      record.lastMessage.id = changes.lastMessage?.id;
    }
  };
}

export async function upsertRoom(
  database: Database,
  room: DeepPartial<RoomModel>,
  actionParent?: any,
) {
  return upsert<RoomModel>(database, Tables.rooms, room.id, actionParent, roomUpdater(room));
}

export async function prepareUpsertRoom(database: Database, room: DeepPartial<RoomModel>) {
  return prepareUpsert<RoomModel>(database, Tables.rooms, room.id, roomUpdater(room));
}

export function findRoomIdInCommon(memberMix: RoomMemberModel[]) {
  const roomIds = memberMix.map((e) => e.roomId);

  // Count the repeated rooms using Map.
  const mapped = [
    ...roomIds.reduce((map, roomId) => {
      // Add one to already existing
      return map.set(roomId, (map.get(roomId) || 0) + 1);
    }, new Map<string, number>()),
  ];

  // Get the one that repeated 2 times, one time for the user and another for the friend.
  const found = mapped.find(([_, amount]) => amount === 2);

  // Map is [roomId, amount]
  return found ? found[0] : null;
}

export async function findRoom(
  database: Database,
  room: DeepPartial<RoomModel>,
  members?: DeepPartial<UserModel>[],
): Promise<RoomModel | null> {
  const roomTable = database.collections.get<RoomModel>(Tables.rooms);

  // Find room by ID
  const roomFound = room.id ? await roomTable.find(room.id) : null;

  // Return if found
  if (roomFound) {
    return roomFound;
  }

  // Different groups can have the same members
  if (room.name) {
    return null;
  }

  // It's not a group chat (no name) so it can only have two members
  if (members && members.length === 2) {
    const memberTable = database.collections.get<RoomMemberModel>(Tables.roomMembers);

    // Find all the rooms for both members
    const memberMix = await memberTable
      .query(Q.or(Q.where('user_id', members[0].id!), Q.where('user_id', members[1].id!)))
      .fetch();

    if (memberMix.length) {
      // Find the room that both members share
      const roomId = findRoomIdInCommon(memberMix);
      if (!roomId) {
        return null;
      }

      const roomInCommon = await roomTable.find(roomId);

      // Members share a group, but we want a private chat
      return roomInCommon.name ? null : roomInCommon;
    }
  }

  // No room found
  return null;
}

export async function createRoomAndMembers(
  database: Database,
  roomFromServer: DeepPartial<RoomModel>,
  members?: DeepPartial<UserModel>[],
  messages?: DeepPartial<MessageModel>[],
): Promise<string> {
  let room = { ...roomFromServer };

  let formerMembersPrepared: RoomMemberModel[] = [];

  // Will be executed at the end
  const funcsAsync: Promise<UserModel | RoomModel | RoomMemberModel | MessageModel>[] = [];

  const roomFound = await findRoom(database, room, members);
  if (roomFound) {
    // Update room to be used outside of this scope
    room = roomFound;

    // Room came with ID, and local one is different
    if (room.id && room.id !== roomFound.id) {
      // Remove users from join table
      const roomMembers = await getAllMembersOfRoom(database, roomFound.id);
      formerMembersPrepared = roomMembers.map((roomMember) => {
        return roomMember.prepareDestroyPermanently();
      });
    }
  } else {
    // Make sure room has ID
    room.id = room.id ?? (await UUIDGenerator.getRandomUUID());
    room.lastChangeAt = Date.now();
  }

  if (members) {
    // Make sure every user has ID
    const usersWithId = await prepareUsersId(members, false);

    // Prepare users and user-room join table
    usersWithId.map((user) => {
      funcsAsync.push(prepareUpsertRoomMember(database, { roomId: room.id, userId: user.id }));
      funcsAsync.push(prepareUpsertUser(database, user));
    });
  }

  if (messages) {
    room.lastChangeAt = room.lastChangeAt ?? -1;

    // Make sure every message has ID
    const messagesWithId = await prepareMessagesId(messages, false);

    // Prepare messages
    messagesWithId.map((message) => {
      // Is more recent than last message
      if (message.localCreatedAt! > room.lastChangeAt!) {
        room.lastChangeAt = message.localCreatedAt;

        // Set ID of message on room
        if (room.lastMessage) {
          room.lastMessage.id = message.id!;
        } else {
          room.lastMessage = { id: message.id! };
        }
      }

      message.room = { ...message.room, id: room.id };

      funcsAsync.push(prepareUpsertMessage(database, message));
    });
  }

  funcsAsync.push(prepareUpsertRoom(database, room));

  return database.action<string>(async () => {
    // Execute all promises
    const batch = await Promise.all(funcsAsync);

    await database.batch(...batch, ...formerMembersPrepared);

    return room.id!;
  }, 'createRoomAndMembers');
}

async function removeUserIfNoRooms(user: UserModel, isLocalOnly: boolean) {
  // The user rooms are only the non-local ones
  const roomAmount = await user.rooms.fetchCount();

  // We have to account for the current room if it's local only
  const checkAmount = 0 + (isLocalOnly ? 0 : 1);

  if (roomAmount <= checkAmount) {
    return user.prepareDestroyPermanently();
  }

  return null;
}

export async function removeRoomsCascade(
  database: Database,
  roomIds: string[],
  signedUserId: string,
) {
  const roomsTable = database.collections.get<RoomModel>(Tables.rooms);
  const roomMembersTable = database.collections.get<RoomMemberModel>(Tables.roomMembers);

  // Get room that will be removed
  const rooms = await roomsTable.query(Q.where('id', Q.oneOf(roomIds))).fetch();

  // Execute for each room
  const wrapped = limiter.wrap(async (room: RoomModel) => {
    // Will be executed at the end
    const funcsAsync: Promise<UserModel | null>[] = [];

    // Prepare room
    const roomPrepared = room.prepareDestroyPermanently();

    // Prepare messages
    const messagesPrepared = (await room.messages.fetch()).map((message) => {
      return message.prepareDestroyPermanently();
    });

    // Prepare members
    (await room.members.fetch()).map((member) => {
      // Not current user
      if (member.id !== signedUserId) {
        funcsAsync.push(removeUserIfNoRooms(member, room.isLocalOnly));
      }
    });

    // Get members of the room from join table
    const roomMembers = await roomMembersTable.query(Q.where('room_id', Q.eq(room.id))).fetch();
    const membersPrepared = roomMembers.map((roomMember) => {
      return roomMember.prepareDestroyPermanently();
    });

    // Execute all promises
    const funcs = await Promise.all(funcsAsync);

    return [roomPrepared, messagesPrepared, membersPrepared, ...funcs];
  });

  return database.action<void>(async () => {
    // Execute all promises
    const batch = await Promise.all(rooms.map(wrapped));

    await database.batch(...batch.flat(2));
  }, 'removeRoomsCascade');
}

export async function updateRooms(
  database: Database,
  roomIds: string[],
  roomPartial: DeepPartial<RoomModel>,
) {
  const roomsTable = database.collections.get<RoomModel>(Tables.rooms);

  const rooms = await roomsTable.query(Q.where('id', Q.oneOf(roomIds))).fetch();

  return database.action<void>(async () => {
    const batch = rooms.map((room) => {
      return room.prepareUpdate(roomUpdater(roomPartial));
    });
    return database.batch(...batch);
  });
}

export default RoomModel;
