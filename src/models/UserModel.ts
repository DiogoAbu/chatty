import UUIDGenerator from 'react-native-uuid-generator';
import { Database, Model, Q, tableSchema } from '@nozbe/watermelondb';
import { field, lazy } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Bottleneck from 'bottleneck';

import { DeepPartial, Tables } from '!/types';
import { prepareUpsert, upsert } from '!/utils/upsert';

import RoomModel from './RoomModel';

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

class UserModel extends Model {
  static table = Tables.users;

  static associations: Associations = {
    [Tables.roomMembers]: { type: 'has_many', foreignKey: 'userId' },
  };

  @field('name')
  name: string;

  @field('email')
  email: string;

  @field('pictureUri')
  pictureUri: string | null;

  @field('role')
  role: string | null;

  @field('secretKey')
  secretKey: string | null;

  @field('publicKey')
  publicKey: string | null;

  @field('derivedSalt')
  derivedSalt: string | null;

  @field('isFollowingMe')
  isFollowingMe: boolean | null;

  @field('isFollowedByMe')
  isFollowedByMe: boolean | null;

  @lazy
  rooms = this.collections
    .get<RoomModel>(Tables.rooms)
    .query(Q.on(Tables.roomMembers, 'userId', this.id), Q.where('isLocalOnly', false));

  @lazy
  roomsArchived = this.collections
    .get<RoomModel>(Tables.rooms)
    .query(Q.on(Tables.roomMembers, 'userId', this.id), Q.where('isArchived', true));
}

export const userSchema = tableSchema({
  name: Tables.users,
  columns: [
    { name: 'name', type: 'string' },
    { name: 'email', type: 'string' },
    { name: 'pictureUri', type: 'string', isOptional: true },
    { name: 'role', type: 'string', isOptional: true },
    { name: 'secretKey', type: 'string', isOptional: true },
    { name: 'publicKey', type: 'string', isOptional: true },
    { name: 'derivedSalt', type: 'string', isOptional: true },
    { name: 'isFollowingMe', type: 'boolean', isOptional: true },
    { name: 'isFollowedByMe', type: 'boolean', isOptional: true },
  ],
});

export function userUpdater(changes: DeepPartial<UserModel>): (record: UserModel) => void {
  return (record: UserModel) => {
    if (typeof changes.id !== 'undefined') {
      record._raw.id = changes.id;
    }
    if (typeof changes.name !== 'undefined') {
      record.name = changes.name;
    }
    if (typeof changes.email !== 'undefined') {
      record.email = changes.email;
    }
    if (typeof changes.pictureUri !== 'undefined') {
      record.pictureUri = changes.pictureUri;
    }
    if (typeof changes.role !== 'undefined') {
      record.role = changes.role;
    }
    if (typeof changes.secretKey !== 'undefined') {
      record.secretKey = changes.secretKey;
    }
    if (typeof changes.publicKey !== 'undefined') {
      record.publicKey = changes.publicKey;
    }
    if (typeof changes.derivedSalt !== 'undefined') {
      record.derivedSalt = changes.derivedSalt;
    }
    if (typeof changes.isFollowingMe !== 'undefined') {
      record.isFollowingMe = changes.isFollowingMe;
    }
    if (typeof changes.isFollowedByMe !== 'undefined') {
      record.isFollowedByMe = changes.isFollowedByMe;
    }
    if (typeof changes._raw?._status !== 'undefined') {
      record._raw._status = changes._raw._status;
    }
    if (typeof changes._raw?._changed !== 'undefined') {
      record._raw._changed = changes._raw._changed;
    }
  };
}

export async function upsertUser(
  database: Database,
  user: DeepPartial<UserModel>,
  actionParent?: unknown,
): Promise<UserModel> {
  return upsert<UserModel>(database, Tables.users, user.id, actionParent, userUpdater(user));
}

export async function prepareUpsertUser(
  database: Database,
  user: DeepPartial<UserModel>,
): Promise<UserModel> {
  return prepareUpsert<UserModel>(database, Tables.users, user.id, userUpdater(user));
}

export async function prepareUsers(users?: DeepPartial<UserModel>[]): Promise<DeepPartial<UserModel>[]> {
  if (!users?.length) {
    return [];
  }

  const wrapped = limiter.wrap(async (user: DeepPartial<UserModel>) => {
    const id = user.id || (await UUIDGenerator.getRandomUUID());
    return { ...user, id } as DeepPartial<UserModel>;
  });

  return Promise.all(users.map(wrapped));
}

export default UserModel;
