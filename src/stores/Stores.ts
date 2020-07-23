import { action, configure, observable, runInAction } from 'mobx';

import { AuthStore } from './AuthStore';
import { DeviceTokenStore } from './DeviceTokenStore';
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
  deviceTokenStore: DeviceTokenStore;
  generalStore: GeneralStore;

  @observable
  hydrationComplete = false;

  onHydrationComplete: () => Promise<void>;

  constructor(callback?: (stores: Stores) => void) {
    this.authStore = new AuthStore(this);
    this.themeStore = new ThemeStore(this);
    this.syncStore = new SyncStore(this);
    this.deviceTokenStore = new DeviceTokenStore(this);
    this.generalStore = new GeneralStore(this);

    void this.hydrate().finally(() => callback?.(this));
  }

  @action
  async hydrate(): Promise<void> {
    await this.authStore.hydrate();
    await this.themeStore.hydrate();
    await this.deviceTokenStore.hydrate();
    void this.syncStore.sync();

    runInAction(() => {
      this.hydrationComplete = true;
    });

    void this.onHydrationComplete?.();
  }
}
