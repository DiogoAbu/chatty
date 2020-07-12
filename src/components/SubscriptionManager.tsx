import { FC, useEffect } from 'react';

import { useClient } from 'urql';
import { pipe, subscribe } from 'wonka';

import {
  ShouldSyncDocument,
  ShouldSyncSubscription,
  ShouldSyncSubscriptionVariables,
} from '!/generated/graphql';
import { withAllRooms, WithAllRoomsInput, WithAllRoomsOutput } from '!/screens/Chats/queries';
import debug from '!/services/debug';
import { useStores } from '!/stores';

const log = debug.extend('subscription-manager');

interface Props {
  token: string;
  userId: string;
}

const SubscriptionManager: FC<WithAllRoomsOutput & Props> = ({ token, userId, rooms }) => {
  const { syncStore } = useStores();
  const client = useClient();

  const roomIds = rooms?.map((e) => e.id) || [];

  useEffect(() => {
    if (!token || !userId) {
      return () => null;
    }

    const { unsubscribe } = pipe(
      client.subscription<ShouldSyncSubscription, ShouldSyncSubscriptionVariables>(
        ShouldSyncDocument,
        { roomIds },
        { requestPolicy: 'network-only' },
      ),
      subscribe(() => {
        log('Should sync');
        void syncStore.sync();
      }),
    );

    return () => {
      unsubscribe();
    };
  }, [client, roomIds, syncStore, token, userId]);

  return null;
};

export default withAllRooms(SubscriptionManager) as FC<WithAllRoomsInput & Props>;
