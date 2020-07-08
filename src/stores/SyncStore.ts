import { action, observable, runInAction } from 'mobx';

import debug from '!/services/debug';
import sync from '!/services/sync';

import BaseStore from './BaseStore';

const log = debug.extend('sync-store');

export class SyncStore extends BaseStore {
  @observable
  syncing = false;

  @action
  async sync(): Promise<void> {
    const {
      authStore: { user },
      generalStore: { database, client },
    } = this.stores;

    if (!user?.id) {
      return;
    }

    if (this.syncing) {
      log('Syncing skipped, already in progress');
      return;
    }

    log('Syncing started');
    runInAction(() => {
      this.syncing = true;
    });

    try {
      await sync(user.id, database, client);
    } catch (err) {
      console.log(err);
    }

    log('Syncing finished');
    runInAction(() => {
      this.syncing = false;
    });
  }
}
