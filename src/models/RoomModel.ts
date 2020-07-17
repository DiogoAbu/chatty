import UUIDGenerator from 'react-native-uuid-generator';
import { Database, Model, Q, Query, Relation, tableSchema } from '@nozbe/watermelondb';
import { action, children, date, field, lazy, readonly, relation } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Bottleneck from 'bottleneck';

import { encryptContentUsingPair, encryptContentUsingShared } from '!/services/encryption';
import { DeepPartial, Tables } from '!/types';
import { prepareUpsert, upsert } from '!/utils/upsert';

import RoomMemberModel, {
  getAllMembersOfRoom,
  prepareUpsertRoomMember,
  roomMemberUpdater,
} from './relations/RoomMemberModel';
import AttachmentModel, { attachmentUpdater, prepareAttachments } from './AttachmentModel';
import MessageModel, {
  MessageType,
  messageUpdater,
  prepareMessages,
  prepareUpsertMessage,
} from './MessageModel';
import ReadReceiptModel, { prepareReadReceipts, prepareUpsertReadReceipt } from './ReadReceiptModel';
import UserModel, { prepareUpsertUser, prepareUsers } from './UserModel';

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

class RoomModel extends Model {
  static table = Tables.rooms;

  static associations: Associations = {
    [Tables.messages]: { type: 'has_many', foreignKey: 'roomId' },
    [Tables.readReceipts]: { type: 'has_many', foreignKey: 'roomId' },
    [Tables.roomMembers]: { type: 'has_many', foreignKey: 'roomId' },
  };

  @field('name')
  name: string | null;

  @field('pictureUri')
  pictureUri: string | null;

  @field('isLocalOnly')
  isLocalOnly: boolean;

  @field('isArchived')
  isArchived: boolean;

  @field('sharedKey')
  sharedKey: string;

  // Last time read by me so we can show the badge,
  // messages after this will make up the number
  @date('lastReadAt')
  lastReadAt: number | null;

  // Last time something changed inside the room
  @date('lastChangeAt')
  lastChangeAt: number;

  @readonly
  @date('createdAt')
  createdAt: number;

  @relation(Tables.messages, 'lastMessageId')
  lastMessage: Relation<MessageModel>;

  @children(Tables.messages)
  messages: Query<MessageModel>;

  @children(Tables.readReceipts)
  readReceipts: Query<ReadReceiptModel>;

  @lazy
  members = this.collections.get<UserModel>(Tables.users).query(Q.on(Tables.roomMembers, 'roomId', this.id));

  @action
  async addMessage({
    id: msgId,
    content,
    type,
    sender,
    attachments,
  }: {
    id?: string;
    type?: MessageType;
    content: string;
    sender: UserModel;
    attachments?: DeepPartial<AttachmentModel>[];
  }): Promise<void> {
    const messageDb = this.collections.get<MessageModel>(Tables.messages);
    const attachmentDb = this.collections.get<AttachmentModel>(Tables.attachments);
    const roomMemberDb = this.collections.get<RoomMemberModel>(Tables.roomMembers);

    const batches: Model[] = [];

    const id = msgId ?? (await UUIDGenerator.getRandomUUID());
    const createdAt = Date.now();

    // Create message record and update ui before encrypting content
    const messageCreated = await messageDb.create(
      messageUpdater({
        id,
        content,
        type: type || 'default',
        createdAt,
        sender: { id: sender.id },
        room: { id: this.id },
      }),
    );

    // Get friend`s public key, and if it`s a group get the shared key.
    let encryptKey: string;
    if (!this.name) {
      const friend = (await this.members.fetch()).find((e) => e.id !== sender.id);
      if (!friend) {
        throw new Error('Failed to add message, friend not found');
      }
      if (!friend.publicKey) {
        throw new Error('Failed to add message, friend`s public key not found');
      }
      encryptKey = friend.publicKey;
    } else {
      if (!this.sharedKey) {
        throw new Error('Failed to add message, shared key not found');
      }
      encryptKey = this.sharedKey;
    }

    let cipher: string;
    if (this.name) {
      cipher = await encryptContentUsingShared(content, encryptKey);
    } else {
      cipher = await encryptContentUsingPair(content, encryptKey, sender.secretKey!);
    }
    batches.push(messageCreated.prepareUpdate(messageUpdater({ cipher })));

    // TODO: encrypt attachment remote uri
    const attachmentsWithId = await prepareAttachments(attachments);
    batches.push(
      ...attachmentsWithId.map((each) => {
        const att: DeepPartial<AttachmentModel> = {
          ...each,
          sender: { id: sender.id },
          room: { id: this.id },
          message: { id },
        };
        return attachmentDb.prepareCreate(attachmentUpdater(att));
      }),
    );

    const roomMembers = await roomMemberDb.query(Q.where('roomId', this.id)).fetch();
    batches.push(
      ...roomMembers.map((each) => {
        return each.prepareUpdate(
          roomMemberUpdater({
            ...each,
            isLocalOnly: false,
          }),
        );
      }),
    );

    batches.push(
      this.prepareUpdate(
        roomUpdater({
          isLocalOnly: false,
          isArchived: false,
          lastChangeAt: createdAt,
          lastMessage: { id },
          _raw: { _changed: this.isLocalOnly ? 'isLocalOnly' : '', _status: 'updated' },
        }),
      ),
    );

    await this.batch(...batches);
  }
}

