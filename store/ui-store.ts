import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ColorSchemePreference = 'system' | 'light' | 'dark';
export type LanguagePreference = 'system' | 'en' | 'cs' | 'es';

type Preferences = {
  hapticsEnabled: boolean;
  colorScheme: ColorSchemePreference;
  language: LanguagePreference;
  privacyShield: boolean;
  biometricLock: boolean;
  positiveActions: number;
  referralCode: string | null;
  showcaseOrder: string[];
};

const initialPreferences: Preferences = {
  hapticsEnabled: true,
  colorScheme: 'system',
  language: 'system',
  privacyShield: true,
  biometricLock: false,
  positiveActions: 0,
  referralCode: null,
  showcaseOrder: ['map', 'photo', 'weather', 'currency', 'media'],
};

type UiState = Preferences & {
  hasHydrated: boolean;
  setHapticsEnabled: (value: boolean) => void;
  setColorScheme: (value: ColorSchemePreference) => void;
  setLanguage: (value: LanguagePreference) => void;
  setPrivacyShield: (value: boolean) => void;
  setBiometricLock: (value: boolean) => void;
  setReferralCode: (value: string) => void;
  setShowcaseOrder: (value: string[]) => void;
  recordPositiveAction: () => number;
  setHasHydrated: (value: boolean) => void;
  reset: () => void;
};

export const UI_STORAGE_KEY = `${process.env.EXPO_PUBLIC_APP_SCHEME ?? 'app'}-preferences`;

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      ...initialPreferences,
      hasHydrated: false,
      setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
      setColorScheme: (colorScheme) => set({ colorScheme }),
      setLanguage: (language) => set({ language }),
      setPrivacyShield: (privacyShield) => set({ privacyShield }),
      setBiometricLock: (biometricLock) => set({ biometricLock }),
      setReferralCode: (referralCode) => set({ referralCode }),
      setShowcaseOrder: (showcaseOrder) => set({ showcaseOrder }),
      recordPositiveAction: () => {
        const positiveActions = get().positiveActions + 1;
        set({ positiveActions });
        return positiveActions;
      },
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      reset: () => set(initialPreferences),
    }),
    {
      name: UI_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hapticsEnabled: state.hapticsEnabled,
        colorScheme: state.colorScheme,
        language: state.language,
        privacyShield: state.privacyShield,
        biometricLock: state.biometricLock,
        positiveActions: state.positiveActions,
        referralCode: state.referralCode,
        showcaseOrder: state.showcaseOrder,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
