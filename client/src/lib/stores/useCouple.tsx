import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameMode = 'single' | 'couple';
export type PlayerRole = 'challenger' | 'guesser';

interface PlayerInfo {
  name: string;
  score: number;
}

interface CoupleState {
  // Game mode
  gameMode: GameMode;
  
  // Players info
  player1: PlayerInfo;
  player2: PlayerInfo;
  currentPlayer: 1 | 2;
  currentRole: PlayerRole;
  
  // Game settings
  maxWrongGuesses: number;
  roundNumber: number;
  
  // Actions
  setGameMode: (mode: GameMode) => void;
  setPlayerNames: (player1Name: string, player2Name: string) => void;
  addScore: (player: 1 | 2) => void;
  switchTurn: () => void;
  resetGame: () => void;
  setMaxWrongGuesses: (max: number) => void;
  
  // Getters
  getCurrentPlayer: () => PlayerInfo;
  getOtherPlayer: () => PlayerInfo;
  getCurrentPlayerNumber: () => 1 | 2;
  getOtherPlayerNumber: () => 1 | 2;
  isCurrentPlayerChallenger: () => boolean;
  isCurrentPlayerGuesser: () => boolean;
}

export const useCouple = create<CoupleState>()(
  persist(
    (set, get) => ({
      // Initial state
      gameMode: 'single',
      player1: { name: '', score: 0 },
      player2: { name: '', score: 0 },
      currentPlayer: 1,
      currentRole: 'challenger',
      maxWrongGuesses: 6,
      roundNumber: 1,
      
      // Actions
      setGameMode: (mode) => set({ gameMode: mode }),
      
      setPlayerNames: (player1Name, player2Name) => set({
        player1: { ...get().player1, name: player1Name },
        player2: { ...get().player2, name: player2Name }
      }),
      
      addScore: (player) => set((state) => ({
        [player === 1 ? 'player1' : 'player2']: {
          ...state[player === 1 ? 'player1' : 'player2'],
          score: state[player === 1 ? 'player1' : 'player2'].score + 1
        }
      })),
      
      switchTurn: () => set((state) => {
        const newCurrentPlayer = state.currentPlayer === 1 ? 2 : 1;
        const newRole = state.currentRole === 'challenger' ? 'guesser' : 'challenger';
        
        return {
          currentPlayer: newCurrentPlayer,
          currentRole: newRole,
          roundNumber: state.roundNumber + 1
        };
      }),
      
      resetGame: () => set({
        player1: { name: get().player1.name, score: 0 },
        player2: { name: get().player2.name, score: 0 },
        currentPlayer: 1,
        currentRole: 'challenger',
        roundNumber: 1
      }),
      
      setMaxWrongGuesses: (max) => set({ maxWrongGuesses: max }),
      
      // Getters
      getCurrentPlayer: () => {
        const state = get();
        return state.currentPlayer === 1 ? state.player1 : state.player2;
      },
      
      getOtherPlayer: () => {
        const state = get();
        return state.currentPlayer === 1 ? state.player2 : state.player1;
      },
      
      getCurrentPlayerNumber: () => get().currentPlayer,
      
      getOtherPlayerNumber: () => {
        const state = get();
        return state.currentPlayer === 1 ? 2 : 1;
      },
      
      isCurrentPlayerChallenger: () => get().currentRole === 'challenger',
      
      isCurrentPlayerGuesser: () => get().currentRole === 'guesser'
    }),
    {
      name: 'couple-game',
      partialize: (state) => ({
        player1: state.player1,
        player2: state.player2,
        maxWrongGuesses: state.maxWrongGuesses,
        gameMode: state.gameMode,
        roundNumber: state.roundNumber
      })
    }
  )
);
