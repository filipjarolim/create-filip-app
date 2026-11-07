import { useColorScheme } from 'react-native';

import { peekScheme } from '@/lib/color-scheme';
import { useUiStore } from '@/store/ui-store';

export function useAppColorScheme(): 'light' | 'dark' {
  const preference = useUiStore((state) => state.colorScheme);
  const hydrated = useUiStore((state) => state.hasHydrated);
  const system = useColorScheme();
  if (!hydrated) return peekScheme();
  if (preference === 'light' || preference === 'dark') return preference;
  return system === 'dark' ? 'dark' : 'light';
}
