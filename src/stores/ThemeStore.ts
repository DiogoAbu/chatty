import { action, observable, runInAction } from 'mobx';

import BaseStore from './BaseStore';

export class ThemeStore extends BaseStore {
  @observable
  isDarkMode = false;

  protected DB_KEY = 'ThemeStore';

  @action
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this.persist();
  }

  @action
  async hydrate() {
    const data = await this.stores.generalStore.database.adapter.getLocal(this.DB_KEY);
    if (!data) {
      return;
    }

    const { isDarkMode } = JSON.parse(data);

    runInAction(() => {
      this.isDarkMode = isDarkMode;
    });
  }

  async persist() {
    const serializableObj = {
      isDarkMode: this.isDarkMode,
    };
    await this.stores.generalStore.database.adapter.setLocal(
      this.DB_KEY,
      JSON.stringify(serializableObj),
    );
  }

  async remove() {
    await this.stores.generalStore.database.adapter.removeLocal(this.DB_KEY);
  }
}
