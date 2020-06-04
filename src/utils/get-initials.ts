export default function getInitials(name?: string | null): string {
  if (!name) {
    return '';
  }
  return name
    .split(' ')
    .slice(0, 2)
    .map((e: string) => e[0].toUpperCase())
    .join('');
}
