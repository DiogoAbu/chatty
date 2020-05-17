import gql from 'graphql-tag';
import * as Urql from 'urql';

export type Maybe<T> = T;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;

  /** The javascript `Date` as integer. Type represents date and time as number of milliseconds from start of UNIX epoch. */
  Timestamp: any;

  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
};

export type Query = {
  __typename?: 'Query';
  getMessages?: Maybe<GetMessagesResponse>;
  getRooms?: Maybe<Array<Maybe<Room>>>;
  pullChanges?: Maybe<Scalars['JSON']>;
  me?: Maybe<User>;
  listUsers?: Maybe<Array<Maybe<User>>>;
};

export type QueryGetMessagesArgs = {
  roomId?: Maybe<Scalars['ID']>;
  limit?: Maybe<Scalars['Int']>;
  afterDate?: Maybe<Scalars['Timestamp']>;
};

export type QueryPullChangesArgs = {
  lastPulledAt?: Maybe<Scalars['Float']>;
};

export type QueryListUsersArgs = {
  where?: Maybe<ListUsersWhere>;
  order?: Maybe<ListUsersOrder>;
  skip?: Maybe<Scalars['Int']>;
  take?: Maybe<Scalars['Int']>;
};

export type GetMessagesResponse = {
  __typename?: 'GetMessagesResponse';
  items?: Maybe<Array<Maybe<Message>>>;
  hasMore?: Maybe<Scalars['Boolean']>;
  cursor?: Maybe<Scalars['Timestamp']>;
};

export type Message = {
  __typename?: 'Message';
  id?: Maybe<Scalars['ID']>;
  content?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
  room?: Maybe<Room>;
  updatedAt?: Maybe<Scalars['Timestamp']>;
  createdAt?: Maybe<Scalars['Timestamp']>;
};

export type User = {
  __typename?: 'User';
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  lastAccessAt?: Maybe<Scalars['Timestamp']>;
  rooms?: Maybe<Array<Maybe<Room>>>;
  publicKey?: Maybe<Scalars['String']>;
  devices?: Maybe<Array<Maybe<Device>>>;
  updatedAt?: Maybe<Scalars['Timestamp']>;
  createdAt?: Maybe<Scalars['Timestamp']>;
  isFollowingMe?: Maybe<Scalars['Boolean']>;
  isFollowedByMe?: Maybe<Scalars['Boolean']>;
};

export type Room = {
  __typename?: 'Room';
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  members?: Maybe<Array<Maybe<User>>>;
  messages?: Maybe<Array<Maybe<Message>>>;
  updatedAt?: Maybe<Scalars['Timestamp']>;
  createdAt?: Maybe<Scalars['Timestamp']>;
  lastMessage?: Maybe<Message>;
};

export type Device = {
  __typename?: 'Device';
  id?: Maybe<Scalars['ID']>;
  token?: Maybe<Scalars['String']>;
  platform?: Maybe<DevicePlatform>;
  user?: Maybe<User>;
  createdAt?: Maybe<Scalars['Timestamp']>;
};

/** The acceptable platforms */
export enum DevicePlatform {
  Ios = 'ios',
  Android = 'android',
  Windows = 'windows',
  Macos = 'macos',
  Web = 'web',
}

export type ListUsersWhere = {
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
};

export type ListUsersOrder = {
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  registerDevice?: Maybe<Scalars['Boolean']>;
  createMessage?: Maybe<Message>;
  createRoom?: Maybe<Room>;
  pushChanges?: Maybe<Scalars['Boolean']>;
  createAccount?: Maybe<SignInResponse>;
  signIn?: Maybe<SignInResponse>;

  /** Find the user, store an one-time-password, and send it to the user`s email. */
  forgotPassword?: Maybe<Scalars['Boolean']>;

  /** Find the user related to the one-time-password, check its validity, and update the password. */
  changePassword?: Maybe<Scalars['Boolean']>;

  /** Add signed user as follower */
  startFollowing?: Maybe<Scalars['Boolean']>;

  /** Remove signed user as follower */
  stopFollowing?: Maybe<Scalars['Boolean']>;
};

