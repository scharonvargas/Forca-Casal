import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useCouple } from '@/lib/stores/useCouple';
import { useHangman } from '@/lib/stores/useHangman';
import { usePunishments } from '@/lib/stores/usePunishments';
import SecretWordInput from './SecretWordInput';
import HangmanCanvas from './HangmanCanvas';
import Keyboard from './Keyboard';
import PunishmentModal from './PunishmentModal';
import WordHintSystem from './WordHintSystem';
import { 
  Crown, 
  Target, 
  Heart, 
  Trophy, 
  Zap, 
  Timer,
  Sword,
  Shield,
  RotateCcw,
  ArrowRight
} from 'lucide-react';

type GamePhase = 'word-input' | 'playing' | 'result';

export default function CoupleGameInterface() {
  const {
    getCurrentPlayer,
    getOtherPlayer,
    getCurrentPlayerNumber,
    isCurrentPlayerChallenger,
    switchTurn,
    addScore,
    maxWrongGuesses,
    roundNumber
  } = useCouple();

  const {
    currentWord,
    guessedLetters,
    wrongGuesses,
    gameState,
    guessLetter,
    newGame,
    getDisplayWord
  } = useHangman();

  const { getRandomPunishment } = usePunishments();

  const [gamePhase, setGamePhase] = useState<GamePhase>('word-input');
  const [secretWord, setSecretWord] = useState('');
  const [showPunishment, setShowPunishment] = useState(false);
  const [currentPunishment, setCurrentPunishment] = useState<any>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const currentPlayer = getCurrentPlayer();
  const otherPlayer = getOtherPlayer();
  const currentPlayerNumber = getCurrentPlayerNumber();

  // Handle game state changes
  useEffect(() => {
    if (gameState === 'won' || gameState === 'lost') {
      handleGameEnd();
    }
  }, [gameState]);

  const handleWordSet = (word: string) => {
    setSecretWord(word);
    newGame(word);
    setGamePhase('playing');
  };

  const handleGameEnd = () => {
    if (gameState === 'won') {
      // Guesser wins
      const winnerNumber = isCurrentPlayerChallenger() ? (currentPlayerNumber === 1 ? 2 : 1) : currentPlayerNumber;
      addScore(winnerNumber);
    } else if (gameState === 'lost') {
      // Challenger wins, guesser gets punishment
      const winnerNumber = isCurrentPlayerChallenger() ? currentPlayerNumber : (currentPlayerNumber === 1 ? 2 : 1);
      addScore(winnerNumber);
      const punishment = getRandomPunishment();
      if (punishment) {
        setCurrentPunishment(punishment);
        setShowPunishment(true);
      }
    }
    setGamePhase('result');
  };

  const handleNextRound = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      switchTurn();
      setGamePhase('word-input');
      setSecretWord('');
      setHintsUsed(0);
      setIsTransitioning(false);
    }, 1000);
  };

  const handleHintUsed = (penalty: number) => {
    setHintsUsed(prev => prev + 1);
    if (penalty > 0) {
      // Simulate wrong guesses for the penalty
      for (let i = 0; i < penalty; i++) {
        guessLetter('_PENALTY_' + i); // Use a fake letter that will always be wrong
      }
    }
  };

  const handleLetterGuess = (letter: string) => {
    if (gameState === 'playing') {
      guessLetter(letter);
    }
  };

  if (gamePhase === 'word-input') {
    return <SecretWordInput onWordSet={handleWordSet} />;
  }

  if (isTransitioning) {
    return (
      <div className="max-w-4xl mx-auto p-4 text-center">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="py-12">
            <div className="animate-spin mx-auto mb-4">
              <RotateCcw className="h-12 w-12 text-purple-400" />
            </div>
            <h2 className="text-2xl text-white font-bold mb-2">Trocando Turnos...</h2>
            <p className="text-white/70">Preparando próxima rodada</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const healthPercentage = ((maxWrongGuesses - wrongGuesses) / maxWrongGuesses) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-4 p-4">
      {/* Game Header with Players */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Challenger */}
            <div className={`text-center p-3 rounded-lg border-2 transition-all ${
              isCurrentPlayerChallenger() 
                ? 'border-blue-500 bg-blue-500/20' 
                : 'border-white/20 bg-white/5'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sword className="h-5 w-5 text-blue-400" />
                <span className="text-white font-bold">{currentPlayer.name}</span>
              </div>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                Desafiante
              </Badge>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="text-white font-mono">{currentPlayer.score}</span>
              </div>
              {isCurrentPlayerChallenger() && (
                <div className="mt-2">
                  <Zap className="h-4 w-4 text-yellow-400 mx-auto animate-pulse" />
                  <p className="text-xs text-blue-300">Seu turno!</p>
                </div>
              )}
            </div>

            {/* Round Info */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Crown className="h-6 w-6 text-yellow-400" />
                <span className="text-white font-bold text-lg">RODADA {roundNumber}</span>
              </div>
              <div className="text-white/70 text-sm">
                {gameState === 'playing' ? 'Em andamento' : 
                 gameState === 'won' ? 'Vitória!' : 
                 gameState === 'lost' ? 'Derrota!' : 'Aguardando'}
              </div>
            </div>

            {/* Guesser */}
            <div className={`text-center p-3 rounded-lg border-2 transition-all ${
              !isCurrentPlayerChallenger() 
                ? 'border-green-500 bg-green-500/20' 
                : 'border-white/20 bg-white/5'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-white font-bold">{otherPlayer.name}</span>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
                Adivinhador
              </Badge>
              <div className="flex items-center justify-center gap-1 mt-2">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="text-white font-mono">{otherPlayer.score}</span>
              </div>
              {!isCurrentPlayerChallenger() && (
                <div className="mt-2">
                  <Target className="h-4 w-4 text-green-400 mx-auto animate-pulse" />
                  <p className="text-xs text-green-300">Sua vez!</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Status */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Health Bar */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className={`h-4 w-4 ${healthPercentage > 50 ? 'text-green-400' : 
                  healthPercentage > 25 ? 'text-yellow-400' : 'text-red-400'}`} />
                <span className="text-white text-sm font-medium">
                  Vida: {maxWrongGuesses - wrongGuesses}/{maxWrongGuesses}
                </span>
              </div>
              <Progress 
                value={healthPercentage} 
                className="h-2 bg-white/20"
              />
            </div>

            {/* Current Word */}
            <div className="text-center">
              <p className="text-white/70 text-sm mb-1">Palavra Secreta:</p>
              <div className="text-2xl font-mono text-white tracking-widest bg-white/10 rounded-lg p-2">
                {getDisplayWord()}
              </div>
            </div>

            {/* Timer/Status */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Timer className="h-4 w-4 text-purple-400" />
                <span className="text-white text-sm">Status do Jogo</span>
              </div>
              <Badge className={`${
                gameState === 'playing' ? 'bg-green-500/20 text-green-300 border-green-500/50' :
                gameState === 'won' ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' :
                'bg-red-500/20 text-red-300 border-red-500/50'
              }`}>
                {gameState === 'playing' ? 'Jogando' :
                 gameState === 'won' ? 'Ganhou!' : 'Perdeu!'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hangman Canvas */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white text-center">Forca</CardTitle>
          </CardHeader>
          <CardContent>
            <HangmanCanvas wrongGuesses={wrongGuesses} />
          </CardContent>
        </Card>

        {/* Keyboard and Instructions */}
        <div className="space-y-4">
          {/* Hint System */}
          {!isCurrentPlayerChallenger() && gameState === 'playing' && (
            <WordHintSystem
              word={secretWord}
              onHintUsed={handleHintUsed}
              disabled={gameState !== 'playing'}
              hintsUsed={hintsUsed}
              maxHints={3}
            />
          )}

          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                {isCurrentPlayerChallenger() ? 'Aguarde...' : 'Sua vez de adivinhar!'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isCurrentPlayerChallenger() ? (
                <Keyboard
                  onLetterClick={handleLetterGuess}
                  guessedLetters={guessedLetters}
                  currentWord={currentWord}
                  disabled={gameState !== 'playing'}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="animate-pulse mb-4">
                    <Sword className="h-12 w-12 text-blue-400 mx-auto" />
                  </div>
                  <p className="text-white text-lg font-medium mb-2">
                    Você é o Desafiante!
                  </p>
                  <p className="text-white/70 text-sm">
                    Aguarde {otherPlayer.name} adivinhar sua palavra...
                  </p>
                  {hintsUsed > 0 && (
                    <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
                      <p className="text-yellow-300 text-sm">
                        🔍 {otherPlayer.name} usou {hintsUsed} {hintsUsed === 1 ? 'dica' : 'dicas'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Game Result */}
          {gamePhase === 'result' && (
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardContent className="p-6 text-center">
                {gameState === 'won' ? (
                  <div>
                    <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                    <h3 className="text-2xl text-white font-bold mb-2">
                      {isCurrentPlayerChallenger() ? otherPlayer.name : currentPlayer.name} Ganhou!
                    </h3>
                    <p className="text-white/70 mb-4">
                      A palavra era: <span className="text-white font-mono">{secretWord}</span>
                    </p>
                  </div>
                ) : (
                  <div>
                    <Heart className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <h3 className="text-2xl text-white font-bold mb-2">
                      {isCurrentPlayerChallenger() ? currentPlayer.name : otherPlayer.name} Ganhou!
                    </h3>
                    <p className="text-white/70 mb-4">
                      A palavra era: <span className="text-white font-mono">{secretWord}</span>
                    </p>
                    <p className="text-pink-300 text-sm">
                      {isCurrentPlayerChallenger() ? otherPlayer.name : currentPlayer.name} deve cumprir um castigo! 😈
                    </p>
                  </div>
                )}
                
                <Button
                  onClick={handleNextRound}
                  className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Próxima Rodada
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Punishment Modal */}
      <PunishmentModal
        isOpen={showPunishment}
        onClose={() => setShowPunishment(false)}
        punishment={currentPunishment}
      />
    </div>
  );
}