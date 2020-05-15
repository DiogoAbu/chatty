import { Stores } from './Stores';

export default abstract class BaseStore {
  protected stores: Stores;

  constructor(stores: Stores) {
    this.stores = stores;
  }
}
