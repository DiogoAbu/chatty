import { action, observable, runInAction } from 'mobx';

import UserModel, { userUpdater } from '!/models/UserModel';
import { deriveKeyPair, derivesKeyWithPassword, generateSaltForKeyDerivation } from '!/services/encryption';
import { DeepPartial, Tables } from '!/types';

import BaseStore from './BaseStore';

export class AuthStore extends BaseStore {
  user: UserModel;

  @observable
  token = '';

  protected databaseKey = 'AuthStore';

  @action
  async signIn(user: DeepPartial<UserModel>, token: string, password: string): Promise<void> {
    const {
      syncStore,
      generalStore: { database },
    } = this.stores;

    // Using the password and a salt to derive a key that will be used to derive the pair of keys
    const derivedSalt = user.derivedSalt || (await generateSaltForKeyDerivation());

    const pass = password + user.id!;
    const derivedKey = await derivesKeyWithPassword(pass, derivedSalt);

    const { secretKey, publicKey } = await deriveKeyPair(derivedKey);

    const userData: DeepPartial<UserModel> = {
      ...user,
      secretKey,
      publicKey,
      derivedSalt,
      _raw: { _changed: 'publicKey,derivedSalt', _status: 'updated' },
    };

    const userCreated = await database.action<UserModel>(async () => {
      await database.unsafeResetDatabase();
      return database.collections.get<UserModel>(Tables.users).create(userUpdater(userData));
    });

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
    try {
      const data = await this.stores.generalStore.database.adapter.getLocal(this.databaseKey);
      if (!data) {
        return '';
      }

      const { token } = JSON.parse(data) as { userId: string; token: string };
      return token;
    } catch {
      return '';
    }
  };
}
