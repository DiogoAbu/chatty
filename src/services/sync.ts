/* eslint-disable @typescript-eslint/naming-convention */
import UUIDGenerator from 'react-native-uuid-generator';
import { Database, DirtyRaw, Q } from '@nozbe/watermelondb';
import { synchronize, SyncPullArgs } from '@nozbe/watermelondb/sync';
import Bottleneck from 'bottleneck';
import { Client } from 'urql';

import {
  PullChangesDocument,
  PullChangesQuery,
  PullChangesQueryVariables,
  PushChangesDocument,
  PushChangesMutation,
  PushChangesMutationVariables,
} from '!/generated/graphql';
import { prepareUpsertMessage } from '!/models/MessageModel';
import ReadReceiptModel from '!/models/ReadReceiptModel';
import { getAllMembersOfRoom } from '!/models/relations/RoomMemberModel';
import UserModel, { prepareUpsertUser } from '!/models/UserModel';
import debug from '!/services/debug';
import { SyncDatabaseChangeSet, SyncPullResult, SyncPushArgs, Tables } from '!/types';
import { removeEmptys } from '!/utils/json-replacer';
import notEmpty from '!/utils/not-empty';
import omitKeys from '!/utils/omit-keys';

import { decryptContentUsingPair, decryptContentUsingShared } from './encryption';

const log = debug.extend('synchronize');

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

// Keys that will not be pulled/pushed
const keysToOmit: { [key in Tables]: { pull: any[]; push: any[] } } = {
  attachments: {
    pull: [],
    push: [],
  },
  comments: {
    pull: [],
    push: [],
  },
  messages: {
    pull: [],
    push: ['content'],
  },
  posts: {
    pull: [],
    push: [],
  },
  room_members: {
    pull: [],
    push: [],
  },
  rooms: {
    pull: [],
    push: ['shared_key', 'is_archived', 'last_read_at', 'last_change_at', 'last_message_id'],
  },
  users: {
    pull: ['public_key'],
    push: ['secret_key'],
  },
  read_receipts: {
    pull: [],
    push: [],
  },
};

/**
 * Request changes from server
 * @param userId Signed user id
 * @param database Database instance
 * @param client Api client
 */
const pullChanges = (userId: string, database: Database, client: Client) => async ({
  lastPulledAt,
}: SyncPullArgs): Promise<SyncPullResult> => {
  const result = await client
    .query<PullChangesQuery, PullChangesQueryVariables>(
      PullChangesDocument,
      {
        lastPulledAt: lastPulledAt!,
      },
      { requestPolicy: 'network-only' },
    )
    .toPromise();

  if (result.error) {
    log('Pull error', JSON.stringify(result.error, null, 2));
    throw new Error(result.error.message);
  }

  if (!result.data?.pullChanges?.timestamp) {
    log('Pull changes did not return a timestamp');
    throw null;
  }

  const changes: SyncDatabaseChangeSet = result.data.pullChanges.changes;
  const timestamp = result.data.pullChanges.timestamp;

  ///////////
  // Users //
  ///////////
  if (changes?.users?.updated?.length) {
    changes.users.updated = changes.users.updated.map((each) => {
      if (each.id === userId) {
        // Do not overwrite public key
        return omitKeys(each, keysToOmit.users!.pull);
      }
      return each;
    });
  }

  //////////////////
  // Room Members //
  //////////////////
  if (changes?.room_members?.updated?.length) {
    const asyncFuncs = changes.room_members.updated.map(async (each) => {
      const roomMembers = await getAllMembersOfRoom(database, each.room_id);
      return roomMembers.map((roomMember) => {
        return roomMember.prepareDestroyPermanently();
      });
    });

    const membersPrepared = await Promise.all(
      asyncFuncs.map(async (p) =>
        p.catch((err) => {
          console.log(err);
          return null;
        }),
      ),
    );

    await database.action(async () => {
      await database.batch(...membersPrepared.reduce((acc, cur) => (acc ?? []).concat(...(cur ?? [])), []));
    }, 'pullChanges -> remove former members');
  }

  //////////////
  // Messages //
  //////////////
  if (changes?.messages?.updated?.length) {
    const wrapped = limiter.wrap(async (msg: DirtyRaw) => {
      const data: { message: DirtyRaw; readReceipt: DirtyRaw | null } = {
        message: msg,
        readReceipt: null,
      };

      // Cannot decrypt message sent by me
      if (msg.cipher && msg.user_id !== userId) {
        try {
          const room = changes?.rooms?.updated.find((e) => e.id === msg.room_id);
          if (room?.name && room.shared_key) {
            data.message.content = await decryptContentUsingShared(msg.cipher, room.shared_key);
          } else {
            const usersTable = database.collections.get<UserModel>(Tables.users);

            let senderPublicKey: string;
            const sender = changes?.users?.updated.find((e) => e.id === msg.user_id);
            if (sender) {
              senderPublicKey = sender.public_key;
            } else {
              const senderFound = await usersTable.find(msg.user_id);
              if (!senderFound.publicKey) {
                throw new Error('Sender user record not found');
              }
              senderPublicKey = senderFound.publicKey;
            }

            const signedUser = await usersTable.find(userId);
            data.message.content = await decryptContentUsingPair(
              msg.cipher,
              senderPublicKey,
              signedUser.secretKey!,
            );
          }
        } catch (err) {
          console.log(`Failed to decrypt pulled message ${msg.id as string}`);
          console.log(err);
        }
      }

      if (msg.user_id === userId) {
        return data;
      }

      const readReceiptsTable = database.collections.get<ReadReceiptModel>(Tables.readReceipts);

      const readReceipts = await readReceiptsTable
        .query(Q.where('user_id', userId), Q.where('message_id', msg.id))
        .fetch();

      if (readReceipts?.length) {
        return data;
      }

      const readReceiptFound = changes.read_receipts.updated.find((e) => {
        return e.user_id === userId && e.message_id === msg.id;
      });
      if (!readReceiptFound) {
        data.readReceipt = {
          id: await UUIDGenerator.getRandomUUID(),
          user_id: userId,
          message_id: msg.id,
          room_id: msg.room_id,
        };
        return data;
      }
      return data;
    });

    const newData = await Promise.all(changes.messages.updated.map(wrapped));
    changes.messages.updated = newData.map((e) => e.message);
    changes.read_receipts.updated.push(...newData.map((e) => e.readReceipt).filter(notEmpty));
  }

  ///////////////////
  // Read Receipts //
  ///////////////////
  if (changes?.read_receipts?.updated?.length) {
    changes.read_receipts.updated = changes.read_receipts.updated.map((e) => {
      if (e.user_id === userId && !e.received_at) {
        return { ...e, received_at: Date.now() };
      }
      return e;
    });
  }

  // Return changes to the database
  log('Pull', JSON.stringify({ changes, timestamp }, removeEmptys, 2));
  return { changes, timestamp };
};

