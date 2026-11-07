const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 31_557_600],
  ['month', 2_629_800],
  ['week', 604_800],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
  ['second', 1],
];

export function formatCurrency(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
}

export function formatRelativeTime(date: Date, locale: string, now = new Date()): string {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const absolute = Math.abs(seconds);
  const match = UNITS.find(([, size]) => absolute >= size) ?? UNITS[UNITS.length - 1];
  if (!match) return formatter.format(0, 'second');
  const [unit, size] = match;
  return formatter.format(Math.round(seconds / size), unit);
}
