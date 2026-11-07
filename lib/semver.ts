export function compareSemver(left: string, right: string): number {
  const a = left.split('.').map((part) => Number(part) || 0);
  const b = right.split('.').map((part) => Number(part) || 0);
  for (let index = 0; index < 3; index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

export function updateRequired(current: string | null, minimum: string): boolean {
  if (!current || !/^\d+\.\d+\.\d+/.test(current) || !/^\d+\.\d+\.\d+/.test(minimum)) {
    return false;
  }
  return compareSemver(current, minimum) < 0;
}
