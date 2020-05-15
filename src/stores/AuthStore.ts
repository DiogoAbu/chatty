import { action, observable, runInAction } from 'mobx';

import UserModel, { upsertUser } from '!/models/UserModel';
import { DeepPartial, Tables } from '!/types';

import BaseStore from './BaseStore';

export class AuthStore extends BaseStore {
  user: UserModel;

  @observable
  token = '';

  protected DB_KEY = 'AuthStore';

  @action
  async signIn(user: DeepPartial<UserModel>, token: string) {
    const { database } = this.stores.generalStore;

    const userCreated = await upsertUser(database, user);

    runInAction(() => {
      this.user = userCreated;
      this.token = token;
      this.persist();
    });
  }

  @action
  async signOut() {
    await this.remove();
  }

  @action
  async hydrate() {
    const { database } = this.stores.generalStore;

    const data = await database.adapter.getLocal(this.DB_KEY);
    if (!data) {
      return;
    }

    const { userId, token } = JSON.parse(data);
    const user = await database.collections.get<UserModel>(Tables.users).find(userId);

    runInAction(() => {
      this.user = user;
      this.token = token;
    });
  }

  async persist() {
    const serializableObj = {
      userId: this.user?.id,
      token: this.token,
    };
    await this.stores.generalStore.database.adapter.setLocal(
      this.DB_KEY,
      JSON.stringify(serializableObj),
    );
  }

  @action
  async remove() {
    runInAction(() => {
      this.user = undefined as any;
      this.token = '';
    });
    await this.stores.generalStore.database.adapter.removeLocal(this.DB_KEY);
  }

  // Get token directly from the database local storage.
  async forceGetToken() {
    const data = await this.stores.generalStore.database.adapter.getLocal(this.DB_KEY);
    if (!data) {
      return '';
    }

    const { token } = JSON.parse(data);
    return token;
  }
}
