import { DependencyList, EffectCallback, useCallback } from 'react';

import { useFocusEffect as useFocusEffectRaw } from '@react-navigation/native';

export default function useFocusEffect(effect: EffectCallback, deps: DependencyList): void {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useFocusEffectRaw(useCallback(effect, deps));
}
