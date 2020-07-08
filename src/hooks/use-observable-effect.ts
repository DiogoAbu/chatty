import { DependencyList, useEffect } from 'react';

import { Observable } from 'rxjs';

export function useObservableEffect<T>(
  observable: Observable<T> | undefined,
  effect: (data: T) => void,
  deps?: DependencyList,
): void {
  useEffect(() => {
    const subscription = observable?.subscribe(effect);
    return () => subscription?.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
