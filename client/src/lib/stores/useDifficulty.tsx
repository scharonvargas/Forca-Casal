import { create } from 'zustand';

export type Difficulty = 'easy' | 'normal' | 'hard';

interface DifficultyState {
  level: Difficulty;
  setLevel: (level: Difficulty) => void;
}

export const difficultyConfig = {
  easy: { maxHints: 5, maxWrongGuesses: 8, timeMultiplier: 1.2 },
  normal: { maxHints: 3, maxWrongGuesses: 6, timeMultiplier: 1 },
  hard: { maxHints: 2, maxWrongGuesses: 4, timeMultiplier: 0.8 }
} as const;

export const useDifficulty = create<DifficultyState>((set) => ({
  level: 'normal',
  setLevel: (level) => set({ level })
}));

export const getDifficultySettings = (level: Difficulty) => difficultyConfig[level];
