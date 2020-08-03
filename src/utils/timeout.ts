export default async function timeout(ms = 3000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
