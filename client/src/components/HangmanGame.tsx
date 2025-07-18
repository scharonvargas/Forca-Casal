import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import HangmanCanvas from "./HangmanCanvas";
import Keyboard from "./Keyboard";
import GameStats from "./GameStats";
import PunishmentModal from "./PunishmentModal";
import EnhancedCoupleGame from "./EnhancedCoupleGame";
import GameTimer from "./GameTimer";
import { useHangman } from "../lib/stores/useHangman";
import { useWords } from "../lib/stores/useWords";
import { useCouple } from "../lib/stores/useCouple";
import { usePunishments, Punishment } from "../lib/stores/usePunishments";
import { useTimeConfig } from "../lib/stores/useTimeConfig";
import { useDifficulty, getDifficultySettings } from "../lib/stores/useDifficulty";
import { RefreshCw, Trophy, Skull } from "lucide-react";
import { playSound } from "../lib/utils/playSound";

export default function HangmanGame() {
  const { gameMode } = useCouple();
  
  const {
    currentWord,
    guessedLetters,
    wrongGuesses,
    gameState,
    guessLetter,
    newGame,
    getDisplayWord,
    setTimeLeft,
    setTimeEnabled,
    timeLeft,
    timeEnabled
  } = useHangman();
  
  const { getRandomWord } = useWords();
  const { getRandomPunishment } = usePunishments();
  const { config: timeConfig } = useTimeConfig();
  const { level } = useDifficulty();
  const difficulty = getDifficultySettings(level);
  const [showPunishment, setShowPunishment] = useState(false);
  const [currentPunishment, setCurrentPunishment] = useState<Punishment | null>(null);

  // If couple mode is selected, use the enhanced couple interface
  if (gameMode === 'couple') {
    return <EnhancedCoupleGame />;
  }

  // Start a new game when component mounts
  useEffect(() => {
    const word = getRandomWord();
    if (word) {
      newGame(word, difficulty.maxWrongGuesses);
      // Initialize timer
      if (timeConfig.enabled) {
        setTimeLeft(Math.round(timeConfig.initialTime * difficulty.timeMultiplier));
        setTimeEnabled(true);
      } else {
        setTimeEnabled(false);
      }
    }
  }, []);

  // Update time settings when config changes
  useEffect(() => {
    if (gameState === 'playing') {
      if (timeConfig.enabled) {
        setTimeEnabled(true);
        setTimeLeft(Math.round(timeConfig.initialTime * difficulty.timeMultiplier));
      } else {
        setTimeEnabled(false);
      }
    } else {
      setTimeEnabled(false);
    }
  }, [timeConfig.enabled, timeConfig.initialTime, difficulty.timeMultiplier, gameState]);

  // Check for game end and show punishment for losses
  useEffect(() => {
    if (gameState === 'lost') {
      const punishment = getRandomPunishment();
      if (punishment) {
        setCurrentPunishment(punishment);
        setShowPunishment(true);
      }
      playSound('defeat');
    } else if (gameState === 'won') {
      // Add word completion bonus
      if (timeConfig.enabled && timeEnabled) {
        setTimeLeft(timeLeft + timeConfig.bonusPerWord);
      }
      playSound('victory');
    }
  }, [gameState]);

  const handleLetterGuess = (letter: string) => {
    if (gameState === 'playing') {
      const wasCorrect = currentWord.includes(letter.toUpperCase());
      guessLetter(letter);

      setTimeout(() => {
        playSound(wasCorrect ? 'correct' : 'wrong');
      }, 100);
      
      // Apply time bonus/penalty if time is enabled
      if (timeConfig.enabled && timeEnabled) {
        if (wasCorrect) {
          setTimeLeft(timeLeft + timeConfig.bonusPerCorrect);
        } else {
          setTimeLeft(Math.max(0, timeLeft - timeConfig.penaltyPerWrong));
        }
      }
    }
  };

  const handleNewGame = () => {
    const word = getRandomWord();
    if (word) {
      newGame(word, difficulty.maxWrongGuesses);
      // Reset timer for new game
      if (timeConfig.enabled) {
        setTimeLeft(Math.round(timeConfig.initialTime * difficulty.timeMultiplier));
        setTimeEnabled(true);
      } else {
        setTimeEnabled(false);
      }
    }
  };

  const handleTimeUp = () => {
    // Force game to end when time runs out
    if (gameState === 'playing') {
      // Simulate max wrong guesses to end game
      const currentState = useHangman.getState();
      useHangman.setState({ 
        ...currentState, 
        wrongGuesses: difficulty.maxWrongGuesses,
        gameState: 'lost',
        stats: {
          ...currentState.stats,
          losses: currentState.stats.losses + 1,
          totalGames: currentState.stats.totalGames + 1
        }
      });
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
              
              {/* Game Timer */}
              {timeConfig.enabled && (
                <div className="flex justify-center mt-4">
                  <GameTimer onTimeUp={handleTimeUp} />
                </div>
              )}
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
