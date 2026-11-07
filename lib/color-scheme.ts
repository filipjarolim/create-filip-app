import { Appearance, Platform, type ColorSchemeName } from 'react-native';

export type ColorSchemePreference = 'system' | 'light' | 'dark';

type Listener = (preferences: { colorScheme: ColorSchemeName }) => void;

type WebAppearance = {
  getColorScheme: () => ColorSchemeName;
  setColorScheme: (scheme: 'light' | 'dark' | 'unspecified' | null) => void;
  addChangeListener: (listener: Listener) => { remove: () => void };
};

let installed = false;
let override: 'light' | 'dark' | null = null;
const listeners = new Set<Listener>();

function systemScheme(): 'light' | 'dark' {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolved(): 'light' | 'dark' {
  return override ?? systemScheme();
}

export function peekScheme(): 'light' | 'dark' {
  return resolved();
}

function storedPreference(): ColorSchemePreference | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const scheme = process.env.EXPO_PUBLIC_APP_SCHEME ?? 'app';
    const raw = localStorage.getItem(`${scheme}-preferences`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { colorScheme?: ColorSchemePreference } };
    const value = parsed.state?.colorScheme;
    if (value === 'light' || value === 'dark' || value === 'system') return value;
  } catch {
    return null;
  }
  return null;
}

function syncWeb() {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', override === 'dark');
  root.classList.toggle('light', override === 'light');
  root.style.colorScheme = resolved();
  const scheme = resolved();
  listeners.forEach((listener) => listener({ colorScheme: scheme }));
}

/**
 * Browser Appearance only reads the OS media query and has no setColorScheme.
 * Install a small stand-in so useColorScheme() follows the in-app preference.
 * Call once, before the first render.
 */
export function installWebColorScheme() {
  if (installed || Platform.OS !== 'web' || typeof window === 'undefined') return;
  installed = true;
  const stored = storedPreference();
  if (stored === 'light' || stored === 'dark') override = stored;
  syncWeb();
  const appearance = Appearance as unknown as WebAppearance;
  appearance.getColorScheme = () => resolved();
  appearance.setColorScheme = (scheme) => {
    override = scheme === 'light' || scheme === 'dark' ? scheme : null;
    syncWeb();
  };
  appearance.addChangeListener = (listener) => {
    listeners.add(listener);
    return {
      remove: () => {
        listeners.delete(listener);
      },
    };
  };
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (override) return;
    syncWeb();
  });
}

export function applyColorScheme(preference: ColorSchemePreference) {
  const next = preference === 'system' ? 'unspecified' : preference;
  if (Platform.OS === 'web') {
    installWebColorScheme();
  }
  Appearance.setColorScheme(next);
}

installWebColorScheme();
