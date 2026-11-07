export function referralCode(userId: string): string {
  const compact = userId.replace(/[^A-Za-z0-9]/g, '');
  return compact.slice(0, 10).padEnd(4, '0');
}

export function referralLink(scheme: string, userId: string): string {
  return `${scheme}://invite/${referralCode(userId)}`;
}
