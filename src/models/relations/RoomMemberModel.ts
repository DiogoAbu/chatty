import UUIDGenerator from 'react-native-uuid-generator';
import { Database, Model, Q, tableSchema } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';

import { DeepPartial, Tables } from '!/types';
import { prepareUpsert, upsert } from '!/utils/upsert';

class RoomMemberModel extends Model {
  static table = Tables.roomMembers;

  static associations: Associations = {
    [Tables.rooms]: { type: 'belongs_to', key: 'room_id' },
    [Tables.users]: { type: 'belongs_to', key: 'user_id' },
  };

  @field('room_id')
  roomId: string;

  @field('user_id')
  userId: string;
}

export const roomMemberSchema = tableSchema({
  name: Tables.roomMembers,
  columns: [
    { name: 'user_id', type: 'string' },
    { name: 'room_id', type: 'string' },
  ],
});

export function roomMemberUpdater(
  changes: DeepPartial<RoomMemberModel>,
): (record: RoomMemberModel) => void {
  return (record: RoomMemberModel) => {
    if (typeof changes.id !== 'undefined') {
      record._raw.id = changes.id;
    }
    if (typeof changes.roomId !== 'undefined') {
      record.roomId = changes.roomId;
    }
    if (typeof changes.userId !== 'undefined') {
      record.userId = changes.userId;
    }
  };
}

export async function upsertRoomMember(
  database: Database,
  member: DeepPartial<RoomMemberModel>,
  actionParent?: unknown,
): Promise<RoomMemberModel> {
  const id = member.id || (await UUIDGenerator.getRandomUUID());
  const memberUpdate = { ...member, id };
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
  member: DeepPartial<RoomMemberModel>,
): Promise<RoomMemberModel> {
  const id = member.id || (await UUIDGenerator.getRandomUUID());
  const memberUpdate = { ...member, id };
  return prepareUpsert<RoomMemberModel>(
    database,
    Tables.roomMembers,
    memberUpdate.id,
    roomMemberUpdater(memberUpdate),
  );
}

export async function getAllMembersOfRoom(
  database: Database,
  roomId: string,
): Promise<RoomMemberModel[]> {
  const roomMemberTable = database.collections.get<RoomMemberModel>(Tables.roomMembers);
  return roomMemberTable.query(Q.where('room_id', roomId)).fetch();
}

export default RoomMemberModel;
