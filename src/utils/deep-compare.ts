import { useRef } from 'react';

function getValue(data: any): any {
  if (typeof data?.getTime === 'function') {
    return data.getTime();
  }
  return data;
}

function deepCompareEquals<T extends Record<string, any>>(
  prev: T[] | null,
  next: T[] | null,
  props: string[],
): boolean {
  if (!prev && !next) {
    return true;
  }
  if (prev && !next) {
    return false;
  }
  if (!prev && next) {
    return false;
  }
  if (!prev || !next) {
    return false;
  }
  if (prev.length !== next.length) {
    return false;
  }
  return props.some((p) => {
    return prev.some((value, index) => {
      return getValue(value[p]) !== getValue(next[index][p]);
    });
  });
}

export default function deepCompare<T>(array: T[] | null, props: string[]): T[] | null {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const prev = useRef<T[] | null>(null);

  if (!deepCompareEquals<T>(prev.current, array, props)) {
    prev.current = array;
  }

  return prev.current;
}
