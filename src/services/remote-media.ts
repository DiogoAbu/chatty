import Config from 'react-native-config';
import FileSystem from 'react-native-fs';

import { MediaUploaded } from '!/types';
import notEmpty from '!/utils/not-empty';

export async function uploadMedia(uri: string): Promise<MediaUploaded> {
  const fileFetch = await fetch(uri);
  const fileBlob = (await fileFetch.blob()) as any;

  const file = {
    uri,
    name: fileBlob._data.name,
    type: fileBlob._data.type,
  };

  if (!file.name || !file.type) {
    throw new Error('Failed to fetch file info');
  }

  const body = new FormData();
  body.append('file', file);
  body.append('upload_preset', Config.CLOUDINARY_PRESET);
  body.append('cloud_name', Config.CLOUDINARY_NAME);

  const fetchRes = await fetch(Config.CLOUDINARY_URL, {
    body,
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  });

  return fetchRes.json();
}

export async function uploadMediaWithProgress(
  localUris: string[],
  {
    begin,
    progress,
  }: {
    begin?: (res: FileSystem.UploadBeginCallbackResult) => void;
    progress?: (res: FileSystem.UploadProgressCallbackResult) => void;
  },
): Promise<MediaUploaded> {
  try {
    const filesAsync = localUris.map(async (uri) => {
      const fileFetch = await fetch(uri);
      const fileBlob = (await fileFetch.blob()) as any;

      const file = {
        name: fileBlob._data.name,
        filepath: uri,
        filename: fileBlob._data.name,
        filetype: fileBlob._data.type,
      };

      if (!file.filename || !file.filetype) {
        console.log('Failed to fetch file info', { uri });
        return null;
      }
      return file;
    });

    const files = (await Promise.all(filesAsync)).filter(notEmpty);

    const res = await FileSystem.uploadFiles({
      toUrl: Config.CLOUDINARY_URL,
      method: 'POST',
      files,
      fields: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        upload_preset: Config.CLOUDINARY_PRESET,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        cloud_name: Config.CLOUDINARY_NAME,
      },
      headers: {
        Accept: 'application/json',
      },
      begin,
      progress,
    }).promise;

    if (res.statusCode !== 200) {
      throw new Error('Failed to upload media');
    }

    return JSON.parse(res.body) as MediaUploaded;
  } catch (err) {
    if (err.description === 'cancelled') {
      // cancelled by user
    }
    throw err;
  }
}
