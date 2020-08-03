export default function createEmptyRows<T>(arr: T[], columns: number): (T | null)[] {
  const data: (T | null)[] = [...arr];

  const rowCount = Math.floor(data.length / columns);
  let lastRowNum = data.length - rowCount * columns;

  while (lastRowNum !== columns) {
    data.push(null);
    lastRowNum += 1;
  }

  return data;
}