export type MutationRegisterDeviceArgs = {
  data?: Maybe<RegisterDeviceInput>;
};

export type MutationCreateMessageArgs = {
  data?: Maybe<CreateMessageInput>;
};

export type MutationCreateRoomArgs = {
  data?: Maybe<CreateRoomInput>;
};

export type MutationPushChangesArgs = {
  lastPulledAt?: Maybe<Scalars['Float']>;
  changes?: Maybe<Scalars['JSON']>;
};

export type MutationCreateAccountArgs = {
  data?: Maybe<CreateAccountInput>;
};

export type MutationSignInArgs = {
  data?: Maybe<SignInInput>;
};

export type MutationForgotPasswordArgs = {
  data?: Maybe<ForgotPasswordInput>;
};

export type MutationChangePasswordArgs = {
  data?: Maybe<ChangePasswordInput>;
};

export type MutationStartFollowingArgs = {
  userId: Scalars['String'];
};

export type MutationStopFollowingArgs = {
  userId: Scalars['String'];
};

export type RegisterDeviceInput = {
  token?: Maybe<Scalars['String']>;
  platform?: Maybe<DevicePlatform>;
};

export type CreateMessageInput = {
  roomId?: Maybe<Scalars['ID']>;
  messageId?: Maybe<Scalars['String']>;
  content?: Maybe<Scalars['String']>;
};

