import { FC, useEffect, useRef } from 'react';

import NetInfo from '@react-native-community/netinfo';

import useMethod from '!/hooks/use-method';
import { useStores } from '!/stores';

const SyncManager: FC<unknown> = () => {
  const { syncStore } = useStores();

  const timeout = useRef<number | null>(null);

  const syncTimeout = useMethod(() => {
    timeout.current = setTimeout(() => {
      syncStore.sync().finally(() => {
        syncTimeout();
      });
    }, 20000);
  });

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(() => {
      void syncStore.sync();
    });

    syncTimeout();

    return () => {
      unsubscribe();

      if (timeout.current) {
        clearTimeout(timeout.current);
      }
    };
  }, [syncStore, syncTimeout]);

  return null;
};

export default SyncManager;
