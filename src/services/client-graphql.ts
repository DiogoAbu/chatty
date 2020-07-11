import env from 'react-native-config';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import {
  cacheExchange,
  Client,
  createClient as createGraphQl,
  dedupExchange,
  fetchExchange,
  subscriptionExchange,
} from 'urql';

import { fetchOptionsExchange } from '!/exchanges/fetch-options';

const { NODE_ENV } = process.env;

export default function createClient(getToken: () => Promise<string>): Client {
  // By using lazy, we delay the connection until it's required, so the connection params
  // will get the token only when it's available.
  // We ensure it's available be using the 'pause' attribute in the subscription hook.
  const subsClient = new SubscriptionClient(
    env.SUBS_URL,
    {
      lazy: true,
      reconnect: true,
      connectionParams: async () => {
        const token = await getToken();
        return {
          authorization: token ? `Bearer ${token}` : '',
        };
      },
    },
    NODE_ENV === 'test' ? require('ws') : undefined,
  );

  subsClient.onError((...args) => {
    console.log('Subscription', ...args);
  });

  const graphClient = createGraphQl({
    url: env.API_URL,
    fetchOptions: {},
    exchanges: [
      dedupExchange,
      cacheExchange,
      fetchOptionsExchange(async (fetchOptions: RequestInit) => {
        const token = await getToken();
        return {
          ...fetchOptions,
          headers: {
            ...fetchOptions.headers,
            authorization: token ? `Bearer ${token}` : '',
          },
        };
      }),
      fetchExchange,
      subscriptionExchange({ forwardSubscription: (op) => subsClient.request(op) }),
    ],
  });

  return graphClient;
}
