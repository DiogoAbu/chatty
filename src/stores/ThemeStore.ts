import { action, observable, runInAction } from 'mobx';

import BaseStore from './BaseStore';

export class ThemeStore extends BaseStore {
  @observable
  isDarkMode = false;

  protected databaseKey = 'ThemeStore';

  @action
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    void this.persist();
  }

  @action
  async hydrate(): Promise<void> {
    const data = await this.stores.generalStore.database.adapter.getLocal(this.databaseKey);
    if (!data) {
      return;
    }

    const { isDarkMode } = JSON.parse(data) as { isDarkMode: boolean };

    runInAction(() => {
      this.isDarkMode = isDarkMode;
    });
  }

  async persist(): Promise<void> {
    const serializableObj = {
      isDarkMode: this.isDarkMode,
    };
    await this.stores.generalStore.database.adapter.setLocal(
      this.databaseKey,
      JSON.stringify(serializableObj),
    );
  }

  async remove(): Promise<void> {
    await this.stores.generalStore.database.adapter.removeLocal(this.databaseKey);
  }
}
