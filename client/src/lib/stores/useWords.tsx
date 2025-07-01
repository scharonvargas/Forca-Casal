import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getDefaultWords } from "../wordDatabase";

interface WordsState {
  words: string[];
  
  // Actions
  addWord: (word: string) => void;
  removeWord: (word: string) => void;
  getRandomWord: () => string | null;
  resetToDefaults: () => void;
}

export const useWords = create<WordsState>()(
  persist(
    (set, get) => ({
      words: getDefaultWords(),

      addWord: (word: string) => {
        const normalizedWord = word.toUpperCase().trim();
        if (normalizedWord && !get().words.includes(normalizedWord)) {
          set(state => ({
            words: [...state.words, normalizedWord]
          }));
        }
      },

      removeWord: (word: string) => {
        set(state => ({
          words: state.words.filter(w => w !== word)
        }));
      },

      getRandomWord: () => {
        const words = get().words;
        if (words.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * words.length);
        return words[randomIndex];
      },

      resetToDefaults: () => {
        set({ words: getDefaultWords() });
      }
    }),
    {
      name: 'hangman-words'
    }
  )
);
