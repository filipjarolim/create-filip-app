const SAFE_PATH = /^\/(?:app(?:\/[A-Za-z0-9/_-]*)?|invite\/[A-Za-z0-9_-]{4,64}|login|register)?$/;

export function sanitizeDeepLink(url: string, scheme: string, host: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const appScheme = `${scheme}:`;
  const schemeLink = parsed.protocol === appScheme;
  const universalLink = parsed.protocol === 'https:' && parsed.hostname === host;
  if (!schemeLink && !universalLink) {
    return null;
  }
  if (/[<>"'`\\]/.test(parsed.pathname + parsed.search + parsed.hash)) {
    return null;
  }

  const path = schemeLink ? `/${parsed.hostname}${parsed.pathname === '/' ? '' : parsed.pathname}` : parsed.pathname;
  if (!SAFE_PATH.test(path)) {
    return null;
  }
  return url;
}

export function readInviteCode(url: string, scheme: string, host: string): string | null {
  const safe = sanitizeDeepLink(url, scheme, host);
  if (!safe) return null;
  return safe.match(/invite\/([A-Za-z0-9_-]{4,64})/)?.[1] ?? null;
}
