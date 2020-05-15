import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { CompositeNavigationProp, RouteProp as RoutePropNative } from '@react-navigation/native';
import { StackNavigationOptions, StackNavigationProp } from '@react-navigation/stack';
import { Observable as ObservableRxJs } from 'rxjs/Observable';

import AttachmentModel from './models/AttachmentModel';
import { PicturesTaken, VideoRecorded } from './screens/Camera/types';

export type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

export type Observable<T> = ObservableRxJs<T>;

// Table names
export enum Tables {
  attachments = 'attachments',
  comments = 'comments',
  messages = 'messages',
  posts = 'posts',
  roomMembers = 'room_members',
  rooms = 'rooms',
  users = 'users',
}

export type RootStackParams = {
  Main: undefined;
  RoomInfoModal: {
    roomId: string;
    roomTitle: string;
    roomPicture: string;
    friendId: string;
  };
  PictureScrollerModal: {
    title: string;
    attachments: DeepPartial<AttachmentModel>[];
  };
  PictureViewerModal: {
    title: string;
    attachment: DeepPartial<AttachmentModel>;
    skipStatusBar?: boolean;
  };
  VideoPlayerModal: {
    title: string;
    attachment: DeepPartial<AttachmentModel>;
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
  Settings: undefined;
  FindFriends: undefined;
  CreateGroup: {
    members: any[];
  };
  ChatsArchived: undefined;

  Camera: {
    roomId: string;
    roomTitle: string;
    roomPicture: string;
  };
  PreparePicture: {
    roomId: string;
    roomTitle: string;
    roomPicture: string;
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
    roomPicture: string;

    videoRecorded: VideoRecorded;
  };

  SignIn: undefined;
  ForgotPass: undefined;
  ChangePass: undefined;
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
export type MainRouteProp<
  RouteName extends keyof (MainStackParams & RootStackParams)
> = RoutePropNative<MainStackParams & RootStackParams, RouteName>;

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
  skipInset?: boolean;
}

// For the Header render left/right
export type StackHeaderRightProps = {
  tintColor?: string;
};
