import { action, configure, observable, runInAction } from 'mobx';

import { AuthStore } from './AuthStore';
import { GeneralStore } from './GeneralStore';
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
  generalStore: GeneralStore;

  @observable
  hydrationComplete = false;

  constructor() {
    this.authStore = new AuthStore(this);
    this.themeStore = new ThemeStore(this);
    this.generalStore = new GeneralStore(this);

    this.hydrate();
  }

  @action
  async hydrate() {
    await this.authStore.hydrate();
    await this.themeStore.hydrate();

    runInAction(() => {
      this.hydrationComplete = true;
    });
  }
}
