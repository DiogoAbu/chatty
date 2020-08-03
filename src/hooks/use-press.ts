import debounce from 'lodash.debounce';

import useMethod from './use-method';

type Callback<Args extends any[], Result> = (...args: Args) => Result;

export interface DebounceSettings {
  leading?: boolean;
  maxWait?: number;
  trailing?: boolean;
}

export default function usePress<Args extends any[], Result>(
  callback: Callback<Args, Result>,
  wait = 300,
  settings: DebounceSettings = {},
): (...args: Args) => Result {
  return useMethod(debounce(callback, wait, { leading: true, trailing: false, ...settings }));
}
