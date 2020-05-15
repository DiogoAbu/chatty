import { Image } from 'react-native';

export default async function getLocalImageDimensions(uri: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => {
        resolve({ width, height });
      },
      (err) => {
        reject(err);
      },
    );
  });
}
