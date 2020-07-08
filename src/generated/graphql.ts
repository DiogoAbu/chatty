import gql from 'graphql-tag';
import * as Urql from 'urql';
export type Maybe<T> = T;
export type Exact<T extends { [key: string]: any }> = { [K in keyof T]: T[K] };
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
  pullChanges?: Maybe<PullChangesResult>;
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
  cipher?: Maybe<Scalars['String']>;
  type?: Maybe<MessageType>;
  sender?: Maybe<User>;
  room?: Maybe<Room>;
  readReceipts?: Maybe<Array<Maybe<ReadReceipt>>>;
  sentAt?: Maybe<Scalars['Timestamp']>;
  updatedAt?: Maybe<Scalars['Timestamp']>;
  createdAt?: Maybe<Scalars['Timestamp']>;
};

/** The message types */
export type MessageType = 
  | 'default'
  | 'announcement'
  | 'sharedKey';

export type User = {
  __typename?: 'User';
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  pictureUri?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  publicKey?: Maybe<Scalars['String']>;
  derivedSalt?: Maybe<Scalars['String']>;
  lastAccessAt?: Maybe<Scalars['Timestamp']>;
  rooms?: Maybe<Array<Maybe<Room>>>;
  messages?: Maybe<Array<Maybe<Message>>>;
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
  pictureUri?: Maybe<Scalars['String']>;
  members?: Maybe<Array<Maybe<User>>>;
  messages?: Maybe<Array<Maybe<Message>>>;
  readReceipts?: Maybe<Array<Maybe<ReadReceipt>>>;
  updatedAt?: Maybe<Scalars['Timestamp']>;
  createdAt?: Maybe<Scalars['Timestamp']>;
  lastMessage?: Maybe<Message>;
};

export type ReadReceipt = {
  __typename?: 'ReadReceipt';
  id?: Maybe<Scalars['ID']>;
  user?: Maybe<User>;
  message?: Maybe<Message>;
  room?: Maybe<Room>;
  receivedAt?: Maybe<Scalars['Float']>;
  seenAt?: Maybe<Scalars['Float']>;
  updatedAt?: Maybe<Scalars['Timestamp']>;
};

export type Device = {
  __typename?: 'Device';
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
  platform?: Maybe<DevicePlatform>;
  user?: Maybe<User>;
  createdAt?: Maybe<Scalars['Timestamp']>;
};

/** The acceptable platforms */
export type DevicePlatform = 
  | 'ios'
  | 'android'
  | 'windows'
  | 'macos'
  | 'web';

export type PullChangesResult = {
  __typename?: 'PullChangesResult';
  /** Last successful pull in milliseconds since UNIX epoch */
  timestamp: Scalars['Float'];
  changes?: Maybe<Scalars['JSON']>;
};


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
  unregisterDevice?: Maybe<Scalars['Boolean']>;
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


export type MutationUnregisterDeviceArgs = {
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
  name?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
  platform?: Maybe<DevicePlatform>;
};

export type CreateMessageInput = {
  roomId?: Maybe<Scalars['ID']>;
  messageId?: Maybe<Scalars['String']>;
  cipher?: Maybe<Scalars['String']>;
  type?: Maybe<MessageType>;
};

export type CreateRoomInput = {
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  pictureUri?: Maybe<Scalars['String']>;
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
  pictureUri?: Maybe<Scalars['String']>;
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
  readReceiptCreated?: Maybe<ReadReceipt>;
  roomCreated?: Maybe<Room>;
  shouldSync?: Maybe<Scalars['Boolean']>;
};


