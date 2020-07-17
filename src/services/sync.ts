import UUIDGenerator from 'react-native-uuid-generator';
import { Database, DirtyRaw, Q } from '@nozbe/watermelondb';
import { synchronize, SyncPullArgs, SyncPullResult, SyncPushArgs } from '@nozbe/watermelondb/sync';
import Bottleneck from 'bottleneck';
import { Client } from 'urql';

import {
  MessageChanges,
  PullChangesDocument,
  PullChangesQuery,
  PullChangesQueryVariables,
  PushChangesDocument,
  PushChangesMutation,
  PushChangesMutationVariables,
  SyncChanges,
} from '!/generated/graphql';
import { prepareUpsertMessage } from '!/models/MessageModel';
import ReadReceiptModel from '!/models/ReadReceiptModel';
import { getAllMembersOfRoom } from '!/models/relations/RoomMemberModel';
import RoomModel, { prepareUpsertRoom } from '!/models/RoomModel';
import UserModel, { prepareUpsertUser } from '!/models/UserModel';
import debug from '!/services/debug';
import { DeepRequired, Tables } from '!/types';
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
  roomMembers: {
    pull: [],
    push: ['isLocalOnly'],
  },
  rooms: {
    pull: [],
    push: ['sharedKey', 'isLocalOnly', 'isArchived', 'lastReadAt', 'lastChangeAt', 'lastMessageId'],
  },
  users: {
    pull: ['publicKey'],
    push: ['secretKey'],
  },
  readReceipts: {
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

  const { changes, timestamp } = result.data.pullChanges;

  ///////////
  // Users //
  ///////////
  if (changes?.users?.updated?.length) {
    changes.users.updated = changes.users.updated.map((each) => {
      if (each.id === userId) {
        // Do not overwrite public key
        return omitKeys(each, keysToOmit.users.pull);
      }
      return each;
    });
  }

  //////////////////
  // Room Members //
  //////////////////
  if (changes?.roomMembers?.updated?.length) {
    const asyncFuncs = changes.roomMembers.updated.map(async (each) => {
      const roomMembers = await getAllMembersOfRoom(database, each.roomId!);
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
    changes.messages.updated.sort((a, b) => b.sentAt! - a.sentAt!);

    const decryptSharedKey = limiter.wrap(async (msg: MessageChanges) => {
      try {
        if (msg.type !== 'sharedKey') {
          return;
        }
        if (!msg.cipher || !msg.cipher.startsWith(userId)) {
          return;
        }
        const cipher = msg.cipher.replace(userId, '');

        const usersTable = database.collections.get<UserModel>(Tables.users);

        let senderPublicKey: string;
        const sender = changes.users!.updated!.find((e) => e.id === msg.userId);
        if (sender?.publicKey) {
          senderPublicKey = sender.publicKey;
        } else {
          const senderFound = await usersTable.find(msg.userId!);
          if (!senderFound?.publicKey) {
            throw new Error('Sender user record not found');
          }
          senderPublicKey = senderFound.publicKey;
        }

        const signedUser = await usersTable.find(userId);
        const sharedKey = await decryptContentUsingPair(cipher, senderPublicKey, signedUser.secretKey!);

        changes.rooms!.updated = changes.rooms?.updated?.map((room) => {
          if (room.id === msg.roomId) {
            return { ...room, sharedKey };
          }
          return room;
        });
      } catch (err) {
        console.log(`Failed to get shared key from message ${msg.id as string}`);
        console.log(err);
        return;
      }
    });

    await Promise.all(changes.messages.updated.map(decryptSharedKey));

    const decryptAndAddReadReceipt = limiter.wrap(async (msg: MessageChanges) => {
      const data: { message: DirtyRaw; readReceipt: DirtyRaw | null } = {
        message: msg,
        readReceipt: null,
      };

      if (msg.cipher && msg.type === 'default') {
        try {
          let sharedKey: string;
          const room = changes.rooms!.updated!.find((e) => e.id === msg.roomId);
          // @ts-expect-error Get sharedKey added above
          if (room?.sharedKey) {
            // @ts-expect-error
            sharedKey = room.sharedKey;
          } else {
            const roomsTable = database.collections.get<RoomModel>(Tables.rooms);
            const roomFound = await roomsTable.find(msg.roomId!);
            if (!roomFound?.sharedKey) {
              throw new Error('Room record not found');
            }
            sharedKey = roomFound.sharedKey;
          }

          if (sharedKey) {
            data.message.content = await decryptContentUsingShared(msg.cipher, sharedKey);
          } else if (msg.userId !== userId) {
            // Cannot decrypt message sent by me to someone else
            const usersTable = database.collections.get<UserModel>(Tables.users);

            let senderPublicKey: string;
            const sender = changes.users!.updated!.find((e) => e.id === msg.userId);
            if (sender?.publicKey) {
              senderPublicKey = sender.publicKey;
            } else {
              const senderFound = await usersTable.find(msg.userId!);
              if (!senderFound?.publicKey) {
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
          console.log(`Failed to handle pulled message ${msg.id as string}`);
          console.log(err);
        }
      }

      if (msg.userId === userId) {
        return data;
      }

      const readReceiptsTable = database.collections.get<ReadReceiptModel>(Tables.readReceipts);

      const readReceipts = await readReceiptsTable
        .query(Q.where('userId', userId), Q.where('messageId', msg.id!))
        .fetch();

      if (readReceipts?.length) {
        return data;
      }

      const readReceiptFound = changes.readReceipts?.updated?.find((e) => {
        return e.userId === userId && e.messageId === msg.id;
      });
      if (!readReceiptFound) {
        data.readReceipt = {
          id: await UUIDGenerator.getRandomUUID(),
          userId,
          messageId: msg.id,
          roomId: msg.roomId,
        };
        return data;
      }
      return data;
    });

    const newData = await Promise.all(changes.messages.updated.map(decryptAndAddReadReceipt));
    changes.messages.updated = newData.map((e) => e.message);
    changes.readReceipts?.updated?.push(...newData.map((e) => e.readReceipt).filter(notEmpty));
  }

  ///////////////////
  // Read Receipts //
  ///////////////////
  if (changes?.readReceipts?.updated?.length) {
    changes.readReceipts.updated = changes.readReceipts.updated.map((e) => {
      if (e.userId === userId && !e.receivedAt) {
        return { ...e, receivedAt: Date.now() };
      }
      return e;
    });
  }

  // Return changes to the database
  log('Pull', JSON.stringify({ changes, timestamp }, removeEmptys, 2));
  return {
    changes: changes! as Omit<DeepRequired<SyncChanges>, '__typename'>,
    timestamp,
  };
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
    const updateToSynced = (e: DirtyRaw) => {
      batchAsync.push(
        prepareUpsertRoom(database, {
          id: e.id,
          _raw: { _status: 'synced', _changed: '' },
        }),
      );
    };
    changes.rooms.created = changes.rooms.created.filter((e) => !e.isLocalOnly);
    changes.rooms.updated = changes.rooms.updated.filter((e) => !e.isLocalOnly);
    changes.rooms.created = changes.rooms.created.map((e) => omitKeys(e, keysToOmit.rooms!.push));
    changes.rooms.updated = changes.rooms.updated.map((e) => omitKeys(e, keysToOmit.rooms!.push));
    changes.rooms.created.map(updateToSynced);
    changes.rooms.updated.map(updateToSynced);
  }

  //////////////////
  // Room Members //
  //////////////////
  if (changes?.roomMembers) {
    changes.roomMembers.created = changes.roomMembers.created.filter((e) => !e.isLocalOnly);
    changes.roomMembers.updated = changes.roomMembers.updated.filter((e) => !e.isLocalOnly);
    changes.roomMembers.created = changes.roomMembers.created.map((e) =>
      omitKeys(e, keysToOmit.roomMembers!.push),
    );
    changes.roomMembers.updated = changes.roomMembers.updated.map((e) =>
      omitKeys(e, keysToOmit.roomMembers!.push),
    );
  }

  //////////////
  // Messages //
  //////////////
  if (changes?.messages) {
    const prepareMessage = (e: DirtyRaw) => {
      const msg: DirtyRaw = { ...e };

      if (!msg.sentAt) {
        const sentAt = Date.now();

        batchAsync.push(
          prepareUpsertMessage(database, {
            id: msg.id,
            sentAt,
            _raw: { _status: 'synced' },
          }),
        );

        msg.sentAt = sentAt;
      }

      return omitKeys<DirtyRaw>(msg, keysToOmit.messages!.push);
    };

    changes.messages.created = changes.messages.created.filter((e) => e.userId === userId && e.cipher);
    changes.messages.updated = changes.messages.updated.filter((e) => e.userId === userId && e.cipher);
    changes.messages.created = changes.messages.created.map(prepareMessage);
    changes.messages.updated = changes.messages.updated.map(prepareMessage);
  }

  const data: PushChangesMutationVariables = { changes, lastPulledAt };

  // Clean data before sending
  const variables: PushChangesMutationVariables = JSON.parse(JSON.stringify(data, removeEmptys));

  if (!variables?.changes) {
    log('Push empty');
    return;
  }
  log('Push', JSON.stringify(variables, null, 2));

  // Send changes
  const res = await client
    .mutation<PushChangesMutation, PushChangesMutationVariables>(PushChangesDocument, variables, {
      requestPolicy: 'network-only',
    })
    .toPromise();

  if (res.error) {
    log('Push error', JSON.stringify(res.error, null, 2));
    throw new Error(res.error.message);
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
