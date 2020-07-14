import Config from 'react-native-config';

import { MediaUploaded } from '!/types';

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
  body.append('upload_preset', Config.MEDIA_UPLOAD_PRESET);
  body.append('cloud_name', Config.MEDIA_UPLOAD_NAME);

  const fetchRes = await fetch(Config.MEDIA_UPLOAD_URL, {
    body,
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  });

  return fetchRes.json();
}
