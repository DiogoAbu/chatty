export function getCircularReplacer(): (key: any, value: any) => any {
  const seen = new WeakSet();
  return (_: any, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    // eslint-disable-next-line consistent-return
    return value;
  };
}

function isEmpty(value: any): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isEmpty);
  } else if (typeof value === 'object') {
    return Object.values(value).every(isEmpty);
  }

  return false;
}

export function removeEmptys(_key: any, value: any): any {
  return isEmpty(value) ? undefined : value;
}