/**
 * Send changes to server
 * @param userId Signed user id
 * @param database Database instance
 * @param client Api client
 */
const pushChanges = (userId: string, database: Database, client: Client) => async ({
  changes,
  lastPulledAt,
}: SyncPushArgs): Promise<void> => {
  const batchAsync: any[] = [];

  ///////////
  // Users //
  ///////////
  if (changes?.users) {
    const updateToSynced = (e: DirtyRaw) => {
      batchAsync.push(
        prepareUpsertUser(database, {
          id: e.id,
          _raw: { _status: 'synced', _changed: '' },
        }),
      );
    };
    changes.users.created = changes.users.created.filter((e) => e.id === userId);
    changes.users.updated = changes.users.updated.filter((e) => {
      return (
        e.id === userId &&
        e._changed &&
        !e._changed.split(',').every((c: string) => keysToOmit.users!.push.includes(c))
      );
    });
    changes.users.created = changes.users.created.map((e) => omitKeys(e, keysToOmit.users!.push));
    changes.users.updated = changes.users.updated.map((e) => omitKeys(e, keysToOmit.users!.push));
    changes.users.created.map(updateToSynced);
    changes.users.updated.map(updateToSynced);
  }

  ///////////
  // Rooms //
  ///////////
  if (changes?.rooms) {
    changes.rooms.created = changes.rooms.created.filter((e) => !e.is_local_only);
    changes.rooms.updated = changes.rooms.updated.filter((e) => !e.is_local_only);
    changes.rooms.updated = changes.rooms.updated.filter((e) => {
      return e._changed && !e._changed.split(',').every((c: string) => keysToOmit.rooms!.push.includes(c));
    });
    changes.rooms.created = changes.rooms.created.map((e) => omitKeys(e, keysToOmit.rooms!.push));
    changes.rooms.updated = changes.rooms.updated.map((e) => omitKeys(e, keysToOmit.rooms!.push));
  }

  //////////////////
  // Room Members //
  //////////////////
  if (changes?.room_members) {
    changes.room_members.created = changes.room_members.created.filter((e) => !e.is_local_only);
    changes.room_members.updated = changes.room_members.updated.filter((e) => !e.is_local_only);
    changes.room_members.created = changes.room_members.created.map((e) =>
      omitKeys(e, keysToOmit.room_members!.push),
    );
    changes.room_members.updated = changes.room_members.updated.map((e) =>
      omitKeys(e, keysToOmit.room_members!.push),
    );
  }

  //////////////
  // Messages //
  //////////////
  if (changes?.messages) {
    const prepareMessage = (e: DirtyRaw) => {
      const msg: DirtyRaw = { ...e };

      if (!msg.sent_at) {
        const sentAt = Date.now();

        batchAsync.push(
          prepareUpsertMessage(database, {
            id: msg.id,
            sentAt,
            _raw: { _status: 'synced' },
          }),
        );

        msg.sent_at = sentAt;
      }

      return omitKeys<DirtyRaw>(msg, keysToOmit.messages!.push);
    };

    changes.messages.created = changes.messages.created.filter((e) => e.user_id === userId && e.cipher);
    changes.messages.updated = changes.messages.updated.filter((e) => e.user_id === userId && e.cipher);
    changes.messages.created = changes.messages.created.map(prepareMessage);
    changes.messages.updated = changes.messages.updated.map(prepareMessage);
  }

  // Clean data before sending
  const data = JSON.parse(JSON.stringify({ changes, lastPulledAt }, removeEmptys));

  if (!data?.changes) {
    log('Push empty');
    return;
  }
  log('Push', JSON.stringify(data, null, 2));

  // Send changes
  const result = await client
    .mutation<PushChangesMutation, PushChangesMutationVariables>(PushChangesDocument, data, {
      requestPolicy: 'network-only',
    })
    .toPromise();

  if (result.error) {
    log('Push error', JSON.stringify(result.error, null, 2));
    throw new Error(result.error.message);
  }

  // Execute database changes after push
  await database.action<string>(async () => {
    // Execute all promises
    const batch = await Promise.all(batchAsync);

    await database.batch(...batch);
  }, 'pushChanges update');
};

/**
 * Handle pull/push from/to server
 * @param userId Signed user id
 * @param database Database instance
 * @param client Api client
 */
export default async function sync(userId: string, database: Database, client: Client): Promise<void> {
  return synchronize({
    database,
    pullChanges: pullChanges(userId, database, client),
    pushChanges: pushChanges(userId, database, client),
    sendCreatedAsUpdated: true,
  });
}