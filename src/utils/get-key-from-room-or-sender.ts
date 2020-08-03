import { Database } from '@nozbe/watermelondb';

import { RoomChanges, UserChanges } from '!/generated/graphql';
import RoomModel from '!/models/RoomModel';
import UserModel from '!/models/UserModel';
import { Tables } from '!/types';

export default async function getKeyFromRoomOrSender(
  database: Database,
  userId: string,
  roomId: string,
  senderId: string,
  rooms?: RoomChanges[],
  users?: UserChanges[],
): Promise<{
  sharedKey: string | undefined;
  senderPublicKey: string | undefined;
}> {
  let sharedKey: string | undefined;
  let senderPublicKey: string | undefined;

  const usersTable = database.collections.get<UserModel>(Tables.users);

  try {
    const room = rooms?.find((e) => e.id === roomId);
    // @ts-expect-error Get sharedKey added above
    if (room?.sharedKey) {
      // @ts-expect-error
      sharedKey = room.sharedKey;
    } else {
      const roomsTable = database.collections.get<RoomModel>(Tables.rooms);
      const roomFound = await roomsTable.find(roomId!);
      if (roomFound?.sharedKey) {
        sharedKey = roomFound.sharedKey;
      }
    }

    // Can only decrypt message sent to me, not by me
    if (!sharedKey && senderId !== userId) {
      const sender = users?.find((e) => e.id === senderId);
      if (sender?.publicKey) {
        senderPublicKey = sender.publicKey;
      } else {
        const senderFound = await usersTable.find(senderId!);
        if (senderFound?.publicKey) {
          senderPublicKey = senderFound.publicKey;
        }
      }
    }
  } catch (err) {
    console.log('Failed to find encryption key');
    console.log(err);
  }

  return {
    sharedKey,
    senderPublicKey,
  };
}
