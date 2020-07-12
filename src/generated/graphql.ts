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
  changes?: Maybe<SyncChanges>;
};

export type SyncChanges = {
  __typename?: 'SyncChanges';
  messages?: Maybe<MessageTableChangeSet>;
  readReceipts?: Maybe<ReadReceiptTableChangeSet>;
  rooms?: Maybe<RoomTableChangeSet>;
  users?: Maybe<UserTableChangeSet>;
  roomMembers?: Maybe<RoomMemberTableChangeSet>;
};

export type MessageTableChangeSet = {
  __typename?: 'MessageTableChangeSet';
  created?: Maybe<Array<Maybe<MessageChanges>>>;
  updated?: Maybe<Array<Maybe<MessageChanges>>>;
  deleted?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type MessageChanges = {
  __typename?: 'MessageChanges';
  _status?: Maybe<Scalars['String']>;
  _changed?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  cipher?: Maybe<Scalars['String']>;
  type?: Maybe<MessageType>;
  userId?: Maybe<Scalars['ID']>;
  roomId?: Maybe<Scalars['ID']>;
  sentAt?: Maybe<Scalars['Float']>;
  createdAt?: Maybe<Scalars['Float']>;
};

export type ReadReceiptTableChangeSet = {
  __typename?: 'ReadReceiptTableChangeSet';
  created?: Maybe<Array<Maybe<ReadReceiptChanges>>>;
  updated?: Maybe<Array<Maybe<ReadReceiptChanges>>>;
  deleted?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type ReadReceiptChanges = {
  __typename?: 'ReadReceiptChanges';
  _status?: Maybe<Scalars['String']>;
  _changed?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  userId?: Maybe<Scalars['ID']>;
  roomId?: Maybe<Scalars['ID']>;
  messageId?: Maybe<Scalars['ID']>;
  receivedAt?: Maybe<Scalars['Float']>;
  seenAt?: Maybe<Scalars['Float']>;
};

export type RoomTableChangeSet = {
  __typename?: 'RoomTableChangeSet';
  created?: Maybe<Array<Maybe<RoomChanges>>>;
  updated?: Maybe<Array<Maybe<RoomChanges>>>;
  deleted?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type RoomChanges = {
  __typename?: 'RoomChanges';
  _status?: Maybe<Scalars['String']>;
  _changed?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  pictureUri?: Maybe<Scalars['String']>;
  lastChangeAt?: Maybe<Scalars['Float']>;
  lastMessageId?: Maybe<Scalars['ID']>;
  createdAt?: Maybe<Scalars['Float']>;
};

export type UserTableChangeSet = {
  __typename?: 'UserTableChangeSet';
  created?: Maybe<Array<Maybe<UserChanges>>>;
  updated?: Maybe<Array<Maybe<UserChanges>>>;
  deleted?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type UserChanges = {
  __typename?: 'UserChanges';
  _status?: Maybe<Scalars['String']>;
  _changed?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  pictureUri?: Maybe<Scalars['String']>;
  publicKey?: Maybe<Scalars['String']>;
  derivedSalt?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  isFollowingMe?: Maybe<Scalars['Boolean']>;
  isFollowedByMe?: Maybe<Scalars['Boolean']>;
};

export type RoomMemberTableChangeSet = {
  __typename?: 'RoomMemberTableChangeSet';
  created?: Maybe<Array<Maybe<RoomMemberChanges>>>;
  updated?: Maybe<Array<Maybe<RoomMemberChanges>>>;
  deleted?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type RoomMemberChanges = {
  __typename?: 'RoomMemberChanges';
  _status?: Maybe<Scalars['String']>;
  _changed?: Maybe<Scalars['String']>;
  /** Not a normal uuid */
  id?: Maybe<Scalars['String']>;
  roomId?: Maybe<Scalars['ID']>;
  userId?: Maybe<Scalars['ID']>;
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
  changes?: Maybe<SyncChangesInput>;
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

export type SyncChangesInput = {
  messages?: Maybe<MessageTableChangeSetInput>;
  readReceipts?: Maybe<ReadReceiptTableChangeSetInput>;
  rooms?: Maybe<RoomTableChangeSetInput>;
  users?: Maybe<UserTableChangeSetInput>;
  roomMembers?: Maybe<RoomMemberTableChangeSetInput>;
};

export type MessageTableChangeSetInput = {
  created?: Maybe<Array<Maybe<MessageChangesInput>>>;
  updated?: Maybe<Array<Maybe<MessageChangesInput>>>;
  deleted?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type MessageChangesInput = {
  _status?: Maybe<Scalars['String']>;
  _changed?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  cipher?: Maybe<Scalars['String']>;
  type?: Maybe<MessageType>;
  userId?: Maybe<Scalars['ID']>;
  roomId?: Maybe<Scalars['ID']>;
  sentAt?: Maybe<Scalars['Float']>;
  createdAt?: Maybe<Scalars['Float']>;
};

export type ReadReceiptTableChangeSetInput = {
  created?: Maybe<Array<Maybe<ReadReceiptChangesInput>>>;
  updated?: Maybe<Array<Maybe<ReadReceiptChangesInput>>>;
  deleted?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type ReadReceiptChangesInput = {
  _status?: Maybe<Scalars['String']>;
  _changed?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  userId?: Maybe<Scalars['ID']>;
  roomId?: Maybe<Scalars['ID']>;
  messageId?: Maybe<Scalars['ID']>;
  receivedAt?: Maybe<Scalars['Float']>;
  seenAt?: Maybe<Scalars['Float']>;
};

export type RoomTableChangeSetInput = {
  created?: Maybe<Array<Maybe<RoomChangesInput>>>;
  updated?: Maybe<Array<Maybe<RoomChangesInput>>>;
  deleted?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type RoomChangesInput = {
  _status?: Maybe<Scalars['String']>;
  _changed?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  pictureUri?: Maybe<Scalars['String']>;
  lastChangeAt?: Maybe<Scalars['Float']>;
  lastMessageId?: Maybe<Scalars['ID']>;
  createdAt?: Maybe<Scalars['Float']>;
};

export type UserTableChangeSetInput = {
  created?: Maybe<Array<Maybe<UserChangesInput>>>;
  updated?: Maybe<Array<Maybe<UserChangesInput>>>;
  deleted?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type UserChangesInput = {
  _status?: Maybe<Scalars['String']>;
  _changed?: Maybe<Scalars['String']>;
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  pictureUri?: Maybe<Scalars['String']>;
  publicKey?: Maybe<Scalars['String']>;
  derivedSalt?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  isFollowingMe?: Maybe<Scalars['Boolean']>;
  isFollowedByMe?: Maybe<Scalars['Boolean']>;
};

export type RoomMemberTableChangeSetInput = {
  created?: Maybe<Array<Maybe<RoomMemberChangesInput>>>;
  updated?: Maybe<Array<Maybe<RoomMemberChangesInput>>>;
  deleted?: Maybe<Array<Maybe<Scalars['ID']>>>;
};

export type RoomMemberChangesInput = {
  _status?: Maybe<Scalars['String']>;
  _changed?: Maybe<Scalars['String']>;
  /** Not a normal uuid */
  id?: Maybe<Scalars['String']>;
  roomId?: Maybe<Scalars['ID']>;
  userId?: Maybe<Scalars['ID']>;
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
  shouldSync?: Maybe<Scalars['Boolean']>;
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

export type RegisterDeviceMutationVariables = Exact<{
  data: RegisterDeviceInput;
}>;


export type RegisterDeviceMutation = { __typename?: 'Mutation', registerDevice?: Maybe<boolean> };

export type UnregisterDeviceMutationVariables = Exact<{
  data: RegisterDeviceInput;
}>;


export type UnregisterDeviceMutation = { __typename?: 'Mutation', unregisterDevice?: Maybe<boolean> };

export type ShouldSyncSubscriptionVariables = Exact<{
  roomIds?: Maybe<Array<Scalars['ID']>>;
}>;


export type ShouldSyncSubscription = { __typename?: 'Subscription', shouldSync?: Maybe<boolean> };

export type PushChangesMutationVariables = Exact<{
  changes?: Maybe<SyncChangesInput>;
  lastPulledAt?: Maybe<Scalars['Float']>;
}>;


export type PushChangesMutation = { __typename?: 'Mutation', pushChanges?: Maybe<boolean> };

export type PullChangesQueryVariables = Exact<{
  lastPulledAt?: Maybe<Scalars['Float']>;
}>;


export type PullChangesQuery = { __typename?: 'Query', pullChanges?: Maybe<{ __typename?: 'PullChangesResult', timestamp: number, changes?: Maybe<{ __typename?: 'SyncChanges', messages?: Maybe<{ __typename?: 'MessageTableChangeSet', deleted?: Maybe<Array<Maybe<string>>>, created?: Maybe<Array<Maybe<(
          { __typename?: 'MessageChanges' }
          & MessageChangesFragmentFragment
        )>>>, updated?: Maybe<Array<Maybe<(
          { __typename?: 'MessageChanges' }
          & MessageChangesFragmentFragment
        )>>> }>, readReceipts?: Maybe<{ __typename?: 'ReadReceiptTableChangeSet', deleted?: Maybe<Array<Maybe<string>>>, created?: Maybe<Array<Maybe<(
          { __typename?: 'ReadReceiptChanges' }
          & ReadReceiptChangesFragmentFragment
        )>>>, updated?: Maybe<Array<Maybe<(
          { __typename?: 'ReadReceiptChanges' }
          & ReadReceiptChangesFragmentFragment
        )>>> }>, rooms?: Maybe<{ __typename?: 'RoomTableChangeSet', deleted?: Maybe<Array<Maybe<string>>>, created?: Maybe<Array<Maybe<(
          { __typename?: 'RoomChanges' }
          & RoomChangesFragmentFragment
        )>>>, updated?: Maybe<Array<Maybe<(
          { __typename?: 'RoomChanges' }
          & RoomChangesFragmentFragment
        )>>> }>, users?: Maybe<{ __typename?: 'UserTableChangeSet', deleted?: Maybe<Array<Maybe<string>>>, created?: Maybe<Array<Maybe<(
          { __typename?: 'UserChanges' }
          & UserChangesFragmentFragment
        )>>>, updated?: Maybe<Array<Maybe<(
          { __typename?: 'UserChanges' }
          & UserChangesFragmentFragment
        )>>> }>, roomMembers?: Maybe<{ __typename?: 'RoomMemberTableChangeSet', deleted?: Maybe<Array<Maybe<string>>>, created?: Maybe<Array<Maybe<(
          { __typename?: 'RoomMemberChanges' }
          & RoomMemberChangesFragmentFragment
        )>>>, updated?: Maybe<Array<Maybe<(
          { __typename?: 'RoomMemberChanges' }
          & RoomMemberChangesFragmentFragment
        )>>> }> }> }> };

export type MessageChangesFragmentFragment = { __typename?: 'MessageChanges', id?: Maybe<string>, cipher?: Maybe<string>, type?: Maybe<MessageType>, userId?: Maybe<string>, roomId?: Maybe<string>, sentAt?: Maybe<number>, createdAt?: Maybe<number> };

export type ReadReceiptChangesFragmentFragment = { __typename?: 'ReadReceiptChanges', id?: Maybe<string>, userId?: Maybe<string>, roomId?: Maybe<string>, messageId?: Maybe<string>, receivedAt?: Maybe<number>, seenAt?: Maybe<number> };

export type RoomChangesFragmentFragment = { __typename?: 'RoomChanges', id?: Maybe<string>, name?: Maybe<string>, pictureUri?: Maybe<string>, lastChangeAt?: Maybe<number>, lastMessageId?: Maybe<string>, createdAt?: Maybe<number> };

export type UserChangesFragmentFragment = { __typename?: 'UserChanges', id?: Maybe<string>, name?: Maybe<string>, email?: Maybe<string>, pictureUri?: Maybe<string>, publicKey?: Maybe<string>, role?: Maybe<string>, isFollowingMe?: Maybe<boolean>, isFollowedByMe?: Maybe<boolean> };

export type RoomMemberChangesFragmentFragment = { __typename?: 'RoomMemberChanges', id?: Maybe<string>, roomId?: Maybe<string>, userId?: Maybe<string> };

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
export const MessageChangesFragmentFragmentDoc = gql`
    fragment MessageChangesFragment on MessageChanges {
  id
  cipher
  type
  userId
  roomId
  sentAt
  createdAt
}
    `;
export const ReadReceiptChangesFragmentFragmentDoc = gql`
    fragment ReadReceiptChangesFragment on ReadReceiptChanges {
  id
  userId
  roomId
  messageId
  receivedAt
  seenAt
}
    `;
export const RoomChangesFragmentFragmentDoc = gql`
    fragment RoomChangesFragment on RoomChanges {
  id
  name
  pictureUri
  lastChangeAt
  lastMessageId
  createdAt
}
    `;
export const UserChangesFragmentFragmentDoc = gql`
    fragment UserChangesFragment on UserChanges {
  id
  name
  email
  pictureUri
  publicKey
  role
  isFollowingMe
  isFollowedByMe
}
    `;
export const RoomMemberChangesFragmentFragmentDoc = gql`
    fragment RoomMemberChangesFragment on RoomMemberChanges {
  id
  roomId
  userId
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
export const ShouldSyncDocument = gql`
    subscription ShouldSync($roomIds: [ID!]) {
  shouldSync(roomIds: $roomIds)
}
    `;

export function useShouldSyncSubscription<TData = ShouldSyncSubscription>(options: Omit<Urql.UseSubscriptionArgs<ShouldSyncSubscriptionVariables>, 'query'> = {}, handler?: Urql.SubscriptionHandler<ShouldSyncSubscription, TData>) {
  return Urql.useSubscription<ShouldSyncSubscription, TData, ShouldSyncSubscriptionVariables>({ query: ShouldSyncDocument, ...options }, handler);
};
export const PushChangesDocument = gql`
    mutation PushChanges($changes: SyncChangesInput, $lastPulledAt: Float) {
  pushChanges(changes: $changes, lastPulledAt: $lastPulledAt)
}
    `;

export function usePushChangesMutation() {
  return Urql.useMutation<PushChangesMutation, PushChangesMutationVariables>(PushChangesDocument);
};
export const PullChangesDocument = gql`
    query PullChanges($lastPulledAt: Float) {
  pullChanges(lastPulledAt: $lastPulledAt) {
    timestamp
    changes {
      messages {
        created {
          ...MessageChangesFragment
        }
        updated {
          ...MessageChangesFragment
        }
        deleted
      }
      readReceipts {
        created {
          ...ReadReceiptChangesFragment
        }
        updated {
          ...ReadReceiptChangesFragment
        }
        deleted
      }
      rooms {
        created {
          ...RoomChangesFragment
        }
        updated {
          ...RoomChangesFragment
        }
        deleted
      }
      users {
        created {
          ...UserChangesFragment
        }
        updated {
          ...UserChangesFragment
        }
        deleted
      }
      roomMembers {
        created {
          ...RoomMemberChangesFragment
        }
        updated {
          ...RoomMemberChangesFragment
        }
        deleted
      }
    }
  }
}
    ${MessageChangesFragmentFragmentDoc}
${ReadReceiptChangesFragmentFragmentDoc}
${RoomChangesFragmentFragmentDoc}
${UserChangesFragmentFragmentDoc}
${RoomMemberChangesFragmentFragmentDoc}`;

export function usePullChangesQuery(options: Omit<Urql.UseQueryArgs<PullChangesQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<PullChangesQuery>({ query: PullChangesDocument, ...options });
};