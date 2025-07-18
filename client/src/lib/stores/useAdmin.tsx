import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminState {
  isAuthenticated: boolean;
  
  // Actions
  login: (password: string) => boolean;
  logout: () => void;
}

const getAdminPassword = () =>
  import.meta.env.VITE_ADMIN_PASSWORD ?? "";

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      isAuthenticated: false,

      login: (password: string) => {
        if (password === getAdminPassword()) {
          set({ isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => {
        set({ isAuthenticated: false });
      }
    }),
    {
      name: 'hangman-admin'
    }
  )
);