export const roomSchema = tableSchema({
  name: Tables.rooms,
  columns: [
    { name: 'name', type: 'string', isOptional: true },
    { name: 'pictureUri', type: 'string', isOptional: true },
    { name: 'isLocalOnly', type: 'boolean' },
    { name: 'isArchived', type: 'boolean' },
    { name: 'sharedKey', type: 'string' },
    { name: 'lastReadAt', type: 'number', isOptional: true },
    { name: 'lastChangeAt', type: 'number' },
    { name: 'lastMessageId', type: 'string' },
    { name: 'createdAt', type: 'number' },
  ],
});

export function roomUpdater(changes: DeepPartial<RoomModel>): (record: RoomModel) => void {
  return (record: RoomModel) => {
    if (typeof changes.id !== 'undefined') {
      record._raw.id = changes.id;
    }
    if (typeof changes.name !== 'undefined') {
      record.name = changes.name;
    }
    if (typeof changes.pictureUri !== 'undefined') {
      record.pictureUri = changes.pictureUri;
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
    if (typeof changes._raw?._changed !== 'undefined') {
      record._raw._changed = changes._raw._changed;
    }
    if (typeof changes._raw?._status !== 'undefined') {
      record._raw._status = changes._raw._status;
    }
  };
}

export async function upsertRoom(
  database: Database,
  room: DeepPartial<RoomModel>,
  actionParent?: unknown,
): Promise<RoomModel> {
  return upsert<RoomModel>(database, Tables.rooms, room.id, actionParent, roomUpdater(room));
}

export async function prepareUpsertRoom(
  database: Database,
  room: DeepPartial<RoomModel>,
): Promise<RoomModel> {
  return prepareUpsert<RoomModel>(database, Tables.rooms, room.id, roomUpdater(room));
}

export function findRoomIdInCommon(memberMix: RoomMemberModel[]): string | null {
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
  let roomFound = null;

  if (room.id) {
    try {
      roomFound = await roomTable.find(room.id);
    } catch (err) {
      //
    }
  }

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
      .query(Q.or(Q.where('userId', members[0].id!), Q.where('userId', members[1].id!)))
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

export async function createRoom(
  database: Database,
  signedUser: UserModel,
  roomFromServer: DeepPartial<RoomModel>,
  members?: DeepPartial<UserModel>[],
  messages?: DeepPartial<MessageModel>[],
  readReceipts?: DeepPartial<ReadReceiptModel>[],
): Promise<RoomModel> {
  let room = { ...roomFromServer };

  let formerMembersPrepared: RoomMemberModel[] = [];

  // Will be executed at the end
  const funcsAsync: Promise<Model>[] = [];

  const roomFound = await findRoom(database, room, members);
  if (roomFound) {
    // Room came with ID, and local one is different
    if (room.id && room.id !== roomFound.id) {
      // Remove users from join table
      const roomMembers = await getAllMembersOfRoom(database, roomFound.id);
      formerMembersPrepared = roomMembers.map((roomMember) => {
        return roomMember.prepareDestroyPermanently();
      });
    }

    room = {
      ...roomFound._raw,
      ...room,
      id: roomFound.id,
    };
  } else {
    // Make sure room has ID
    room.id = room.id ?? (await UUIDGenerator.getRandomUUID());
    room.lastChangeAt = Date.now();
  }

  if (members?.length) {
    // Make sure every user has ID
    const usersWithId = await prepareUsers(members);

    // Prepare users and user-room join table
    usersWithId.map((user) => {
      funcsAsync.push(
        prepareUpsertRoomMember(database, {
          roomId: room.id,
          userId: user.id,
          isLocalOnly: room.isLocalOnly,
        }),
      );
      funcsAsync.push(prepareUpsertUser(database, user));
    });
  }

  if (messages?.length) {
    room.lastChangeAt = room.lastChangeAt ?? -1;

    // Make sure every message has ID
    const messagesWithId = await prepareMessages(messages, room, members, signedUser);

    // Prepare messages
    messagesWithId.map((message) => {
      // Is more recent than last message
      if (message.createdAt! > room.lastChangeAt! && message.type !== 'sharedKey') {
        room.lastChangeAt = message.createdAt;
        room.lastMessage = { id: message.id! };
      }

      message.room = { id: room.id };

      funcsAsync.push(prepareUpsertMessage(database, message));
    });
  }

  if (readReceipts?.length) {
    // Make sure every read receipt has ID
    const readReceiptsWithId = await prepareReadReceipts(readReceipts);

    // Prepare read receipts
    readReceiptsWithId.map((readReceipt) => {
      funcsAsync.push(prepareUpsertReadReceipt(database, readReceipt));
    });
  }

  funcsAsync.push(prepareUpsertRoom(database, room));

  // Execute all promises
  const batch = await Promise.all(funcsAsync);

  return database.action<RoomModel>(async () => {
    await database.batch(...batch, ...formerMembersPrepared);

    return room;
  }, 'RoomModel -> createRoom');
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
): Promise<void> {
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
    const roomMembers = await roomMembersTable.query(Q.where('roomId', Q.eq(room.id))).fetch();
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

    await database.batch(...(batch.flat(2) as Model[]));
  }, 'RoomModel -> removeRoomsCascade');
}

export async function updateRooms(
  database: Database,
  roomIds: string[],
  roomPartial: DeepPartial<RoomModel>,
): Promise<void> {
  const roomsTable = database.collections.get<RoomModel>(Tables.rooms);

  const rooms = await roomsTable.query(Q.where('id', Q.oneOf(roomIds))).fetch();

  return database.action<void>(async () => {
    const batch = rooms.map((room) => {
      return room.prepareUpdate(roomUpdater(roomPartial));
    });
    return database.batch(...batch);
  }, 'RoomModel -> updateRooms');
}

export default RoomModel;
