export function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const next = [...items];
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= next.length) return items;
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}
