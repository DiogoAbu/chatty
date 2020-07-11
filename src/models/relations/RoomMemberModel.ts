import { Database, Model, Q, tableSchema } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

import { DeepPartial, Tables } from '!/types';
import { prepareUpsert, upsert } from '!/utils/upsert';

const SEPARATOR = ',';

class RoomMemberModel extends Model {
  static table = Tables.roomMembers;

  static associations: Associations = {
    [Tables.rooms]: { type: 'belongs_to', key: 'roomId' },
    [Tables.users]: { type: 'belongs_to', key: 'userId' },
  };

  @field('roomId')
  roomId: string;

  @field('userId')
  userId: string;

  @field('isLocalOnly')
  isLocalOnly: boolean;
}

export const roomMemberSchema = tableSchema({
  name: Tables.roomMembers,
  columns: [
    { name: 'userId', type: 'string' },
    { name: 'roomId', type: 'string' },
    { name: 'isLocalOnly', type: 'boolean' },
  ],
});

export function roomMemberUpdater(changes: DeepPartial<RoomMemberModel>): (record: RoomMemberModel) => void {
  return (record: RoomMemberModel) => {
    const roomId = typeof changes.roomId !== 'undefined' ? changes.roomId : record.roomId;
    const userId = typeof changes.userId !== 'undefined' ? changes.userId : record.userId;

    const id = getId({ roomId, userId });
    if (record._raw.id !== id) {
      record._raw.id = id;
    }
    record.roomId = roomId;
    record.userId = userId;

    if (typeof changes.isLocalOnly !== 'undefined') {
      record.isLocalOnly = changes.isLocalOnly;
    }
    if (typeof changes._raw?._status !== 'undefined') {
      record._raw._status = changes._raw._status;
    }
  };
}

export async function upsertRoomMember(
  database: Database,
  roomMember: DeepPartial<RoomMemberModel>,
  actionParent?: unknown,
): Promise<RoomMemberModel> {
  const id = getId(roomMember);
  const memberUpdate: DeepPartial<RoomMemberModel> = { ...roomMember, id };
  return upsert<RoomMemberModel>(
    database,
    Tables.roomMembers,
    memberUpdate.id,
    actionParent,
    roomMemberUpdater(memberUpdate),
  );
}

export async function prepareUpsertRoomMember(
  database: Database,
  roomMember: DeepPartial<RoomMemberModel>,
): Promise<RoomMemberModel> {
  const id = getId(roomMember);
  const memberUpdate: DeepPartial<RoomMemberModel> = { ...roomMember, id };
  return prepareUpsert<RoomMemberModel>(
    database,
    Tables.roomMembers,
    memberUpdate.id,
    roomMemberUpdater(memberUpdate),
  );
}

export function getId(roomMember: DeepPartial<RoomMemberModel>): string {
  return roomMember.roomId! + SEPARATOR + roomMember.userId!;
}

export async function getAllMembersOfRoom(database: Database, roomId: string): Promise<RoomMemberModel[]> {
  const roomMemberTable = database.collections.get<RoomMemberModel>(Tables.roomMembers);
  return roomMemberTable.query(Q.where('roomId', roomId)).fetch();
}

export default RoomMemberModel;
