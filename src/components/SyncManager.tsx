import { FC, useEffect, useRef } from 'react';

import { useDatabase } from '@nozbe/watermelondb/hooks';
import { useClient } from 'urql';

import useMethod from '!/hooks/use-method';
import debug from '!/services/debug';
import sync from '!/services/sync';

const log = debug.extend('sync-manager');

interface Props {
  userId: string;
  token: string;
}

const SyncManager: FC<Props> = ({ userId }) => {
  const client = useClient();
  const database = useDatabase();

  const syncing = useRef(false);

  const syncChanges = useMethod(() => {
    if (syncing.current || !userId) {
      log('skipped. Reason: ' + (syncing.current ? 'sync in progress' : !userId ? 'no user' : 'none'));
      return;
    }
    syncing.current = true;

    const timeout = setTimeout(() => {
      log('force finished');
      syncing.current = false;
    }, 21000);

    sync(userId, database, client)
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        clearTimeout(timeout);
        syncing.current = false;
      });
  });

  useEffect(() => {
    void syncChanges();
    const interval = setInterval(syncChanges, 10000);
    return () => {
      clearInterval(interval);
    };
  }, [syncChanges]);

  return null;
};

export default SyncManager;
