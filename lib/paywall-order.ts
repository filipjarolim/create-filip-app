const ANNUAL_FIRST = ['ANNUAL', 'MONTHLY', 'WEEKLY', 'SIX_MONTH', 'LIFETIME', 'CUSTOM', 'UNKNOWN'];
const CONTROL = ['WEEKLY', 'MONTHLY', 'ANNUAL', 'SIX_MONTH', 'LIFETIME', 'CUSTOM', 'UNKNOWN'];

export type PaywallVariant = 'control' | 'annual-first';

export function orderPackages<T extends { packageType: string }>(packages: T[], variant: PaywallVariant): T[] {
  const rank = variant === 'control' ? CONTROL : ANNUAL_FIRST;
  return [...packages].sort((left, right) => {
    const leftRank = rank.indexOf(left.packageType);
    const rightRank = rank.indexOf(right.packageType);
    return (leftRank === -1 ? rank.length : leftRank) - (rightRank === -1 ? rank.length : rightRank);
  });
}
