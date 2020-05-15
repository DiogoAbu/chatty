import Sodium from 'react-native-sodium';
import { Database } from '@nozbe/watermelondb';
import Bottleneck from 'bottleneck';
import { Base64 } from 'js-base64';

import MessageModel, { MessageTypes, prepareUpsertMessage } from '!/models/MessageModel';
import RoomModel, { prepareUpsertRoom } from '!/models/RoomModel';
import UserModel, { userUpdater } from '!/models/UserModel';
import { DeepPartial } from '!/types';

const NONCE_CIPHER_SEPARATOR = '@';

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

/**
 * Asymmetric encryption, secret key can decrypt messages that used the linked public key.
 * Rooms have members, and each member has a pair of keys.
 */
export async function generateKeyPair(database?: Database, user?: UserModel) {
  try {
    const { sk: secretKey, pk: publicKey } = await Sodium.crypto_box_keypair();

    // Store secret and public key, only public will be shared
    if (database && user) {
      await database.action<void>(() => {
        const changes: DeepPartial<UserModel> = { secretKey, publicKey };
        user.update(userUpdater(changes));
      });
    }

    return { secretKey, publicKey };
  } catch (err) {
    console.error('generateKeyPair', err);
    throw err;
  }
}

/**
 * Encrypt content with the recipient's public and sender's secret key.
 */
export async function encryptContentUsingPair(
  content: string,
  recipientPublicKey: string,
  senderSecretKey: string,
) {
  try {
    const message = Base64.encode(content);
    const nonce = await Sodium.randombytes_buf(Sodium.crypto_box_NONCEBYTES);

    const cipher = await Sodium.crypto_box_easy(
      message,
      nonce,
      recipientPublicKey,
      senderSecretKey,
    );

    return nonce.concat(NONCE_CIPHER_SEPARATOR).concat(cipher);
  } catch (err) {
    console.error('encryptContentUsingPair', err);
    throw err;
  }
}

/**
 * Decrypt content sent to me with MY secret key since it was encrypt with MY public key.
 */
export async function decryptContentUsingPair(
  cipherWithNonce: string,
  senderPublicKey: string,
  recipientSecretKey: string,
) {
  try {
    if (cipherWithNonce.length < Sodium.crypto_box_NONCEBYTES + Sodium.crypto_box_MACBYTES) {
      throw 'Short message';
    }

    const [nonce, cipher] = cipherWithNonce.split(NONCE_CIPHER_SEPARATOR);

    const content = await Sodium.crypto_box_open_easy(
      cipher,
      nonce,
      senderPublicKey,
      recipientSecretKey,
    );

    return Base64.decode(content);
  } catch (err) {
    console.error('decryptContentUsingPair', err);
    throw err;
  }
}

/**
 * Symmetric encryption, same key for encrypting and decrypting.
 */
export async function generateSharedKey(
  database: Database,
  room: RoomModel,
  members: UserModel[],
  senderId: string,
) {
  try {
    if (members.some((e) => !e.publicKey)) {
      console.log('Not all members have a public key.');
      return null;
    }

    const sender = members.find((e) => e.id === senderId);

    if (!sender?.secretKey) {
      console.log('Sender does not have a secret key.');
      return null;
    }

    // Generate shared key
    const sharedKey = await Sodium.crypto_secretbox_keygen();

    // Store it locally, it won't be shared right now
    room.sharedKey = sharedKey;

    // For each room member
    const wrapped = limiter.wrap(async (member: UserModel) => {
      // Encode the shared key with the member's public key
      const cipher = await encryptContentUsingPair(sharedKey, member.publicKey!, sender.secretKey!);

      // Send to each the shared key
      const message: DeepPartial<MessageModel> = {
        content: `${member.id} ${cipher}`,
        type: MessageTypes.sharedKey,
        sender: { id: sender.id },
        room: { id: room.id },
        localCreatedAt: Date.now(),
      };

      await prepareUpsertMessage(database, message);
    });

    await database.action<void>(async () => {
      const batch: any[] = await Promise.all(members.map(wrapped));
      batch.push(await prepareUpsertRoom(database, room));

      database.batch(...batch);
    });

    return sharedKey;
  } catch (err) {
    console.error('generateSharedKey', err);
    throw err;
  }
}

/**
 * Encrypt content with the room's shared key.
 */
export async function encryptContentUsingShared(content: string, sharedKey: string) {
  try {
    const nonce = await Sodium.randombytes_buf(Sodium.crypto_secretbox_NONCEBYTES);
    const cipher = await Sodium.crypto_secretbox_easy(content, nonce, sharedKey);
    return nonce + cipher;
  } catch (err) {
    console.error('encryptContentUsingShared', err);
    throw err;
  }
}

/**
 * Decrypt content with the room's shared key.
 */
export async function decryptContentUsingShared(cipher: string, sharedKey: string) {
  try {
    if (cipher.length < Sodium.crypto_secretbox_NONCEBYTES + Sodium.crypto_secretbox_MACBYTES) {
      throw 'Short message';
    }

    const nonce = cipher.slice(0, Sodium.crypto_secretbox_NONCEBYTES);
    const cipherText = cipher.slice(Sodium.crypto_secretbox_NONCEBYTES);

    const content = await Sodium.crypto_secretbox_open_easy(cipherText, nonce, sharedKey);

    return content;
  } catch (err) {
    console.error('decryptContentUsingShared', err);
    throw err;
  }
}
