import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import HangmanCanvas from "./HangmanCanvas";
import Keyboard from "./Keyboard";
import GameStats from "./GameStats";
import PunishmentModal from "./PunishmentModal";
import CoupleGameInterface from "./CoupleGameInterface";
import { useHangman } from "../lib/stores/useHangman";
import { useWords } from "../lib/stores/useWords";
import { useCouple } from "../lib/stores/useCouple";
import { usePunishments, Punishment } from "../lib/stores/usePunishments";
import { RefreshCw, Trophy, Skull } from "lucide-react";

export default function HangmanGame() {
  const { gameMode } = useCouple();
  
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
  const { getRandomPunishment } = usePunishments();
  const [showPunishment, setShowPunishment] = useState(false);
  const [currentPunishment, setCurrentPunishment] = useState<Punishment | null>(null);

  // If couple mode is selected, use the couple interface
  if (gameMode === 'couple') {
    return <CoupleGameInterface />;
  }

  // Start a new game when component mounts
  useEffect(() => {
    const word = getRandomWord();
    if (word) {
      newGame(word);
    }
  }, []);

  // Check for game end and show punishment for losses
  useEffect(() => {
    if (gameState === 'lost') {
      const punishment = getRandomPunishment();
      if (punishment) {
        setCurrentPunishment(punishment);
        setShowPunishment(true);
      }
    }
  }, [gameState]);

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
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Game Stats - Hidden on mobile when playing */}
        <div className={`lg:col-span-1 ${gameState === 'playing' ? 'hidden lg:block' : ''}`}>
          <GameStats />
        </div>

        {/* Main Game Area */}
        <div className={`${gameState === 'playing' ? 'col-span-1' : 'lg:col-span-2'}`}>
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader className="text-center p-4 lg:p-6">
              <CardTitle className="text-xl lg:text-2xl text-white">
                {gameMessage ? (
                  <div className={`flex items-center justify-center gap-2 ${gameMessage.color} flex-wrap`}>
                    {gameMessage.icon}
                    <span className="text-center">{gameMessage.message}</span>
                  </div>
                ) : (
                  "Adivinhe a Palavra"
                )}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 lg:space-y-6 p-4 lg:p-6">
              {/* Hangman Drawing */}
              <div className="flex justify-center">
                <div className="w-full max-w-xs lg:max-w-sm">
                  <HangmanCanvas wrongGuesses={wrongGuesses} />
                </div>
              </div>

              {/* Current Word Display */}
              <div className="text-center">
                <div className="text-2xl lg:text-4xl font-mono font-bold text-white tracking-wider mb-2 lg:mb-4 break-all">
                  {getDisplayWord()}
                </div>
                <div className="text-sm text-white/60">
                  Erros: {wrongGuesses}/6
                </div>
              </div>

              {/* Keyboard */}
              <div className="w-full">
                <Keyboard
                  onLetterClick={handleLetterGuess}
                  guessedLetters={guessedLetters}
                  currentWord={currentWord}
                  disabled={gameState !== 'playing'}
                />
              </div>

              {/* New Game Button */}
              <div className="flex justify-center pt-2 lg:pt-4">
                <Button
                  onClick={handleNewGame}
                  className="bg-purple-600 hover:bg-purple-700 text-white w-full lg:w-auto"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Novo Jogo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Stats on mobile - shown after game ends */}
        {gameState !== 'playing' && (
          <div className="lg:hidden">
            <GameStats />
          </div>
        )}
      </div>

      {/* Punishment Modal */}
      <PunishmentModal
        isOpen={showPunishment}
        onClose={() => setShowPunishment(false)}
        punishment={currentPunishment}
      />
    </>
  );
}
