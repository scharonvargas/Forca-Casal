interface HangmanState {
  // ... existing properties
  currentHint: string;
  hintsUsed: number;
  maxHints: number;
}

interface HangmanActions {
  // ... existing methods
  useHint: () => void;
  setCurrentHint: (hint: string) => void;
}

export const useHangmanStore = create<HangmanState & HangmanActions>()(
  persist(
    (set, get) => ({
      // ... existing state
      currentHint: '',
      hintsUsed: 0,
      maxHints: 3,

      // ... existing methods
      useHint: () => {
        const state = get();
        if (state.hintsUsed < state.maxHints && state.gameState === 'playing') {
          set({ hintsUsed: state.hintsUsed + 1 });
        }
      },

      setCurrentHint: (hint: string) => set({ currentHint: hint }),

      newGame: (word?: string) => {
        // ... existing newGame logic
        set({
          // ... existing resets
          currentHint: '',
          hintsUsed: 0,
        });
      },
    }),
    // ... persist config
  )
);