import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AdminState {
  isAuthenticated: boolean;
  
  // Actions
  login: (password: string) => boolean;
  logout: () => void;
}

const ADMIN_PASSWORD = "admin123"; // In a real app, this would be handled securely

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      isAuthenticated: false,

      login: (password: string) => {
        if (password === ADMIN_PASSWORD) {
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
