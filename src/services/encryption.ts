import Sodium from 'react-native-sodium';
import { Database } from '@nozbe/watermelondb';
import Bottleneck from 'bottleneck';
import { Base64 } from 'js-base64';

import MessageModel, { prepareUpsertMessage } from '!/models/MessageModel';
import RoomModel, { prepareUpsertRoom } from '!/models/RoomModel';
import UserModel from '!/models/UserModel';
import { DeepPartial } from '!/types';

const NONCE_CIPHER_SEPARATOR = '@';

const limiter = new Bottleneck({
  maxConcurrent: 1,
});

export async function generateSaltForKeyDerivation(): Promise<string> {
  const salt = await Sodium.randombytes_buf(Sodium.crypto_pwhash_SALTBYTES);
  return salt;
}

/**
 * Derives a key from a password, values must the same to produce the same key.
 */
export async function derivesKeyFromPassword(password: string, salt: string): Promise<string> {
  const keylen = Sodium.crypto_box_SEEDBYTES;
  const opslimit = Sodium.crypto_pwhash_OPSLIMIT_MODERATE;
  const memlimit = Sodium.crypto_pwhash_MEMLIMIT_MODERATE;
  const algo = Sodium.crypto_pwhash_ALG_ARGON2I13;

  const key = await Sodium.crypto_pwhash(keylen, password, salt, opslimit, memlimit, algo);
  return key;
}

/**
 * Asymmetric encryption, secret key can decrypt messages that used the linked public key.
 * Rooms have members, and each member has a pair of keys.
 */
export async function generateKeyPair(): Promise<{ secretKey: string; publicKey: string }> {
  try {
    const { sk: secretKey, pk: publicKey } = await Sodium.crypto_box_keypair();
    return { secretKey, publicKey };
  } catch (err) {
    console.error('generateKeyPair', err);
    throw err;
  }
}

/**
 * Derives key pair, from a seed key.
 */
export async function deriveKeyPair(seed: string): Promise<{ secretKey: string; publicKey: string }> {
  try {
    const { sk: secretKey, pk: publicKey } = await Sodium.crypto_box_seed_keypair(seed);
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
): Promise<string> {
  try {
    const message = Base64.encode(content);
    const nonce = await Sodium.randombytes_buf(Sodium.crypto_box_NONCEBYTES);

    const cipher = await Sodium.crypto_box_easy(message, nonce, recipientPublicKey, senderSecretKey);

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
): Promise<string> {
  try {
    if (cipherWithNonce.length < Sodium.crypto_box_NONCEBYTES + Sodium.crypto_box_MACBYTES) {
      throw 'Short message';
    }

    const [nonce, cipher] = cipherWithNonce.split(NONCE_CIPHER_SEPARATOR);

    const content = await Sodium.crypto_box_open_easy(cipher, nonce, senderPublicKey, recipientSecretKey);

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
): Promise<string | null> {
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

    // Store it locally, it won't be shared as is
    const roomFound = { id: room.id, sharedKey };

    // For each room member
    const wrapped = limiter.wrap(async (member: UserModel) => {
      // Encode the shared key with the member's public key
      const cipher = await encryptContentUsingPair(sharedKey, member.publicKey!, sender.secretKey!);

      // Send to each the shared key
      const message: DeepPartial<MessageModel> = {
        cipher: `${member.id} ${cipher}`,
        type: 'sharedKey',
        sender: { id: sender.id },
        room: { id: roomFound.id },
        createdAt: Date.now(),
      };

      return prepareUpsertMessage(database, message);
    });

    const batch: any[] = await Promise.all(members.map(wrapped));

    await database.action<void>(async () => {
      batch.push(await prepareUpsertRoom(database, roomFound));

      await database.batch(...batch);
    }, 'generateSharedKey');

    return sharedKey;
  } catch (err) {
    console.error('generateSharedKey', err);
    throw err;
  }
}

/**
 * Encrypt content with the room's shared key.
 */
export async function encryptContentUsingShared(content: string, sharedKey: string): Promise<string> {
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
export async function decryptContentUsingShared(cipher: string, sharedKey: string): Promise<string> {
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