export type CreateRoomInput = {
  name?: Maybe<Scalars['String']>;
  recipientsId?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type SignInResponse = {
  __typename?: 'SignInResponse';
  user?: Maybe<User>;
  token?: Maybe<Scalars['String']>;
};

export type CreateAccountInput = {
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
};

export type SignInInput = {
  email?: Maybe<Scalars['String']>;
  password?: Maybe<Scalars['String']>;
};

export type ForgotPasswordInput = {
  email?: Maybe<Scalars['String']>;
};

export type ChangePasswordInput = {
  code?: Maybe<Scalars['Float']>;
  password?: Maybe<Scalars['String']>;
};

export type Subscription = {
  __typename?: 'Subscription';
  messageCreated?: Maybe<Message>;
  roomCreated?: Maybe<Room>;
};

export type SubscriptionMessageCreatedArgs = {
  roomIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type CreateAccountMutationVariables = {
  data: CreateAccountInput;
};

export type CreateAccountMutation = {
  __typename?: 'Mutation';
  createAccount?: Maybe<{
    __typename?: 'SignInResponse';
    token?: Maybe<string>;
    user?: Maybe<{
      __typename?: 'User';
      id?: Maybe<string>;
      name?: Maybe<string>;
      email?: Maybe<string>;
      role?: Maybe<string>;
      lastAccessAt?: Maybe<any>;
      createdAt?: Maybe<any>;
    }>;
  }>;
};

export type SignInMutationVariables = {
  data: SignInInput;
};

export type SignInMutation = {
  __typename?: 'Mutation';
  signIn?: Maybe<{
    __typename?: 'SignInResponse';
    token?: Maybe<string>;
    user?: Maybe<{
      __typename?: 'User';
      id?: Maybe<string>;
      name?: Maybe<string>;
      email?: Maybe<string>;
      role?: Maybe<string>;
      lastAccessAt?: Maybe<any>;
      createdAt?: Maybe<any>;
    }>;
  }>;
};

export type ForgotPasswordMutationVariables = {
  data: ForgotPasswordInput;
};

export type ForgotPasswordMutation = { __typename?: 'Mutation'; forgotPassword?: Maybe<boolean> };

export type ChangePasswordMutationVariables = {
  data: ChangePasswordInput;
};

export type ChangePasswordMutation = { __typename?: 'Mutation'; changePassword?: Maybe<boolean> };

export type MeQueryVariables = {};

export type MeQuery = {
  __typename?: 'Query';
  me?: Maybe<{
    __typename?: 'User';
    id?: Maybe<string>;
    name?: Maybe<string>;
    email?: Maybe<string>;
    role?: Maybe<string>;
    lastAccessAt?: Maybe<any>;
    createdAt?: Maybe<any>;
  }>;
};

export type ListUsersQueryVariables = {
  where?: Maybe<ListUsersWhere>;
  order?: Maybe<ListUsersOrder>;
  skip?: Maybe<Scalars['Int']>;
  take?: Maybe<Scalars['Int']>;
};

export type ListUsersQuery = {
  __typename?: 'Query';
  listUsers?: Maybe<
    Array<
      Maybe<{
        __typename?: 'User';
        id?: Maybe<string>;
        name?: Maybe<string>;
        email?: Maybe<string>;
      }>
    >
  >;
};

export type CreateRoomMutationVariables = {
  data: CreateRoomInput;
};

export type CreateRoomMutation = {
  __typename?: 'Mutation';
  createRoom?: Maybe<{
    __typename?: 'Room';
    id?: Maybe<string>;
    name?: Maybe<string>;
    members?: Maybe<
      Array<Maybe<{ __typename?: 'User'; id?: Maybe<string>; name?: Maybe<string> }>>
    >;
  }>;
};

export type GetRoomsQueryVariables = {};

export type GetRoomsQuery = {
  __typename?: 'Query';
  getRooms?: Maybe<
    Array<
      Maybe<{
        __typename?: 'Room';
        id?: Maybe<string>;
        name?: Maybe<string>;
        lastMessage?: Maybe<{
          __typename?: 'Message';
          id?: Maybe<string>;
          content?: Maybe<string>;
          createdAt?: Maybe<any>;
          user?: Maybe<{ __typename?: 'User'; id?: Maybe<string>; name?: Maybe<string> }>;
        }>;
        members?: Maybe<
          Array<Maybe<{ __typename?: 'User'; id?: Maybe<string>; name?: Maybe<string> }>>
        >;
      }>
    >
  >;
};

export type RoomCreatedSubscriptionVariables = {};

export type RoomCreatedSubscription = {
  __typename?: 'Subscription';
  roomCreated?: Maybe<{
    __typename?: 'Room';
    id?: Maybe<string>;
    name?: Maybe<string>;
    lastMessage?: Maybe<{
      __typename?: 'Message';
      id?: Maybe<string>;
      content?: Maybe<string>;
      createdAt?: Maybe<any>;
      user?: Maybe<{ __typename?: 'User'; id?: Maybe<string>; name?: Maybe<string> }>;
    }>;
    members?: Maybe<
      Array<Maybe<{ __typename?: 'User'; id?: Maybe<string>; name?: Maybe<string> }>>
    >;
  }>;
};

export type CreateMessageMutationVariables = {
  data: CreateMessageInput;
};

export type CreateMessageMutation = {
  __typename?: 'Mutation';
  createMessage?: Maybe<{ __typename?: 'Message'; id?: Maybe<string> }>;
};

export type GetMessagesQueryVariables = {
  roomId?: Maybe<Scalars['ID']>;
  limit?: Maybe<Scalars['Int']>;
  afterDate?: Maybe<Scalars['Timestamp']>;
};

export type GetMessagesQuery = {
  __typename?: 'Query';
  getMessages?: Maybe<{
    __typename?: 'GetMessagesResponse';
    hasMore?: Maybe<boolean>;
    cursor?: Maybe<any>;
    items?: Maybe<
      Array<
        Maybe<{
          __typename?: 'Message';
          id?: Maybe<string>;
          content?: Maybe<string>;
          createdAt?: Maybe<any>;
          user?: Maybe<{ __typename?: 'User'; id?: Maybe<string>; name?: Maybe<string> }>;
        }>
      >
    >;
  }>;
};

export type MessageCreatedSubscriptionVariables = {
  roomIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type MessageCreatedSubscription = {
  __typename?: 'Subscription';
  messageCreated?: Maybe<{
    __typename?: 'Message';
    id?: Maybe<string>;
    content?: Maybe<string>;
    createdAt?: Maybe<any>;
    user?: Maybe<{ __typename?: 'User'; id?: Maybe<string>; name?: Maybe<string> }>;
    room?: Maybe<{ __typename?: 'Room'; id?: Maybe<string>; name?: Maybe<string> }>;
  }>;
};

export type PullChangesQueryVariables = {
  lastPulledAt?: Maybe<Scalars['Float']>;
};

export type PullChangesQuery = { __typename?: 'Query'; pullChanges?: Maybe<any> };

export type PushChangesMutationVariables = {
  changes?: Maybe<Scalars['JSON']>;
  lastPulledAt?: Maybe<Scalars['Float']>;
};

export type PushChangesMutation = { __typename?: 'Mutation'; pushChanges?: Maybe<boolean> };

export type RegisterDeviceMutationVariables = {
  data: RegisterDeviceInput;
};

export type RegisterDeviceMutation = { __typename?: 'Mutation'; registerDevice?: Maybe<boolean> };

export const CreateAccountDocument = gql`
  mutation CreateAccount($data: CreateAccountInput!) {
    createAccount(data: $data) {
      user {
        id
        name
        email
        role
        lastAccessAt
        createdAt
      }
      token
    }
  }
`;

export function useCreateAccountMutation() {
  return Urql.useMutation<CreateAccountMutation, CreateAccountMutationVariables>(
    CreateAccountDocument,
  );
}
export const SignInDocument = gql`
  mutation SignIn($data: SignInInput!) {
    signIn(data: $data) {
      user {
        id
        name
        email
        role
        lastAccessAt
        createdAt
      }
      token
    }
  }
`;

export function useSignInMutation() {
  return Urql.useMutation<SignInMutation, SignInMutationVariables>(SignInDocument);
}
export const ForgotPasswordDocument = gql`
  mutation ForgotPassword($data: ForgotPasswordInput!) {
    forgotPassword(data: $data)
  }
`;

export function useForgotPasswordMutation() {
  return Urql.useMutation<ForgotPasswordMutation, ForgotPasswordMutationVariables>(
    ForgotPasswordDocument,
  );
}
export const ChangePasswordDocument = gql`
  mutation ChangePassword($data: ChangePasswordInput!) {
    changePassword(data: $data)
  }
`;

export function useChangePasswordMutation() {
  return Urql.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(
    ChangePasswordDocument,
  );
}
export const MeDocument = gql`
  query Me {
    me {
      id
      name
      email
      role
      lastAccessAt
      createdAt
    }
  }
`;

export function useMeQuery(options: Omit<Urql.UseQueryArgs<MeQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<MeQuery>({ query: MeDocument, ...options });
}
export const ListUsersDocument = gql`
  query ListUsers($where: ListUsersWhere, $order: ListUsersOrder, $skip: Int, $take: Int) {
    listUsers(where: $where, order: $order, skip: $skip, take: $take) {
      id
      name
      email
    }
  }
`;

export function useListUsersQuery(
  options: Omit<Urql.UseQueryArgs<ListUsersQueryVariables>, 'query'> = {},
) {
  return Urql.useQuery<ListUsersQuery>({ query: ListUsersDocument, ...options });
}
export const CreateRoomDocument = gql`
  mutation CreateRoom($data: CreateRoomInput!) {
    createRoom(data: $data) {
      id
      name
      members {
        id
        name
      }
    }
  }
`;

export function useCreateRoomMutation() {
  return Urql.useMutation<CreateRoomMutation, CreateRoomMutationVariables>(CreateRoomDocument);
}
export const GetRoomsDocument = gql`
  query GetRooms {
    getRooms {
      id
      name
      lastMessage {
        id
        content
        createdAt
        user {
          id
          name
        }
      }
      members {
        id
        name
      }
    }
  }
`;

export function useGetRoomsQuery(
  options: Omit<Urql.UseQueryArgs<GetRoomsQueryVariables>, 'query'> = {},
) {
  return Urql.useQuery<GetRoomsQuery>({ query: GetRoomsDocument, ...options });
}
export const RoomCreatedDocument = gql`
  subscription RoomCreated {
    roomCreated {
      id
      name
      lastMessage {
        id
        content
        createdAt
        user {
          id
          name
        }
      }
      members {
        id
        name
      }
    }
  }
`;

export function useRoomCreatedSubscription<TData = any>(
  options: Omit<Urql.UseSubscriptionArgs<RoomCreatedSubscriptionVariables>, 'query'> = {},
  handler?: Urql.SubscriptionHandler<RoomCreatedSubscription, TData>,
) {
  return Urql.useSubscription<RoomCreatedSubscription, TData, RoomCreatedSubscriptionVariables>(
    { query: RoomCreatedDocument, ...options },
    handler,
  );
}
export const CreateMessageDocument = gql`
  mutation CreateMessage($data: CreateMessageInput!) {
    createMessage(data: $data) {
      id
    }
  }
`;

export function useCreateMessageMutation() {
  return Urql.useMutation<CreateMessageMutation, CreateMessageMutationVariables>(
    CreateMessageDocument,
  );
}
export const GetMessagesDocument = gql`
  query GetMessages($roomId: ID, $limit: Int, $afterDate: Timestamp) {
    getMessages(roomId: $roomId, limit: $limit, afterDate: $afterDate) {
      hasMore
      cursor
      items {
        id
        content
        user {
          id
          name
        }
        createdAt
      }
    }
  }
`;

export function useGetMessagesQuery(
  options: Omit<Urql.UseQueryArgs<GetMessagesQueryVariables>, 'query'> = {},
) {
  return Urql.useQuery<GetMessagesQuery>({ query: GetMessagesDocument, ...options });
}
export const MessageCreatedDocument = gql`
  subscription MessageCreated($roomIds: [ID]) {
    messageCreated(roomIds: $roomIds) {
      id
      content
      user {
        id
        name
      }
      room {
        id
        name
      }
      createdAt
    }
  }
`;

export function useMessageCreatedSubscription<TData = any>(
  options: Omit<Urql.UseSubscriptionArgs<MessageCreatedSubscriptionVariables>, 'query'> = {},
  handler?: Urql.SubscriptionHandler<MessageCreatedSubscription, TData>,
) {
  return Urql.useSubscription<
    MessageCreatedSubscription,
    TData,
    MessageCreatedSubscriptionVariables
  >({ query: MessageCreatedDocument, ...options }, handler);
}
export const PullChangesDocument = gql`
  query PullChanges($lastPulledAt: Float) {
    pullChanges(lastPulledAt: $lastPulledAt)
  }
`;

export function usePullChangesQuery(
  options: Omit<Urql.UseQueryArgs<PullChangesQueryVariables>, 'query'> = {},
) {
  return Urql.useQuery<PullChangesQuery>({ query: PullChangesDocument, ...options });
}
export const PushChangesDocument = gql`
  mutation PushChanges($changes: JSON, $lastPulledAt: Float) {
    pushChanges(changes: $changes, lastPulledAt: $lastPulledAt)
  }
`;

export function usePushChangesMutation() {
  return Urql.useMutation<PushChangesMutation, PushChangesMutationVariables>(PushChangesDocument);
}
export const RegisterDeviceDocument = gql`
  mutation RegisterDevice($data: RegisterDeviceInput!) {
    registerDevice(data: $data)
  }
`;

export function useRegisterDeviceMutation() {
  return Urql.useMutation<RegisterDeviceMutation, RegisterDeviceMutationVariables>(
    RegisterDeviceDocument,
  );
}
