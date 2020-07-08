import { ViewStyle } from 'react-native';

import { action, observable } from 'mobx';

import createClient from '!/services/client-graphql';
import createDatabase from '!/services/database';

import BaseStore from './BaseStore';

export class GeneralStore extends BaseStore {
  database = createDatabase();

  client = createClient(this.stores.authStore.forceGetToken);

  @observable
  fabIcon?: string = '';

  @observable
  handleFabPress?: () => void = () => null;

  @observable
  fabStyle?: ViewStyle = {};

  @action
  setFab(fabIcon?: string, handleFabPress?: () => void, fabStyle?: ViewStyle): void {
    this.fabIcon = fabIcon;
    this.handleFabPress = handleFabPress;
    this.fabStyle = fabStyle;
  }
}
