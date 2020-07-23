import { action, runInAction } from 'mobx';

import {
  UnregisterDevicesDocument,
  UnregisterDevicesMutation,
  UnregisterDevicesMutationVariables,
} from '!/generated/graphql';

import BaseStore from './BaseStore';

export class DeviceTokenStore extends BaseStore {
  deviceTokens: string[] = [];

  protected databaseKey = 'DeviceTokenStore';

  @action
  addDeviceToken(deviceToken: string): void {
    if (!this.deviceTokens.includes(deviceToken)) {
      this.deviceTokens.push(deviceToken);
      void this.persist();
    }
  }

  @action
  async unregister(): Promise<void> {
    const client = this.stores.generalStore.client;

    // Get devices tokens excluding current signed user one
    const tokens = [...this.deviceTokens].filter((token) => token !== this.stores.authStore.deviceToken);

    if (!tokens?.length) {
      return;
    }

    const res = await client
      .mutation<UnregisterDevicesMutation, UnregisterDevicesMutationVariables>(
        UnregisterDevicesDocument,
        { data: { tokens } },
        { requestPolicy: 'network-only' },
      )
      .toPromise();

    if (!res.error) {
      // Remove tokens that where unregistered
      this.deviceTokens = this.deviceTokens.filter((token) => !tokens.includes(token));
    }
  }

  @action
  async hydrate(): Promise<void> {
    const data = await this.stores.generalStore.database.adapter.getLocal(this.databaseKey);
    if (!data) {
      return;
    }

    const { deviceTokens }: { deviceTokens: string[] } = JSON.parse(data);

    runInAction(() => {
      this.deviceTokens = deviceTokens;

      // void this.unregister();
    });
  }

  async persist(): Promise<void> {
    const serializableObj = {
      deviceTokens: this.deviceTokens,
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
