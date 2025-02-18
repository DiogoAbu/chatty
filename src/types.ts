import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { CompositeNavigationProp, RouteProp as RoutePropNative } from '@react-navigation/native';
import { StackNavigationOptions, StackNavigationProp } from '@react-navigation/stack';
import { DurationInputArg1, DurationInputArg2 } from 'moment';

import { User } from './generated/graphql';
import AttachmentModel, { AttachmentType } from './models/AttachmentModel';
import { PicturesTaken, VideoRecorded } from './screens/Camera/types';

export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };
export type DeepRequired<T> = { [P in keyof T]-?: DeepRequired<T[P]> };

export type ColorSchemePreferred = 'light' | 'dark' | 'auto';
export type ColorSchemeCurrent = 'light' | 'dark';

// Table names
export enum Tables {
  attachments = 'attachments',
  comments = 'comments',
  messages = 'messages',
  posts = 'posts',
  roomMembers = 'roomMembers',
  rooms = 'rooms',
  users = 'users',
  readReceipts = 'readReceipts',
}

export type RootStackParams = {
  Main: undefined;
  RoomInfoModal: {
    roomId: string;
    roomTitle: string;
    roomPictureUri: string;
    friendId: string;
  };
  PictureScrollerModal: {
    title: string;
    attachments: AttachmentParam[];
  };
  PictureViewerModal: {
    title: string;
    attachment: AttachmentParam;
    skipStatusBar?: boolean;
  };
  VideoPlayerModal: {
    title: string;
    attachment: AttachmentParam;
  };
  AttachmentPickerModal: {
    callbackScreen: keyof (MainStackParams & RootStackParams);
    types?: Array<AttachmentType | 'camera'>;
  };
};

// Stack screens with params
export type MainStackParams = {
  Home: {
    isSelecting: boolean;
  };
  Chatting: {
    roomId: string;
  };
  Settings?: {
    reload?: boolean;
  };
  FindFriends: undefined;
  CreateGroup: {
    id?: string;
    name?: string;
    pictureUri?: string;
    createdAt?: number;
    members: User[];
    attachmentType?: AttachmentType | 'camera';
    picturesTaken?: PicturesTaken[];
  };
  ChatsArchived: undefined;

  Camera: {
    screenNameAfterPicture?: keyof (MainStackParams & RootStackParams);
    screenNameAfterVideo?: keyof (MainStackParams & RootStackParams);
    disableTakePicture?: boolean;
    disableRecordVideo?: boolean;
    initialCameraType?: 'front' | 'back';
    showCameraMask?: boolean;
    roomId?: string;
    roomTitle?: string;
    roomPictureUri?: string;
  };
  PreparePicture: {
    roomId: string;
    roomTitle: string;
    roomPictureUri: string;
    popCount?: number;
    skipStatusBar?: boolean;

    initialMessage?: string;
    picturesTaken: PicturesTaken[];

    handleSaveMessage?: (message: string) => void;
    handleClearPicturesTaken?: () => any;
    handleTogglePictureSelection?: (index: number) => any;
  };
  PrepareVideo: {
    roomId: string;
    roomTitle: string;
    roomPictureUri: string;
    popCount?: number;

    initialMessage?: string;
    videoRecorded: VideoRecorded;

    handleSaveMessage?: (message: string) => void;
  };

  RoomMedias: {
    roomId: string;
    title: string;
  };

  Welcome: undefined;
  SignIn: undefined;
  ForgotPass: undefined;
  ChangePass: undefined;
  CreateProfile?: {
    isEditing?: boolean;
    attachmentType?: AttachmentType | 'camera';
    picturesTaken?: PicturesTaken[];
  };
};

// Tab screens with params
export type HomeTabParams = {
  Chats: undefined;
  Feed: undefined;
};

// Navigation prop for Root Stack screens
export type RootNavigationProp<RouteName extends keyof RootStackParams> = StackNavigationProp<
  RootStackParams,
  RouteName
>;

// Route prop for Root Stack screens
export type RootRouteProp<RouteName extends keyof RootStackParams> = RoutePropNative<
  RootStackParams,
  RouteName
>;

// Navigation prop for Main Stack screens
export type MainNavigationProp<
  RouteName extends keyof (MainStackParams & RootStackParams)
> = StackNavigationProp<MainStackParams & RootStackParams, RouteName>;

// Route prop for Main Stack screens
export type MainRouteProp<RouteName extends keyof (MainStackParams & RootStackParams)> = RoutePropNative<
  MainStackParams & RootStackParams,
  RouteName
>;

// Navigation prop for Tab screens inside Stack screens
export type HomeTabNavigationProp<RouteName extends keyof HomeTabParams> = CompositeNavigationProp<
  MaterialTopTabNavigationProp<HomeTabParams, RouteName>,
  StackNavigationProp<MainStackParams & RootStackParams>
>;

// For the List.Item render left/right
export type ListItemSideProps = {
  color: string;
  style?: {
    marginRight: number;
    marginVertical?: number;
  };
};

// Header extended options
export interface HeaderOptions extends StackNavigationOptions {
  subtitle?: string;
  handlePressBack?: () => void;
  headerCenter?: (props: StackHeaderRightProps) => React.ReactNode;
  handlePressCenter?: () => void;
  skipInset?: boolean;
}

// For the Header render left/right
export type StackHeaderRightProps = {
  tintColor?: string;
};

export type AttachmentParam = Pick<
  DeepPartial<AttachmentModel>,
  'id' | 'localUri' | 'remoteUri' | 'cipherUri' | 'filename' | 'type' | 'width' | 'height'
>;

export type MuteUntilOption = {
  key: string;
  value: [DurationInputArg1, DurationInputArg2];
};

// Cloudinary response
/* eslint-disable @typescript-eslint/naming-convention */
export interface MediaUploaded {
  access_mode: string;
  asset_id: string;
  bytes: number;
  created_at: string;
  etag: string;
  existing: boolean;
  format: string;
  height: number;
  info: MediaUploadedInfo;
  original_filename: string;
  placeholder: boolean;
  public_id: string;
  resource_type: string;
  secure_url: string;
  signature: string;
  tags: string[];
  type: string;
  url: string;
  version_id: string;
  version: string;
  width: number;
}

export interface MediaUploadedInfo {
  categorization: MediaUploadedCategorization;
}

export interface MediaUploadedCategorization {
  google_tagging: GoogleTagging;
}

export interface GoogleTagging {
  data: GoogleTaggingData[];
  status: string;
}

export interface GoogleTaggingData {
  confidence: number;
  tag: string;
}
/* eslint-enable @typescript-eslint/naming-convention */
