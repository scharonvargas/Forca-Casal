import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCouple } from '@/lib/stores/useCouple';
import { useHangman } from '@/lib/stores/useHangman';
import { usePunishments } from '@/lib/stores/usePunishments';
import SecretWordInput from './SecretWordInput';
import HangmanCanvas from './HangmanCanvas';
import Keyboard from './Keyboard';
import PunishmentModal from './PunishmentModal';
import { Crown, Trophy, Heart, ArrowRight, User, Target, Sword } from 'lucide-react';

export default function SimpleCoupleGame() {
  const {
    getCurrentPlayer,
    getOtherPlayer,
    getCurrentPlayerNumber,
    isCurrentPlayerChallenger,
    switchTurn,
    addScore,
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

  const [phase, setPhase] = useState<'word-input' | 'playing' | 'result'>('word-input');
  const [secretWord, setSecretWord] = useState('');
  const [showPunishment, setShowPunishment] = useState(false);
  const [currentPunishment, setCurrentPunishment] = useState<any>(null);

  const currentPlayer = getCurrentPlayer();
  const otherPlayer = getOtherPlayer();

  useEffect(() => {
    if (gameState === 'won' || gameState === 'lost') {
      handleGameEnd();
    }
  }, [gameState]);

  const handleWordSet = (word: string) => {
    setSecretWord(word);
    newGame(word);
    setPhase('playing');
  };

  const handleGameEnd = () => {
    if (gameState === 'won') {
      const winnerNumber = isCurrentPlayerChallenger() ? 
        (getCurrentPlayerNumber() === 1 ? 2 : 1) : getCurrentPlayerNumber();
      addScore(winnerNumber);
    } else if (gameState === 'lost') {
      const winnerNumber = isCurrentPlayerChallenger() ? 
        getCurrentPlayerNumber() : (getCurrentPlayerNumber() === 1 ? 2 : 1);
      addScore(winnerNumber);
      
      const punishment = getRandomPunishment();
      if (punishment) {
        setCurrentPunishment(punishment);
        setShowPunishment(true);
      }
    }
    setPhase('result');
  };

  const handleNextRound = () => {
    switchTurn();
    setPhase('word-input');
    setSecretWord('');
  };

  const handleLetterGuess = (letter: string) => {
    if (gameState === 'playing') {
      guessLetter(letter);
    }
  };

  if (phase === 'word-input') {
    return <SecretWordInput onWordSet={handleWordSet} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Players Info */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Crown className="h-6 w-6 text-yellow-400" />
              <h2 className="text-xl font-bold text-white">RODADA {roundNumber}</h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Player */}
            <div className={`p-4 rounded-lg border-2 text-center ${
              isCurrentPlayerChallenger() 
                ? 'border-blue-500 bg-blue-500/20' 
                : 'border-green-500 bg-green-500/20'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {isCurrentPlayerChallenger() ? (
                  <Sword className="h-5 w-5 text-blue-400" />
                ) : (
                  <Target className="h-5 w-5 text-green-400" />
                )}
                <User className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-white font-bold">{currentPlayer.name}</h3>
              <Badge className={
                isCurrentPlayerChallenger() 
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' 
                  : 'bg-green-500/20 text-green-300 border-green-500/50'
              }>
                {isCurrentPlayerChallenger() ? 'Desafiante' : 'Adivinhador'}
              </Badge>
              <div className="mt-2">
                <Trophy className="h-4 w-4 text-yellow-400 inline mr-1" />
                <span className="text-white font-bold">{currentPlayer.score}</span>
              </div>
            </div>

            {/* Other Player */}
            <div className="p-4 rounded-lg border-2 border-white/20 bg-white/5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {!isCurrentPlayerChallenger() ? (
                  <Sword className="h-5 w-5 text-white/40" />
                ) : (
                  <Target className="h-5 w-5 text-white/40" />
                )}
                <User className="h-4 w-4 text-white/40" />
              </div>
              <h3 className="text-white/70 font-bold">{otherPlayer.name}</h3>
              <Badge className="bg-white/10 text-white/60 border-white/20">
                {!isCurrentPlayerChallenger() ? 'Desafiante' : 'Adivinhador'}
              </Badge>
              <div className="mt-2">
                <Trophy className="h-4 w-4 text-white/40 inline mr-1" />
                <span className="text-white/70 font-bold">{otherPlayer.score}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Status */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardContent className="p-4 text-center">
          <div className="mb-4">
            <div className="text-white/70 text-sm mb-2">Palavra Secreta:</div>
            <div className="text-2xl font-mono text-white tracking-widest bg-white/10 rounded-lg p-3">
              {getDisplayWord()}
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm">
            <div>
              <Heart className="h-4 w-4 text-red-400 inline mr-1" />
              <span className="text-white">Erros: {wrongGuesses}/6</span>
            </div>
            <div>
              <span className={`px-2 py-1 rounded ${
                gameState === 'playing' ? 'bg-green-500/20 text-green-300' :
                gameState === 'won' ? 'bg-blue-500/20 text-blue-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {gameState === 'playing' ? 'Jogando' :
                 gameState === 'won' ? 'Ganhou!' : 'Perdeu!'}
              </span>
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

        {/* Keyboard */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white">
              {isCurrentPlayerChallenger() ? 'Aguarde...' : 'Sua vez!'}
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
                <Sword className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <p className="text-white text-lg mb-2">Você é o Desafiante!</p>
                <p className="text-white/70 text-sm">
                  Aguarde {otherPlayer.name} adivinhar...
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Game Result */}
      {phase === 'result' && (
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
                  Alguém deve cumprir um castigo! 😈
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

      {/* Punishment Modal */}
      <PunishmentModal
        isOpen={showPunishment}
        onClose={() => setShowPunishment(false)}
        punishment={currentPunishment}
      />
    </div>
  );
}