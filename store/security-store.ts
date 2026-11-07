import { create } from 'zustand';

type SecurityState = {
  compromised: boolean;
  setCompromised: (value: boolean) => void;
};

export const useSecurityStore = create<SecurityState>((set) => ({
  compromised: false,
  setCompromised: (compromised) => set({ compromised }),
}));
