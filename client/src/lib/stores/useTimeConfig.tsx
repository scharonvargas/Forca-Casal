import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TimeConfig {
  enabled: boolean;
  initialTime: number; // em segundos
  bonusPerCorrect: number; // bonus por letra correta
  penaltyPerWrong: number; // penalidade por letra errada
  bonusPerWord: number; // bonus por palavra completa
}

interface TimeConfigState {
  config: TimeConfig;
  
  // Actions
  updateConfig: (config: Partial<TimeConfig>) => void;
  toggleTimeEnabled: () => void;
  resetToDefaults: () => void;
}

const DEFAULT_CONFIG: TimeConfig = {
  enabled: true,
  initialTime: 120, // 2 minutos
  bonusPerCorrect: 3, // 3 segundos por letra correta
  penaltyPerWrong: 5, // 5 segundos perdidos por letra errada
  bonusPerWord: 15, // 15 segundos bonus por palavra completa
};

export const useTimeConfig = create<TimeConfigState>()(
  persist(
    (set) => ({
      config: DEFAULT_CONFIG,

      updateConfig: (newConfig) => {
        set((state) => ({
          config: { ...state.config, ...newConfig }
        }));
      },

      toggleTimeEnabled: () => {
        set((state) => ({
          config: { ...state.config, enabled: !state.config.enabled }
        }));
      },

      resetToDefaults: () => {
        set({ config: DEFAULT_CONFIG });
      }
    }),
    {
      name: 'hangman-time-config'
    }
  )
);