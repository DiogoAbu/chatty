import FileSystem from 'react-native-fs';

export const DEFAULT_APPBAR_HEIGHT = 56;

export const USER_NAME_MIN_LENGTH = 3;
export const USER_NAME_MAX_LENGTH = 30;
export const ROOM_NAME_MIN_LENGTH = 30;
export const ROOM_NAME_MAX_LENGTH = 30;
export const ONE_TIME_CODE_MAX_LENGTH = 6;

export const ROOM_AMOUNT_ANIMATE = 10;

///////////
// Media //
///////////
export const ATTACHMENT_MAX_AMOUNT = 10;

export const VIDEO_MAX_DURATION = 60;
export const VIDEO_CONTROL_VISIBLE_TIMEOUT = 5000;

export const PICTURE_CIRCUMFERENCE = 2.2;

export const albuns = {
  images: 'Chatty Images',
  videos: 'Chatty Videos',
};

export const mediaPath = `${FileSystem.ExternalStorageDirectoryPath}/Chatty/Media`;
export const imagesPath = `${mediaPath}/${albuns.images}`;
export const videosPath = `${mediaPath}/${albuns.videos}`;
export const documentsPath = `${mediaPath}/Chatty Documents`;
