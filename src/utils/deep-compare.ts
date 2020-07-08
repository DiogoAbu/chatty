import { useRef } from 'react';

function getValue(data: any): any {
  if (typeof data?.getTime === 'function') {
    return data.getTime();
  }
  return data;
}

function deepCompareEquals<T extends Record<string, any>>(
  prev: T[] | undefined,
  next: T[] | undefined,
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

export default function deepCompare<T>(next: T[] | undefined, props: string[]): T[] | undefined {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const prev = useRef<T[]>();

  if (!deepCompareEquals<T>(prev.current, next, props)) {
    prev.current = next;
  }

  return prev.current;
}
