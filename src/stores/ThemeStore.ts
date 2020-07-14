import { Appearance } from 'react-native';

import { action, observable, runInAction } from 'mobx';

import { ColorSchemeCurrent, ColorSchemePreferred } from '!/types';

import BaseStore from './BaseStore';

export class ThemeStore extends BaseStore {
  @observable
  colorSchemePreferred: ColorSchemePreferred = 'auto';

  @observable
  colorSchemeCurrent: ColorSchemeCurrent = Appearance.getColorScheme() ?? 'dark';

  protected databaseKey = 'ThemeStore';

  @action
  setColorSchemePreferred(colorScheme: ColorSchemePreferred): void {
    this.colorSchemePreferred = colorScheme;

    if (this.colorSchemePreferred !== 'auto') {
      this.colorSchemeCurrent = this.colorSchemePreferred;
    } else {
      this.colorSchemeCurrent = Appearance.getColorScheme() ?? 'dark';
    }

    void this.persist();
  }

  @action
  setColorSchemeCurrent(colorScheme?: ColorSchemeCurrent): void {
    if (this.colorSchemePreferred === 'auto' && colorScheme) {
      this.colorSchemeCurrent = colorScheme;
    }
    void this.persist();
  }

  @action
  async hydrate(): Promise<void> {
    const data = await this.stores.generalStore.database.adapter.getLocal(this.databaseKey);
    if (!data) {
      return;
    }

    const {
      colorSchemePreferred,
      colorSchemeCurrent,
    }: {
      colorSchemePreferred: ColorSchemePreferred;
      colorSchemeCurrent: ColorSchemeCurrent;
    } = JSON.parse(data);

    runInAction(() => {
      this.colorSchemePreferred = colorSchemePreferred;
      this.colorSchemeCurrent = colorSchemeCurrent;
    });
  }

  async persist(): Promise<void> {
    const serializableObj = {
      colorSchemePreferred: this.colorSchemePreferred,
      colorSchemeCurrent: this.colorSchemeCurrent,
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
