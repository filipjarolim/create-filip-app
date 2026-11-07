export function slugify(name: string): string;
export function rebrandContents(
  contents: string,
  from: Record<string, string>,
  to: Record<string, string>,
): string;
export function assertBundleId(value: string): void;
export function assertScheme(value: string): void;
export function assertUrl(value: string): void;
