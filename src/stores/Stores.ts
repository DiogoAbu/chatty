import { action, configure, observable, runInAction } from 'mobx';

import { AuthStore } from './AuthStore';
import { GeneralStore } from './GeneralStore';
import { SyncStore } from './SyncStore';
import { ThemeStore } from './ThemeStore';

configure({
  computedRequiresReaction: true,
  enforceActions: 'observed',
  observableRequiresReaction: true,
  reactionRequiresObservable: true,
});

export class Stores {
  // Every store references
  authStore: AuthStore;
  themeStore: ThemeStore;
  syncStore: SyncStore;
  generalStore: GeneralStore;

  @observable
  hydrationComplete = false;

  constructor() {
    this.authStore = new AuthStore(this);
    this.themeStore = new ThemeStore(this);
    this.syncStore = new SyncStore(this);
    this.generalStore = new GeneralStore(this);

    void this.hydrate();
  }

  @action
  async hydrate(): Promise<void> {
    await this.authStore.hydrate();
    await this.themeStore.hydrate();
    void this.syncStore.sync();

    runInAction(() => {
      this.hydrationComplete = true;
    });
  }
}
