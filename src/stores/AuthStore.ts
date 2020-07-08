import { action, observable, runInAction } from 'mobx';

import UserModel, { upsertUser } from '!/models/UserModel';
import { DeepPartial, Tables } from '!/types';

import BaseStore from './BaseStore';

export class AuthStore extends BaseStore {
  user: UserModel;

  @observable
  token = '';

  protected databaseKey = 'AuthStore';

  @action
  async signIn(user: DeepPartial<UserModel>, token: string): Promise<void> {
    const {
      syncStore,
      generalStore: { database },
    } = this.stores;

    const userCreated = await upsertUser(database, user);

    runInAction(() => {
      this.user = userCreated;
      this.token = token;
      void this.persist();
      void syncStore.sync();
    });
  }

  @action
  async signOut(): Promise<void> {
    await this.remove();
  }

  @action
  async hydrate(): Promise<void> {
    const { database } = this.stores.generalStore;

    const data = await database.adapter.getLocal(this.databaseKey);
    if (!data) {
      return;
    }

    try {
      const { userId, token } = JSON.parse(data) as { userId: string; token: string };
      const user = await database.collections.get<UserModel>(Tables.users).find(userId);

      runInAction(() => {
        this.user = user;
        this.token = token;
      });
    } catch (err) {
      //
    }
  }

  async persist(): Promise<void> {
    const serializableObj = {
      userId: this.user?.id,
      token: this.token,
    };
    await this.stores.generalStore.database.adapter.setLocal(
      this.databaseKey,
      JSON.stringify(serializableObj),
    );
  }

  @action
  async remove(): Promise<void> {
    runInAction(() => {
      this.user = (undefined as unknown) as UserModel;
      this.token = '';
    });
    await this.stores.generalStore.database.adapter.removeLocal(this.databaseKey);
  }

  // Get token directly from the database local storage.
  forceGetToken = async (): Promise<string> => {
    const data = await this.stores.generalStore.database.adapter.getLocal(this.databaseKey);
    if (!data) {
      return '';
    }

    const { token } = JSON.parse(data) as { userId: string; token: string };
    return token;
  };
}
