import { createRef } from 'react';

import { NavigationContainerRef } from '@react-navigation/native';

export const isReadyRef = createRef<boolean>();
export const navigationRef = createRef<NavigationContainerRef>();

export function rootNavigate(name: string, params?: any): void {
  if (isReadyRef.current && navigationRef.current) {
    navigationRef.current.navigate(name, params);
  }
}
