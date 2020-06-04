import { DependencyList, useCallback, useEffect } from 'react';
import { BackHandler } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

export default function useBackHandler(
  backAction: () => boolean | null | undefined,
  deps: DependencyList,
): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const action = useCallback(backAction, deps);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', action);
    return () => backHandler.remove();
  }, [action]);
}

export function useBackHandlerOnFocus(
  backAction: () => boolean | null | undefined,
  deps: DependencyList,
): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const action = useCallback(backAction, deps);
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', action);
      return () => backHandler.remove();
    }, [action]),
  );
}
