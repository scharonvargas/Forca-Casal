import { create } from "zustand";
import { persist } from "zustand/middleware";

export type GameState = 'playing' | 'won' | 'lost';

interface GameStats {
  wins: number;
  losses: number;
  totalGames: number;
}

interface HangmanState {
  currentWord: string;
  guessedLetters: Set<string>;
  wrongGuesses: number;
  gameState: GameState;
  stats: GameStats;
  
  // Actions
  newGame: (word: string) => void;
  guessLetter: (letter: string) => void;
  getDisplayWord: () => string;
}

export const useHangman = create<HangmanState>()(
  persist(
    (set, get) => ({
      currentWord: "",
      guessedLetters: new Set(),
      wrongGuesses: 0,
      gameState: 'playing',
      stats: {
        wins: 0,
        losses: 0,
        totalGames: 0
      },

      newGame: (word: string) => {
        set({
          currentWord: word.toUpperCase(),
          guessedLetters: new Set(),
          wrongGuesses: 0,
          gameState: 'playing'
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
        const isLost = newWrongGuesses >= 6;

        let newGameState: GameState = 'playing';
        let newStats = state.stats;

        if (isWon) {
          newGameState = 'won';
          newStats = {
            ...state.stats,
            wins: state.stats.wins + 1,
            totalGames: state.stats.totalGames + 1
          };
        } else if (isLost) {
          newGameState = 'lost';
          newStats = {
            ...state.stats,
            losses: state.stats.losses + 1,
            totalGames: state.stats.totalGames + 1
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
      }
    }),
    {
      name: 'hangman-game',
      partialize: (state) => ({ stats: state.stats })
    }
  )
);
