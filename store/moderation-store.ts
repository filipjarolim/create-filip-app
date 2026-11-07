import { create } from 'zustand';

type ModerationState = {
  blockedIds: string[];
  block: (userId: string) => void;
  isBlocked: (userId: string) => boolean;
  reset: () => void;
};

export const useModerationStore = create<ModerationState>((set, get) => ({
  blockedIds: [],
  block: (userId) => set((state) => ({ blockedIds: [...new Set([...state.blockedIds, userId])] })),
  isBlocked: (userId) => get().blockedIds.includes(userId),
  reset: () => set({ blockedIds: [] }),
}));