export type SubscriptionMessageCreatedArgs = {
  roomIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


export type SubscriptionReadReceiptCreatedArgs = {
  roomIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};


export type SubscriptionShouldSyncArgs = {
  roomIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type UserFragmentFragment = { __typename?: 'User', id?: Maybe<string>, name?: Maybe<string>, email?: Maybe<string>, role?: Maybe<string>, pictureUri?: Maybe<string>, publicKey?: Maybe<string>, isFollowingMe?: Maybe<boolean>, isFollowedByMe?: Maybe<boolean> };

export type RoomFragmentFragment = { __typename?: 'Room', id?: Maybe<string>, name?: Maybe<string>, pictureUri?: Maybe<string> };

export type CreateAccountMutationVariables = Exact<{
  data: CreateAccountInput;
}>;


export type CreateAccountMutation = { __typename?: 'Mutation', createAccount?: Maybe<{ __typename?: 'SignInResponse', token?: Maybe<string>, user?: Maybe<(
      { __typename?: 'User' }
      & UserFragmentFragment
    )> }> };

export type SignInMutationVariables = Exact<{
  data: SignInInput;
}>;


export type SignInMutation = { __typename?: 'Mutation', signIn?: Maybe<{ __typename?: 'SignInResponse', token?: Maybe<string>, user?: Maybe<(
      { __typename?: 'User', derivedSalt?: Maybe<string> }
      & UserFragmentFragment
    )> }> };

export type ForgotPasswordMutationVariables = Exact<{
  data: ForgotPasswordInput;
}>;


export type ForgotPasswordMutation = { __typename?: 'Mutation', forgotPassword?: Maybe<boolean> };

export type ChangePasswordMutationVariables = Exact<{
  data: ChangePasswordInput;
}>;


export type ChangePasswordMutation = { __typename?: 'Mutation', changePassword?: Maybe<boolean> };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: Maybe<(
    { __typename?: 'User', lastAccessAt?: Maybe<any>, createdAt?: Maybe<any> }
    & UserFragmentFragment
  )> };

export type ListUsersQueryVariables = Exact<{
  where?: Maybe<ListUsersWhere>;
  order?: Maybe<ListUsersOrder>;
  skip?: Maybe<Scalars['Int']>;
  take?: Maybe<Scalars['Int']>;
}>;


export type ListUsersQuery = { __typename?: 'Query', listUsers?: Maybe<Array<Maybe<(
    { __typename?: 'User' }
    & UserFragmentFragment
  )>>> };

export type CreateRoomMutationVariables = Exact<{
  data: CreateRoomInput;
}>;


export type CreateRoomMutation = { __typename?: 'Mutation', createRoom?: Maybe<(
    { __typename?: 'Room', members?: Maybe<Array<Maybe<(
      { __typename?: 'User' }
      & UserFragmentFragment
    )>>> }
    & RoomFragmentFragment
  )> };

export type GetRoomsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRoomsQuery = { __typename?: 'Query', getRooms?: Maybe<Array<Maybe<(
    { __typename?: 'Room', lastMessage?: Maybe<{ __typename?: 'Message', id?: Maybe<string>, cipher?: Maybe<string>, type?: Maybe<MessageType>, createdAt?: Maybe<any>, sentAt?: Maybe<any>, sender?: Maybe<(
        { __typename?: 'User' }
        & UserFragmentFragment
      )>, readReceipts?: Maybe<Array<Maybe<{ __typename?: 'ReadReceipt', id?: Maybe<string>, receivedAt?: Maybe<number>, seenAt?: Maybe<number>, user?: Maybe<{ __typename?: 'User', id?: Maybe<string> }> }>>> }>, members?: Maybe<Array<Maybe<(
      { __typename?: 'User' }
      & UserFragmentFragment
    )>>> }
    & RoomFragmentFragment
  )>>> };

export type RoomCreatedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type RoomCreatedSubscription = { __typename?: 'Subscription', roomCreated?: Maybe<{ __typename?: 'Room', id?: Maybe<string>, name?: Maybe<string>, pictureUri?: Maybe<string>, lastMessage?: Maybe<{ __typename?: 'Message', id?: Maybe<string>, cipher?: Maybe<string>, type?: Maybe<MessageType>, createdAt?: Maybe<any>, sentAt?: Maybe<any>, sender?: Maybe<{ __typename?: 'User', id?: Maybe<string>, name?: Maybe<string>, email?: Maybe<string>, role?: Maybe<string>, pictureUri?: Maybe<string>, publicKey?: Maybe<string> }>, readReceipts?: Maybe<Array<Maybe<{ __typename?: 'ReadReceipt', id?: Maybe<string>, receivedAt?: Maybe<number>, seenAt?: Maybe<number>, user?: Maybe<{ __typename?: 'User', id?: Maybe<string> }> }>>> }>, members?: Maybe<Array<Maybe<{ __typename?: 'User', id?: Maybe<string>, name?: Maybe<string>, email?: Maybe<string>, role?: Maybe<string>, pictureUri?: Maybe<string>, publicKey?: Maybe<string> }>>> }> };

export type CreateMessageMutationVariables = Exact<{
  data: CreateMessageInput;
}>;


export type CreateMessageMutation = { __typename?: 'Mutation', createMessage?: Maybe<{ __typename?: 'Message', id?: Maybe<string> }> };

export type GetMessagesQueryVariables = Exact<{
  roomId?: Maybe<Scalars['ID']>;
  limit?: Maybe<Scalars['Int']>;
  afterDate?: Maybe<Scalars['Timestamp']>;
}>;


export type GetMessagesQuery = { __typename?: 'Query', getMessages?: Maybe<{ __typename?: 'GetMessagesResponse', hasMore?: Maybe<boolean>, cursor?: Maybe<any>, items?: Maybe<Array<Maybe<{ __typename?: 'Message', id?: Maybe<string>, cipher?: Maybe<string>, type?: Maybe<MessageType>, createdAt?: Maybe<any>, sender?: Maybe<(
        { __typename?: 'User' }
        & UserFragmentFragment
      )> }>>> }> };

export type MessageCreatedSubscriptionVariables = Exact<{
  roomIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
}>;


export type MessageCreatedSubscription = { __typename?: 'Subscription', messageCreated?: Maybe<{ __typename?: 'Message', id?: Maybe<string>, cipher?: Maybe<string>, type?: Maybe<MessageType>, createdAt?: Maybe<any>, sentAt?: Maybe<any>, sender?: Maybe<{ __typename?: 'User', id?: Maybe<string>, name?: Maybe<string>, email?: Maybe<string>, role?: Maybe<string>, pictureUri?: Maybe<string>, publicKey?: Maybe<string> }>, room?: Maybe<{ __typename?: 'Room', id?: Maybe<string>, name?: Maybe<string>, pictureUri?: Maybe<string> }>, readReceipts?: Maybe<Array<Maybe<{ __typename?: 'ReadReceipt', id?: Maybe<string>, receivedAt?: Maybe<number>, seenAt?: Maybe<number>, user?: Maybe<{ __typename?: 'User', id?: Maybe<string> }> }>>> }> };

export type ReadReceiptCreatedSubscriptionVariables = Exact<{
  roomIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
}>;


export type ReadReceiptCreatedSubscription = { __typename?: 'Subscription', readReceiptCreated?: Maybe<{ __typename?: 'ReadReceipt', id?: Maybe<string>, receivedAt?: Maybe<number>, seenAt?: Maybe<number>, user?: Maybe<{ __typename?: 'User', id?: Maybe<string> }>, message?: Maybe<{ __typename?: 'Message', id?: Maybe<string> }>, room?: Maybe<{ __typename?: 'Room', id?: Maybe<string> }> }> };

export type RegisterDeviceMutationVariables = Exact<{
  data: RegisterDeviceInput;
}>;


export type RegisterDeviceMutation = { __typename?: 'Mutation', registerDevice?: Maybe<boolean> };

export type UnregisterDeviceMutationVariables = Exact<{
  data: RegisterDeviceInput;
}>;


export type UnregisterDeviceMutation = { __typename?: 'Mutation', unregisterDevice?: Maybe<boolean> };

export type PullChangesQueryVariables = Exact<{
  lastPulledAt?: Maybe<Scalars['Float']>;
}>;


export type PullChangesQuery = { __typename?: 'Query', pullChanges?: Maybe<{ __typename?: 'PullChangesResult', timestamp: number, changes?: Maybe<any> }> };

export type PushChangesMutationVariables = Exact<{
  changes?: Maybe<Scalars['JSON']>;
  lastPulledAt?: Maybe<Scalars['Float']>;
}>;


export type PushChangesMutation = { __typename?: 'Mutation', pushChanges?: Maybe<boolean> };

export type ShouldSyncSubscriptionVariables = Exact<{
  roomIds?: Maybe<Array<Maybe<Scalars['ID']>>>;
}>;


export type ShouldSyncSubscription = { __typename?: 'Subscription', shouldSync?: Maybe<boolean> };

export const UserFragmentFragmentDoc = gql`
    fragment UserFragment on User {
  id
  name
  email
  role
  pictureUri
  publicKey
  isFollowingMe
  isFollowedByMe
}
    `;
export const RoomFragmentFragmentDoc = gql`
    fragment RoomFragment on Room {
  id
  name
  pictureUri
}
    `;
export const CreateAccountDocument = gql`
    mutation CreateAccount($data: CreateAccountInput!) {
  createAccount(data: $data) {
    user {
      ...UserFragment
    }
    token
  }
}
    ${UserFragmentFragmentDoc}`;

export function useCreateAccountMutation() {
  return Urql.useMutation<CreateAccountMutation, CreateAccountMutationVariables>(CreateAccountDocument);
};
export const SignInDocument = gql`
    mutation SignIn($data: SignInInput!) {
  signIn(data: $data) {
    user {
      ...UserFragment
      derivedSalt
    }
    token
  }
}
    ${UserFragmentFragmentDoc}`;

export function useSignInMutation() {
  return Urql.useMutation<SignInMutation, SignInMutationVariables>(SignInDocument);
};
export const ForgotPasswordDocument = gql`
    mutation ForgotPassword($data: ForgotPasswordInput!) {
  forgotPassword(data: $data)
}
    `;

export function useForgotPasswordMutation() {
  return Urql.useMutation<ForgotPasswordMutation, ForgotPasswordMutationVariables>(ForgotPasswordDocument);
};
export const ChangePasswordDocument = gql`
    mutation ChangePassword($data: ChangePasswordInput!) {
  changePassword(data: $data)
}
    `;

export function useChangePasswordMutation() {
  return Urql.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(ChangePasswordDocument);
};
export const MeDocument = gql`
    query Me {
  me {
    ...UserFragment
    lastAccessAt
    createdAt
  }
}
    ${UserFragmentFragmentDoc}`;

export function useMeQuery(options: Omit<Urql.UseQueryArgs<MeQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<MeQuery>({ query: MeDocument, ...options });
};
export const ListUsersDocument = gql`
    query ListUsers($where: ListUsersWhere, $order: ListUsersOrder, $skip: Int, $take: Int) {
  listUsers(where: $where, order: $order, skip: $skip, take: $take) {
    ...UserFragment
  }
}
    ${UserFragmentFragmentDoc}`;

export function useListUsersQuery(options: Omit<Urql.UseQueryArgs<ListUsersQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<ListUsersQuery>({ query: ListUsersDocument, ...options });
};
export const CreateRoomDocument = gql`
    mutation CreateRoom($data: CreateRoomInput!) {
  createRoom(data: $data) {
    ...RoomFragment
    members {
      ...UserFragment
    }
  }
}
    ${RoomFragmentFragmentDoc}
${UserFragmentFragmentDoc}`;

export function useCreateRoomMutation() {
  return Urql.useMutation<CreateRoomMutation, CreateRoomMutationVariables>(CreateRoomDocument);
};
export const GetRoomsDocument = gql`
    query GetRooms {
  getRooms {
    ...RoomFragment
    lastMessage {
      id
      cipher
      type
      createdAt
      sentAt
      sender {
        ...UserFragment
      }
      readReceipts {
        id
        user {
          id
        }
        receivedAt
        seenAt
      }
    }
    members {
      ...UserFragment
    }
  }
}
    ${RoomFragmentFragmentDoc}
${UserFragmentFragmentDoc}`;

export function useGetRoomsQuery(options: Omit<Urql.UseQueryArgs<GetRoomsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<GetRoomsQuery>({ query: GetRoomsDocument, ...options });
};
export const RoomCreatedDocument = gql`
    subscription RoomCreated {
  roomCreated {
    id
    name
    pictureUri
    lastMessage {
      id
      cipher
      type
      createdAt
      sentAt
      sender {
        id
        name
        email
        role
        pictureUri
        publicKey
      }
      readReceipts {
        id
        user {
          id
        }
        receivedAt
        seenAt
      }
    }
    members {
      id
      name
      email
      role
      pictureUri
      publicKey
    }
  }
}
    `;

export function useRoomCreatedSubscription<TData = RoomCreatedSubscription>(options: Omit<Urql.UseSubscriptionArgs<RoomCreatedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<RoomCreatedSubscription, TData>) {
  return Urql.useSubscription<RoomCreatedSubscription, TData, RoomCreatedSubscriptionVariables>({ query: RoomCreatedDocument, ...options }, handler);
};
export const CreateMessageDocument = gql`
    mutation CreateMessage($data: CreateMessageInput!) {
  createMessage(data: $data) {
    id
  }
}
    `;

export function useCreateMessageMutation() {
  return Urql.useMutation<CreateMessageMutation, CreateMessageMutationVariables>(CreateMessageDocument);
};
export const GetMessagesDocument = gql`
    query GetMessages($roomId: ID, $limit: Int, $afterDate: Timestamp) {
  getMessages(roomId: $roomId, limit: $limit, afterDate: $afterDate) {
    hasMore
    cursor
    items {
      id
      cipher
      type
      sender {
        ...UserFragment
      }
      createdAt
    }
  }
}
    ${UserFragmentFragmentDoc}`;

export function useGetMessagesQuery(options: Omit<Urql.UseQueryArgs<GetMessagesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<GetMessagesQuery>({ query: GetMessagesDocument, ...options });
};
export const MessageCreatedDocument = gql`
    subscription MessageCreated($roomIds: [ID]) {
  messageCreated(roomIds: $roomIds) {
    id
    cipher
    type
    createdAt
    sentAt
    sender {
      id
      name
      email
      role
      pictureUri
      publicKey
    }
    room {
      id
      name
      pictureUri
    }
    readReceipts {
      id
      user {
        id
      }
      receivedAt
      seenAt
    }
  }
}
    `;

export function useMessageCreatedSubscription<TData = MessageCreatedSubscription>(options: Omit<Urql.UseSubscriptionArgs<MessageCreatedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<MessageCreatedSubscription, TData>) {
  return Urql.useSubscription<MessageCreatedSubscription, TData, MessageCreatedSubscriptionVariables>({ query: MessageCreatedDocument, ...options }, handler);
};
export const ReadReceiptCreatedDocument = gql`
    subscription ReadReceiptCreated($roomIds: [ID]) {
  readReceiptCreated(roomIds: $roomIds) {
    id
    user {
      id
    }
    message {
      id
    }
    room {
      id
    }
    receivedAt
    seenAt
  }
}
    `;

export function useReadReceiptCreatedSubscription<TData = ReadReceiptCreatedSubscription>(options: Omit<Urql.UseSubscriptionArgs<ReadReceiptCreatedSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<ReadReceiptCreatedSubscription, TData>) {
  return Urql.useSubscription<ReadReceiptCreatedSubscription, TData, ReadReceiptCreatedSubscriptionVariables>({ query: ReadReceiptCreatedDocument, ...options }, handler);
};
export const RegisterDeviceDocument = gql`
    mutation RegisterDevice($data: RegisterDeviceInput!) {
  registerDevice(data: $data)
}
    `;

export function useRegisterDeviceMutation() {
  return Urql.useMutation<RegisterDeviceMutation, RegisterDeviceMutationVariables>(RegisterDeviceDocument);
};
export const UnregisterDeviceDocument = gql`
    mutation UnregisterDevice($data: RegisterDeviceInput!) {
  unregisterDevice(data: $data)
}
    `;

export function useUnregisterDeviceMutation() {
  return Urql.useMutation<UnregisterDeviceMutation, UnregisterDeviceMutationVariables>(UnregisterDeviceDocument);
};
export const PullChangesDocument = gql`
    query PullChanges($lastPulledAt: Float) {
  pullChanges(lastPulledAt: $lastPulledAt) {
    timestamp
    changes
  }
}
    `;

export function usePullChangesQuery(options: Omit<Urql.UseQueryArgs<PullChangesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<PullChangesQuery>({ query: PullChangesDocument, ...options });
};
export const PushChangesDocument = gql`
    mutation PushChanges($changes: JSON, $lastPulledAt: Float) {
  pushChanges(changes: $changes, lastPulledAt: $lastPulledAt)
}
    `;

export function usePushChangesMutation() {
  return Urql.useMutation<PushChangesMutation, PushChangesMutationVariables>(PushChangesDocument);
};
export const ShouldSyncDocument = gql`
    subscription ShouldSync($roomIds: [ID]) {
  shouldSync(roomIds: $roomIds)
}
    `;

export function useShouldSyncSubscription<TData = ShouldSyncSubscription>(options: Omit<Urql.UseSubscriptionArgs<ShouldSyncSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<ShouldSyncSubscription, TData>) {
  return Urql.useSubscription<ShouldSyncSubscription, TData, ShouldSyncSubscriptionVariables>({ query: ShouldSyncDocument, ...options }, handler);
};