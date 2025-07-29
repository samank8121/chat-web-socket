import { create } from 'zustand';
import { persist } from 'zustand/middleware'

type User = { token: string; email: string } | null;
type UserStore = {
  user: User;
  setUser: (user: User) => void;
  reset: () => void;
  hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      // Initialize user as null
      user: null,
      setUser: (user) => set({ user }),
      reset: () => set({ user: null }),
      hasHydrated: false,
      setHasHydrated: (hydrated) => set({ hasHydrated: hydrated }),
    }),
    {
      name: 'user-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export const getUser = () => useUserStore.getState().user;
export const setUser = (user: User) => useUserStore.setState({ user });
export const resetUser = () => useUserStore.setState({ user: null });