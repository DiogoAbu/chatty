import { useRef } from 'react';

function deepCompareEquals<T extends Record<string, any>>(
  a: T[] | undefined,
  b: T[] | undefined,
  prop: string,
): boolean {
  if (!a && !b) {
    return true;
  }
  if (a && !b) {
    return false;
  }
  if (!a && b) {
    return false;
  }
  if (!a || !b) {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  return a.some((value, index) => {
    return value[prop] !== b[index][prop];
  });
}

export default function deepCompare<T>(value: T[] | undefined, prop: string): T[] | undefined {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const ref = useRef<T[]>();

  if (!deepCompareEquals<T>(value, ref.current, prop)) {
    ref.current = value;
  }

  return ref.current;
}
