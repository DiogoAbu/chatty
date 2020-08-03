import { FC, useEffect, useRef } from 'react';

import Download from 'react-native-background-downloader';
import Upload, { MultipartUploadOptions, UploadOptions } from 'react-native-background-upload';
import Config from 'react-native-config';
import FileSystem from 'react-native-fs';
import { Database } from '@nozbe/watermelondb';
import { withDatabase } from '@nozbe/watermelondb/DatabaseProvider';
import CameraRoll from '@react-native-community/cameraroll';
import { useNetInfo } from '@react-native-community/netinfo';

import { albuns, documentsPath, imagesPath, videosPath } from '!/config';
import AttachmentModel, { attachmentUpdater } from '!/models/AttachmentModel';
import UserModel from '!/models/UserModel';
import { encryptContentUsingPair, encryptContentUsingShared } from '!/services/encryption';
import { useStores } from '!/stores';
import { Stores } from '!/stores/Stores';
import { MediaUploaded, Tables } from '!/types';
import deepCompare from '!/utils/deep-compare';

import { withUserAttachments, WithUserAttachmentsInput, WithUserAttachmentsOutput } from './queries';

const UPLOAD_MAX_BYTES = 5000000;

const AttachmentUploadManager: FC<WithUserAttachmentsOutput> = ({ user, database, attachments }) => {
  const { generalStore, syncStore } = useStores();
  const { isConnected, details } = useNetInfo();
  const inProgressIds = useRef<string[]>([]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    Download.checkForExistingDownloads()
      .then((lostTasks) => {
        for (const task of lostTasks) {
          if (details?.isConnectionExpensive) {
            task.stop();
          } else {
            task.done(() => {
              void updateDownloadedAttachment(generalStore.database, task.id);
            });
            task.resume();
          }
        }
      })
      .catch((err) => console.log(err));

    attachments?.map(async (each) => {
      if (inProgressIds.current.includes(each.id)) {
        return;
      }
      inProgressIds.current.push(each.id);

      if (!each.localUri && each.remoteUri) {
        if (details?.isConnectionExpensive) {
          console.log('Skip download on expensive connection');
          return;
        }
        console.log('Starting download');

        // Prepare destination
        let destPath = imagesPath;
        if (each.type === 'video') {
          destPath = videosPath;
        } else if (each.type === 'document') {
          destPath = documentsPath;
        }
        await FileSystem.mkdir(destPath, { NSURLIsExcludedFromBackupKey: true });

        // Copy image
        const filename: string = each.filename;
        const finalPath = `${destPath}/${filename}`;
        console.log('Downloading to ' + finalPath);

        Download.download({
          id: each.id,
          url: each.remoteUri,
          destination: finalPath,
        })
          .done(() => {
            void updateDownloadedAttachment(generalStore.database, each.id);
          })
          .error((error) => {
            console.log('Download canceled due to error: ', error);
          });
        return;
      }

      // If file is already uploaded, just try to encrypt the remote uri
      try {
        if (each.remoteUri && !each.cipherUri) {
          await encryptAttachmentUri(database, each.id, user, each.remoteUri);
          void syncStore.sync();
          return;
        }
      } catch (err) {
        console.log('Failed to encrypt remote uri', err);
        return;
      }

      // Get file info
      try {
        if (!each.localUri) {
          return;
        }
        const fileFetch = await fetch(each.localUri);
        const fileBlob = (await fileFetch.blob()) as any;

        const filesize = (fileBlob._data.size as number) || 0;
        if (details?.isConnectionExpensive && filesize > UPLOAD_MAX_BYTES) {
          console.log(`Skip upload on expensive connection when greater than ${UPLOAD_MAX_BYTES} bytes`);
          return;
        }
      } catch (err) {
        console.log('Failed to fetch file info', err);
        return;
      }

      let url = Config.CLOUDINARY_URL;
      if (each.type === 'image') {
        url = Config.CLOUDINARY_URL_IMAGE;
      } else if (each.type === 'video') {
        url = Config.CLOUDINARY_URL_VIDEO;
      } else if (each.type === 'document') {
        url = Config.CLOUDINARY_URL_RAW;
      }

      // Upload file
      try {
        const uploadId = each.id;

        const options: UploadOptions | MultipartUploadOptions = {
          customUploadId: uploadId,
          url,
          method: 'POST',
          type: 'multipart',
          field: 'file',
          path: each.localUri,
          parameters: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            upload_preset: Config.CLOUDINARY_PRESET,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            cloud_name: Config.CLOUDINARY_NAME,
          },
          notification: {
            enabled: true,
            autoClear: true,
            enableRingTone: false,
            notificationChannel: 'Uploads',
            onProgressTitle: 'Upload in progress',
          },
        };

        await Upload.startUpload(options);
        console.log('Upload started');

        Upload.addListener('progress', uploadId, (data) => {
          console.log('Upload progress', JSON.stringify(data, null, 2));
        });

        Upload.addListener('error', uploadId, (data) => {
          console.log('Upload error', JSON.stringify(data, null, 2));
        });

        Upload.addListener('cancelled', uploadId, () => {
          console.log('Upload cancelled');
        });

        Upload.addListener('completed', uploadId, ({ id, responseBody }) => {
          console.log('Upload completed, encrypting...');
          const stores = new Stores();
          stores.onHydrationComplete = async () => {
            try {
              const res = JSON.parse(responseBody) as MediaUploaded;
              const signedUser = stores.authStore.user;
              if (!signedUser?.id) {
                throw new Error('No user signed in');
              }
              await encryptAttachmentUri(stores.generalStore.database, id, signedUser, res.secure_url);
              void stores.syncStore.sync();
              console.log('Upload uri encrypted');
            } catch (err) {
              console.log('Upload uri encryption error', err);
            }
          };
        });
      } catch (err) {
        console.log('Upload preparation failed', err);
      }
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, details?.isConnectionExpensive, deepCompare(attachments, ['cipherUri'])]);

  return null;
};

const encryptAttachmentUri = async (
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
        remoteUri,
        cipherUri: cipher,
      }),
    );
  });
};

const updateDownloadedAttachment = async (database: Database, attachmentId: string) => {
  try {
    console.log('Download finished, updating record');

    const table = database.collections.get<AttachmentModel>(Tables.attachments);
    const attachment = await table.find(attachmentId);

    if (attachment.localUri) {
      return;
    }

    let destPath = documentsPath;
    if (attachment.type === 'image') {
      destPath = imagesPath;
    } else if (attachment.type === 'video') {
      destPath = videosPath;
    }

    const finalPath = `${destPath}/${attachment.filename}`;

    let localUri = finalPath;
    if (attachment.type === 'image') {
      localUri = await CameraRoll.save(finalPath, { type: 'photo', album: albuns.images });
    } else if (attachment.type === 'video') {
      localUri = await CameraRoll.save(finalPath, { type: 'video', album: albuns.videos });
    }

    await database.action(async () => {
      await attachment.update(
        attachmentUpdater({
          localUri,
        }),
      );
    });
  } catch (err) {
    console.log('saveDownloadedAttachment err', err);
  }
};

export default withDatabase(withUserAttachments(AttachmentUploadManager) as FC<WithUserAttachmentsInput>);
