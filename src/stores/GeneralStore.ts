import { ViewStyle } from 'react-native';

import { action, observable } from 'mobx';

import createDatabase from '!/services/database';

import BaseStore from './BaseStore';

export class GeneralStore extends BaseStore {
  database = createDatabase();

  @observable
  fabIcon?: string = '';

  @observable
  handleFabPress?: () => void = () => null;

  @observable
  fabStyle?: ViewStyle = {};

  @action
  setFab(fabIcon?: string, handleFabPress?: () => void, fabStyle?: ViewStyle) {
    this.fabIcon = fabIcon;
    this.handleFabPress = handleFabPress;
    this.fabStyle = fabStyle;
  }
}
