// omit method using my inKeys method and Object.keys
export default function omitKeys<T>(obj: Record<any, unknown>, keysToOmit: any[]): T {
  const newObj: Record<any, unknown> = {};
  Object.keys(obj).forEach((key) => {
    if (!keysToOmit.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj as T;
}
