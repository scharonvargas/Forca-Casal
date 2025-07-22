import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GameState = 'playing' | 'won' | 'lost';

interface GameStats {
  wins: number;
  losses: number;
  totalGames: number;
  bestStreak: number;
  currentStreak: number;
}

interface HangmanState {
  currentWord: string;
  guessedLetters: Set<string>;
  wrongGuesses: number;
  maxWrongGuesses: number;
  gameState: GameState;
  stats: GameStats;
  timeLeft: number;
  timeEnabled: boolean;
  currentHint: string;
  hintsUsed: number;
  maxHints: number;
}

interface HangmanActions {
  newGame: (word: string, maxGuesses?: number) => void;
  guessLetter: (letter: string) => void;
  getDisplayWord: () => string;
  setTimeLeft: (time: number) => void;
  setTimeEnabled: (enabled: boolean) => void;
  setMaxWrongGuesses: (max: number) => void;
  useHint: () => void;
  setCurrentHint: (hint: string) => void;
}

export const useHangman = create<HangmanState & HangmanActions>()(
  persist(
    (set, get) => ({
      currentWord: "",
      guessedLetters: new Set(),
      wrongGuesses: 0,
      maxWrongGuesses: 6,
      gameState: 'playing',
      stats: {
        wins: 0,
        losses: 0,
        totalGames: 0,
        bestStreak: 0,
        currentStreak: 0
      },
      timeLeft: 0,
      timeEnabled: false,
      currentHint: '',
      hintsUsed: 0,
      maxHints: 3,

      newGame: (word: string, maxGuesses = get().maxWrongGuesses) => {
        set({
          currentWord: word.toUpperCase(),
          guessedLetters: new Set(),
          wrongGuesses: 0,
          maxWrongGuesses: maxGuesses,
          gameState: 'playing',
          currentHint: '',
          hintsUsed: 0,
        });
      },

      guessLetter: (letter: string) => {
        const state = get();
        const upperLetter = letter.toUpperCase();
        
        if (state.guessedLetters.has(upperLetter) || state.gameState !== 'playing') {
          return;
        }

        const newGuessedLetters = new Set(state.guessedLetters);
        newGuessedLetters.add(upperLetter);

        let newWrongGuesses = state.wrongGuesses;
        if (!state.currentWord.includes(upperLetter)) {
          newWrongGuesses++;
        }

        // Check win condition
        const wordLetters = new Set(state.currentWord.split(''));
        const isWon = Array.from(wordLetters).every(letter => 
          newGuessedLetters.has(letter)
        );

        // Check lose condition
        const isLost = newWrongGuesses >= state.maxWrongGuesses;

        let newGameState: GameState = 'playing';
        let newStats = state.stats;

        if (isWon) {
          const currentStreak = state.stats.currentStreak + 1;
          newGameState = 'won';
          newStats = {
            ...state.stats,
            wins: state.stats.wins + 1,
            totalGames: state.stats.totalGames + 1,
            currentStreak,
            bestStreak: Math.max(state.stats.bestStreak, currentStreak)
          };
        } else if (isLost) {
          newGameState = 'lost';
          newStats = {
            ...state.stats,
            losses: state.stats.losses + 1,
            totalGames: state.stats.totalGames + 1,
            currentStreak: 0
          };
        }

        set({
          guessedLetters: newGuessedLetters,
          wrongGuesses: newWrongGuesses,
          gameState: newGameState,
          stats: newStats
        });
      },

      getDisplayWord: () => {
        const state = get();
        return state.currentWord
          .split('')
          .map(letter => state.guessedLetters.has(letter) ? letter : '_')
          .join(' ');
      },

      setTimeLeft: (time: number) => {
        set({ timeLeft: time });
      },

      setTimeEnabled: (enabled: boolean) => {
        set({ timeEnabled: enabled });
      },

      setMaxWrongGuesses: (max: number) => {
        set({ maxWrongGuesses: max });
      },

      useHint: () => {
        const state = get();
        if (state.hintsUsed < state.maxHints && state.gameState === 'playing') {
          set({ hintsUsed: state.hintsUsed + 1 });
        }
      },

      setCurrentHint: (hint: string) => set({ currentHint: hint }),
    }),
    {
      name: 'hangman-game',
      partialize: (state) => ({ stats: state.stats })
    }
  )
);
