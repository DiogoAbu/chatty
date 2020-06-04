import { createContext, useContext } from 'react';

import { Stores } from './Stores';

export const StoresContext = createContext<Stores | null>(null);
export const StoresProvider = StoresContext.Provider;

export const useStores = (): Stores => {
  const stores = useContext(StoresContext);

  if (!stores) {
    throw new Error('You have forgot to use StoresProvider.. oops');
  }
  return stores;
};
