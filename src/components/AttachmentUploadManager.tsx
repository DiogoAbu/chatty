import { FC, useEffect } from 'react';

import Upload, { MultipartUploadOptions, UploadOptions } from 'react-native-background-upload';
import Config from 'react-native-config';
import { Database } from '@nozbe/watermelondb';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';

import AttachmentModel, { attachmentUpdater } from '!/models/AttachmentModel';
import UserModel from '!/models/UserModel';
import { encryptContentUsingPair, encryptContentUsingShared } from '!/services/encryption';
import { Stores } from '!/stores/Stores';
import { MediaUploaded, Tables } from '!/types';
import deepCompare from '!/utils/deep-compare';

import { withUserAttachments, WithUserAttachmentsInput, WithUserAttachmentsOutput } from './queries';

const encryptUri = async (
  database: Database,
  attachmentId: string,
  signedUser: UserModel,
  remoteUri: string,
) => {
  const table = database.collections.get<AttachmentModel>(Tables.attachments);

  const attachment = await table.find(attachmentId);
  const room = await attachment.room.fetch();
  if (!room) {
    throw new Error('Failed to find attachment room');
  }

  if (!attachment.remoteUri) {
    await database.action(async () => {
      await attachment.update(
        attachmentUpdater({
          remoteUri,
        }),
      );
    });
  }

  // Get friend`s public key, and if it`s a group get the shared key.
  let encryptKey: string;
  if (!room.name) {
    const friend = (await room.members.fetch()).find((e) => e.id !== signedUser.id);
    if (!friend) {
      throw new Error('Failed to add message, friend not found');
    }
    if (!friend.publicKey) {
      throw new Error("Failed to add message, friend's public key not found");
    }
    encryptKey = friend.publicKey;
  } else {
    if (!room.sharedKey) {
      throw new Error('Failed to add message, shared key not found');
    }
    encryptKey = room.sharedKey;
  }

  let cipher: string;
  if (room.name) {
    cipher = await encryptContentUsingShared(remoteUri, encryptKey);
  } else {
    cipher = await encryptContentUsingPair(remoteUri, encryptKey, signedUser.secretKey!);
  }

  await database.action(async () => {
    await attachment.update(
      attachmentUpdater({
        cipherUri: cipher,
      }),
    );
  });
};

const AttachmentUploadManager: FC<WithUserAttachmentsOutput> = ({ user, database, attachments }) => {
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    attachments?.map(async (each) => {
      let file;

      try {
        if (each.remoteUri) {
          await encryptUri(database, each.id, user, each.remoteUri);
          return;
        }
      } catch (err) {
        return;
      }

      try {
        if (!each.localUri) {
          return;
        }
        const fileFetch = await fetch(each.localUri);
        const fileBlob = (await fileFetch.blob()) as any;

        file = {
          uri: each.localUri,
          name: fileBlob._data.name as string,
          type: fileBlob._data.type as string,
        };
      } catch (err) {
        console.log('Failed to fetch file info', err);
        return;
      }

      try {
        if (!file?.name || !file?.type) {
          console.log('No file info available');
          return;
        }

        const options: UploadOptions | MultipartUploadOptions = {
          customUploadId: each.id,
          url: Config.CLOUDINARY_URL,
          method: 'POST',
          type: 'multipart',
          field: 'file',
          path: file.uri,
          parameters: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            upload_preset: Config.CLOUDINARY_PRESET,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            cloud_name: Config.CLOUDINARY_NAME,
          },
          notification: {
            enabled: true,
            autoClear: true,
            notificationChannel: 'Uploads',
            enableRingTone: false,
            onProgressTitle: 'Upload in progress',
          },
        };

        const uploadId = await Upload.startUpload(options);
        console.log('Upload started');

        Upload.addListener('progress', uploadId, (data) => {
          console.log('Progress:', JSON.stringify(data, null, 2));
        });

        Upload.addListener('error', uploadId, (data) => {
          console.log('Error:', JSON.stringify(data, null, 2));
        });

        Upload.addListener('cancelled', uploadId, () => {
          console.log('Cancelled!');
        });

        Upload.addListener('completed', uploadId, ({ id, responseBody }) => {
          const res = JSON.parse(responseBody) as MediaUploaded;
          const stores = new Stores();
          stores.onHydrationComplete = async () => {
            try {
              const signedUser = stores.authStore.user;
              if (!signedUser?.id) {
                throw new Error('No user signed in');
              }
              await encryptUri(stores.generalStore.database, id, signedUser, res.secure_url);
            } catch (err) {
              console.log(err);
            }
          };
        });
      } catch (err) {
        console.log(err);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepCompare(attachments, ['cipherUri'])]);

  // useObservableEffect(
  //   database.withChangesForTables(['attachments'] as Array<keyof typeof Tables>),
  //   (changes) => {
  //     if (!userId) {
  //       return;
  //     }
  //     changes?.map((each) => {
  //       console.log(JSON.stringify(each.record._raw, null, 2));
  //     });
  //   },
  // );

  return null;
};

export default withDatabase(withUserAttachments(AttachmentUploadManager) as FC<WithUserAttachmentsInput>);
