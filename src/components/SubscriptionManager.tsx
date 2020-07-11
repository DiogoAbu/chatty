import { FC, useEffect } from 'react';

import { useClient } from 'urql';
import { pipe, subscribe } from 'wonka';

import {
  ShouldSyncDocument,
  ShouldSyncSubscription,
  ShouldSyncSubscriptionVariables,
} from '!/generated/graphql';
import { withAllRooms, WithAllRoomsInput, WithAllRoomsOutput } from '!/screens/Chats/queries';
import debug from '!/services/debug';
import { useStores } from '!/stores';

const log = debug.extend('subscription-manager');

interface Props {
  token: string;
  userId: string;
}

const SubscriptionManager: FC<WithAllRoomsOutput & Props> = ({ token, userId, rooms }) => {
  const { syncStore } = useStores();
  const client = useClient();

  const roomIds = rooms?.map((e) => e.id) || [];

  // //////////
  // // Room //
  // //////////
  // useEffect(() => {
  //   if (!token || !userId) {
  //     return () => null;
  //   }

  //   const { unsubscribe } = pipe(
  //     client.subscription<RoomCreatedSubscription, RoomCreatedSubscriptionVariables>(
  //       RoomCreatedDocument,
  //       {},
  //       { requestPolicy: 'network-only' },
  //     ),
  //     subscribe((res) => {
  //       const handleNewRoom = async () => {
  //         const roomCreated = res.data?.roomCreated;
  //         if (!roomCreated?.id) {
  //           log('Room received', 'id not found');
  //           return;
  //         }
  //         log('Room received', JSON.stringify(roomCreated, null, 2));

  //         const room: DeepPartial<RoomModel> = {
  //           id: roomCreated.id,
  //           name: roomCreated.name,
  //           pictureUri: roomCreated.pictureUri,
  //           _raw: { _status: 'synced' },
  //         };

  //         const members: DeepPartial<UserModel>[] =
  //           roomCreated.members?.map((member) => ({
  //             id: member.id,
  //             name: member.name,
  //             email: member.email,
  //             pictureUri: member.pictureUri,
  //             publicKey: member.publicKey,
  //             role: member.role,
  //             _raw: { _status: 'synced' },
  //           })) || [];

  //         const messages: DeepPartial<MessageModel>[] = [];
  //         const readReceipts: DeepPartial<ReadReceiptModel>[] = [];

  //         if (roomCreated.lastMessage?.sender?.id) {
  //           const message = roomCreated.lastMessage;
  //           messages.push({
  //             id: message.id,
  //             cipher: message.cipher,
  //             type: message.type,
  //             createdAt: message.createdAt,
  //             sender: { id: message.sender?.id },
  //             _raw: { _status: 'updated' },
  //           });

  //           if (message.sender?.id !== userId) {
  //             readReceipts.push({
  //               user: { id: userId },
  //               message: { id: message.id },
  //               room: { id: roomCreated.id },
  //               receivedAt: Date.now(),
  //               _raw: { _status: 'updated' },
  //             });
  //           }
  //         }

  //         await createRoom(database, user, room, members, messages, readReceipts);
  //       };
  //       handleNewRoom()
  //         .catch((err) => {
  //           log('RoomCreatedSubscription error', err);
  //         })
  //         .then(async () => sync(userId, database, client))
  //         .catch((err) => {
  //           log('RoomCreatedSubscription sync error', err);
  //         })
  //         .finally(() => {
  //           log('RoomCreatedSubscription finished');
  //         });
  //     }),
  //   );

  //   return () => {
  //     unsubscribe();
  //   };
  // }, [client, database, token, user, userId]);

  // /////////////
  // // Message //
  // /////////////
  // useEffect(() => {
  //   if (!token || !userId || !rooms?.length) {
  //     return () => null;
  //   }

  //   const roomIds = rooms.map((e) => e.id);

  //   const { unsubscribe } = pipe(
  //     client.subscription<MessageCreatedSubscription, MessageCreatedSubscriptionVariables>(
  //       MessageCreatedDocument,
  //       { roomIds },
  //       { requestPolicy: 'network-only' },
  //     ),
  //     subscribe((res) => {
  //       const handleNewMessage = async () => {
  //         const message = res.data?.messageCreated;
  //         if (!message?.room?.id || !message?.sender?.id) {
  //           log('Message received', 'id not found');
  //           return;
  //         }
  //         log('Message received', JSON.stringify(message, null, 2));

  //         const room: DeepPartial<RoomModel> = {
  //           id: message.room.id,
  //           name: message.room.name,
  //           pictureUri: message.room.pictureUri,
  //           _raw: { _status: 'synced' },
  //         };

  //         const members: DeepPartial<UserModel>[] = [
  //           { id: userId },
  //           {
  //             id: message.sender?.id,
  //             name: message.sender?.name,
  //             email: message.sender?.email,
  //             pictureUri: message.sender?.pictureUri,
  //             publicKey: message.sender?.publicKey,
  //             role: message.sender?.role,
  //             _raw: { _status: 'synced' },
  //           },
  //         ];

  //         const messages: DeepPartial<MessageModel>[] = [
  //           {
  //             id: message.id,
  //             cipher: message.cipher,
  //             type: message.type,
  //             createdAt: message.createdAt,
  //             sender: { id: message.sender?.id },
  //             _raw: { _status: 'updated' },
  //           },
  //         ];

  //         const readReceipts: DeepPartial<ReadReceiptModel>[] = [];
  //         if (message.sender?.id !== userId) {
  //           readReceipts.push({
  //             message: { id: message.id },
  //             user: { id: userId },
  //             room: { id: room.id },
  //             receivedAt: Date.now(),
  //             _raw: { _status: 'updated' },
  //           });
  //         }

  //         await createRoom(database, user, room, members, messages, readReceipts);
  //       };
  //       handleNewMessage()
  //         .catch((err) => {
  //           log('MessageCreatedSubscription error', err);
  //         })
  //         .then(async () => sync(userId, database, client))
  //         .catch((err) => {
  //           log('MessageCreatedSubscription sync error', err);
  //         })
  //         .finally(() => {
  //           log('MessageCreatedSubscription finished');
  //         });
  //     }),
  //   );

  //   return () => {
  //     unsubscribe();
  //   };
  // }, [client, database, rooms, token, user, userId]);

  // //////////////////
  // // Read Receipt //
  // //////////////////
  // useEffect(() => {
  //   if (!token || !userId || !rooms?.length) {
  //     return () => null;
  //   }

  //   const roomIds = rooms.map((e) => e.id);

  //   const { unsubscribe } = pipe(
  //     client.subscription<ReadReceiptCreatedSubscription, ReadReceiptCreatedSubscriptionVariables>(
  //       ReadReceiptCreatedDocument,
  //       { roomIds },
  //       { requestPolicy: 'network-only' },
  //     ),
  //     subscribe((res) => {
  //       const handleNewReadReceipt = async () => {
  //         const readReceipt = res.data?.readReceiptCreated;
  //         if (!readReceipt?.user?.id || !readReceipt?.message?.id || !readReceipt?.room?.id) {
  //           log('ReadReceipt received', 'id not found');
  //           return;
  //         }
  //         log('ReadReceipt received', JSON.stringify(readReceipt, null, 2));

  //         await upsertReadReceipt(database, {
  //           id: readReceipt.id,
  //           message: { id: readReceipt.message.id },
  //           user: { id: readReceipt.user.id },
  //           room: { id: readReceipt.room.id },
  //           receivedAt: readReceipt.receivedAt,
  //           seenAt: readReceipt.seenAt,
  //           _raw: { _status: 'updated' },
  //         });
  //       };
  //       handleNewReadReceipt()
  //         .catch((err) => {
  //           log('ReadReceiptCreatedSubscription error', err);
  //         })
  //         .then(async () => sync(userId, database, client))
  //         .catch((err) => {
  //           log('ReadReceiptCreatedSubscription sync error', err);
  //         })
  //         .finally(() => {
  //           log('ReadReceiptCreatedSubscription finished');
  //         });
  //     }),
  //   );

  //   return () => {
  //     unsubscribe();
  //   };
  // }, [client, database, rooms, token, user, userId]);

  /////////////////
  // Should Sync //
  /////////////////
  useEffect(() => {
    if (!token || !userId) {
      return () => null;
    }

    const { unsubscribe } = pipe(
      client.subscription<ShouldSyncSubscription, ShouldSyncSubscriptionVariables>(
        ShouldSyncDocument,
        { roomIds },
        { requestPolicy: 'network-only' },
      ),
      subscribe(() => {
        log('Should sync');
        void syncStore.sync();
      }),
    );
    return () => {
      unsubscribe();
    };
  }, [client, roomIds, syncStore, token, userId]);

  return null;
};

export default withAllRooms(SubscriptionManager) as FC<WithAllRoomsInput & Props>;
