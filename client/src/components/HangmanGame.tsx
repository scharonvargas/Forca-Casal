import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import HangmanCanvas from "./HangmanCanvas";
import Keyboard from "./Keyboard";
import GameStats from "./GameStats";
import PunishmentModal from "./PunishmentModal";
import { useHangman } from "../lib/stores/useHangman";
import { useWords } from "../lib/stores/useWords";
import { usePunishments } from "../lib/stores/usePunishments";
import { RefreshCw, Trophy, Skull } from "lucide-react";

export default function HangmanGame() {
  const {
    currentWord,
    guessedLetters,
    wrongGuesses,
    gameState,
    guessLetter,
    newGame,
    getDisplayWord
  } = useHangman();
  
  const { getRandomWord } = useWords();

  // Start a new game when component mounts
  useEffect(() => {
    const word = getRandomWord();
    if (word) {
      newGame(word);
    }
  }, []);

  const handleLetterGuess = (letter: string) => {
    if (gameState === 'playing') {
      guessLetter(letter);
    }
  };

  const handleNewGame = () => {
    const word = getRandomWord();
    if (word) {
      newGame(word);
    }
  };

  const getGameMessage = () => {
    switch (gameState) {
      case 'won':
        return {
          message: "Parabéns! Você ganhou!",
          icon: <Trophy className="h-6 w-6 text-yellow-400" />,
          color: "text-green-400"
        };
      case 'lost':
        return {
          message: `Fim de Jogo! A palavra era: ${currentWord}`,
          icon: <Skull className="h-6 w-6 text-red-400" />,
          color: "text-red-400"
        };
      default:
        return null;
    }
  };

  const gameMessage = getGameMessage();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Game Stats */}
      <div className="lg:col-span-1">
        <GameStats />
      </div>

      {/* Main Game Area */}
      <div className="lg:col-span-2">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              {gameMessage ? (
                <div className={`flex items-center justify-center gap-2 ${gameMessage.color}`}>
                  {gameMessage.icon}
                  {gameMessage.message}
                </div>
              ) : (
                "Adivinhe a Palavra"
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Hangman Drawing */}
            <div className="flex justify-center">
              <HangmanCanvas wrongGuesses={wrongGuesses} />
            </div>

            {/* Current Word Display */}
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-white tracking-wider mb-4">
                {getDisplayWord()}
              </div>
              <div className="text-sm text-white/60">
                Erros: {wrongGuesses}/6
              </div>
            </div>

            {/* Keyboard */}
            <Keyboard
              onLetterClick={handleLetterGuess}
              guessedLetters={guessedLetters}
              currentWord={currentWord}
              disabled={gameState !== 'playing'}
            />

            {/* New Game Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleNewGame}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Novo Jogo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
