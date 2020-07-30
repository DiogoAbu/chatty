/* eslint-disable react-native/split-platform-components */
import { PermissionsAndroid, Platform } from 'react-native';

const isIOS = Platform.OS === 'ios';

export async function checkStoragePermission(): Promise<boolean> {
  if (Platform.Version < 23 || isIOS) {
    return true;
  }

  try {
    if (!(await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE))) {
      return false;
    }
    if (!(await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE))) {
      return false;
    }
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function requestStoragePermission(): Promise<boolean> {
  if (Platform.Version < 23 || isIOS) {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    ]);
    return (
      granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED &&
      granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function requestCameraPermission(): Promise<boolean> {
  if (Platform.Version < 23 || isIOS) {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function requestAudioPermission(): Promise<boolean> {
  if (Platform.Version < 23 || isIOS) {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.error(err);
    return false;
  }
}
