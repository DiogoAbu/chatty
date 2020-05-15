export default function parseRatio(str: string): number {
  const [p1, p2] = str.split(':');
  return parseInt(p1, 10) / parseInt(p2, 10);
}
