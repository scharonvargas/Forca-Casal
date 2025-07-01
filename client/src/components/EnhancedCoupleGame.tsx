import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useHangman } from '@/lib/stores/useHangman';
import { usePunishments } from '@/lib/stores/usePunishments';
import HangmanCanvas from './HangmanCanvas';
import Keyboard from './Keyboard';
import PunishmentModal from './PunishmentModal';
import { 
  Crown, 
  Trophy, 
  Heart, 
  ArrowRight, 
  User, 
  Target, 
  Sword,
  Timer,
  RotateCcw,
  Lightbulb,
  Clock,
  Play,
  RefreshCw
} from 'lucide-react';

interface Player {
  name: string;
  score: number;
}

export default function EnhancedCoupleGame() {
  // Game state
  const [player1, setPlayer1] = useState<Player>({ name: '', score: 0 });
  const [player2, setPlayer2] = useState<Player>({ name: '', score: 0 });
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [isChallenger, setIsChallenger] = useState(true);
  const [roundNumber, setRoundNumber] = useState(1);
  
  // Game phases
  const [gamePhase, setGamePhase] = useState<'setup' | 'word-input' | 'playing' | 'result'>('setup');
  const [secretWord, setSecretWord] = useState('');
  
  // Timer
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  
  // Hints
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  
  // Punishment modal
  const [showPunishment, setShowPunishment] = useState(false);
  const [currentPunishment, setCurrentPunishment] = useState<any>(null);

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

  const getCurrentPlayerInfo = () => currentPlayer === 1 ? player1 : player2;
  const getOtherPlayerInfo = () => currentPlayer === 1 ? player2 : player1;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Game state watcher
  useEffect(() => {
    if (gameState === 'won' || gameState === 'lost') {
      setTimerActive(false);
      handleGameEnd();
    }
  }, [gameState]);

  const handleSetup = (p1Name: string, p2Name: string) => {
    setPlayer1({ name: p1Name, score: 0 });
    setPlayer2({ name: p2Name, score: 0 });
    setGamePhase('word-input');
  };

  const handleWordSet = (word: string) => {
    setSecretWord(word);
    newGame(word);
    setGamePhase('playing');
    setTimeLeft(60);
    setTimerActive(true);
  };

  const handleTimeUp = () => {
    setTimerActive(false);
    // Time up counts as a loss for the guesser
    if (!isChallenger) {
      handleGameEnd(true); // Force loss
    }
  };

  const handleGameEnd = (forceLoss = false) => {
    setTimerActive(false);
    
    if (gameState === 'won' && !forceLoss) {
      // Guesser wins
      const winnerPlayer = isChallenger ? 
        (currentPlayer === 1 ? 2 : 1) : currentPlayer;
      
      if (winnerPlayer === 1) {
        setPlayer1(prev => ({ ...prev, score: prev.score + 1 }));
      } else {
        setPlayer2(prev => ({ ...prev, score: prev.score + 1 }));
      }
    } else {
      // Challenger wins or time up
      const winnerPlayer = isChallenger ? 
        currentPlayer : (currentPlayer === 1 ? 2 : 1);
      
      if (winnerPlayer === 1) {
        setPlayer1(prev => ({ ...prev, score: prev.score + 1 }));
      } else {
        setPlayer2(prev => ({ ...prev, score: prev.score + 1 }));
      }
      
      // Show punishment for loser
      const punishment = getRandomPunishment();
      if (punishment) {
        setCurrentPunishment(punishment);
        setShowPunishment(true);
      }
    }
    setGamePhase('result');
  };

  const handleNextRound = () => {
    setCurrentPlayer(prev => prev === 1 ? 2 : 1);
    setIsChallenger(prev => !prev);
    setRoundNumber(prev => prev + 1);
    setGamePhase('word-input');
    setSecretWord('');
    setHintsUsed(0);
    setRevealedHints([]);
    setTimeLeft(60);
  };

  const handleNewGame = () => {
    setPlayer1({ name: '', score: 0 });
    setPlayer2({ name: '', score: 0 });
    setCurrentPlayer(1);
    setIsChallenger(true);
    setRoundNumber(1);
    setGamePhase('setup');
    setSecretWord('');
    setHintsUsed(0);
    setRevealedHints([]);
    setTimeLeft(60);
    setTimerActive(false);
  };

  const getHints = (word: string) => {
    const hints = [];
    const cleanWord = word.toUpperCase();
    
    // Hint 1: Length and category
    if (cleanWord.length <= 5) {
      hints.push(`💫 Palavra curta e doce (${cleanWord.length} letras)`);
    } else if (cleanWord.length <= 8) {
      hints.push(`🔥 Palavra de intensidade média (${cleanWord.length} letras)`);
    } else {
      hints.push(`💋 Palavra longa e apaixonada (${cleanWord.length} letras)`);
    }

    // Hint 2: First letter
    hints.push(`🎯 Começa com a letra "${cleanWord[0]}"`);

    // Hint 3: Vowels
    const vowels = cleanWord.match(/[AEIOU]/g);
    if (vowels) {
      const uniqueVowels = Array.from(new Set(vowels));
      hints.push(`🎵 Contém as vogais: ${uniqueVowels.join(', ')}`);
    } else {
      hints.push(`🎵 Não contém vogais comuns`);
    }

    return hints;
  };

  const handleUseHint = () => {
    if (hintsUsed < 3) {
      const hints = getHints(secretWord);
      setRevealedHints(prev => [...prev, hints[hintsUsed]]);
      setHintsUsed(prev => prev + 1);
      setTimeLeft(prev => Math.max(prev - 10, 0)); // Penalty: -10 seconds
    }
  };

  const handleLetterGuess = (letter: string) => {
    if (gameState === 'playing' && timerActive) {
      guessLetter(letter);
    }
  };

  // Setup Phase
  if (gamePhase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto space-y-6 p-4">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl flex items-center justify-center gap-2">
              <Heart className="h-6 w-6 text-pink-400" />
              Configurar Jogo do Casal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CoupleSetupForm onSetup={handleSetup} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Word Input Phase
  if (gamePhase === 'word-input') {
    return (
      <div className="max-w-lg mx-auto space-y-6 p-4">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              Rodada {roundNumber}
            </CardTitle>
            <div className="text-center mt-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                {getCurrentPlayerInfo().name} - Desafiante
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <SecretWordInputForm 
              playerName={getCurrentPlayerInfo().name}
              onWordSet={handleWordSet} 
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const timePercentage = (timeLeft / 60) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-4 p-4">
      {/* Header with New Game Button */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Crown className="h-6 w-6 text-yellow-400 mx-auto mb-1" />
                <div className="text-white font-bold">Rodada {roundNumber}</div>
              </div>
              
              {/* Timer */}
              <div className="flex items-center gap-2">
                <Timer className={`h-5 w-5 ${timeLeft > 20 ? 'text-green-400' : timeLeft > 10 ? 'text-yellow-400' : 'text-red-400'}`} />
                <div className="text-white font-mono text-lg">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className={`w-24 h-2 rounded-full bg-white/20 overflow-hidden`}>
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      timeLeft > 20 ? 'bg-green-400' : 
                      timeLeft > 10 ? 'bg-yellow-400' : 'bg-red-400'
                    }`}
                    style={{ width: `${timePercentage}%` }}
                  />
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleNewGame}
              variant="outline"
              className="text-white border-white/20 hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Nova Partida
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Players Info */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Player */}
            <div className={`p-4 rounded-lg border-2 text-center transition-all ${
              isChallenger 
                ? 'border-blue-500 bg-blue-500/20' 
                : 'border-green-500 bg-green-500/20'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-2">
                {isChallenger ? (
                  <Sword className="h-5 w-5 text-blue-400" />
                ) : (
                  <Target className="h-5 w-5 text-green-400" />
                )}
                <User className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-white font-bold">{getCurrentPlayerInfo().name}</h3>
              <Badge className={
                isChallenger 
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' 
                  : 'bg-green-500/20 text-green-300 border-green-500/50'
              }>
                {isChallenger ? 'Desafiante' : 'Adivinhador'}
              </Badge>
              <div className="mt-2">
                <Trophy className="h-4 w-4 text-yellow-400 inline mr-1" />
                <span className="text-white font-bold">{getCurrentPlayerInfo().score}</span>
              </div>
            </div>

            {/* Other Player */}
            <div className="p-4 rounded-lg border-2 border-white/20 bg-white/5 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {!isChallenger ? (
                  <Sword className="h-5 w-5 text-white/40" />
                ) : (
                  <Target className="h-5 w-5 text-white/40" />
                )}
                <User className="h-4 w-4 text-white/40" />
              </div>
              <h3 className="text-white/70 font-bold">{getOtherPlayerInfo().name}</h3>
              <Badge className="bg-white/10 text-white/60 border-white/20">
                {!isChallenger ? 'Desafiante' : 'Adivinhador'}
              </Badge>
              <div className="mt-2">
                <Trophy className="h-4 w-4 text-white/40 inline mr-1" />
                <span className="text-white/70 font-bold">{getOtherPlayerInfo().score}</span>
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

        {/* Game Controls */}
        <div className="space-y-4">
          {/* Hints System */}
          {!isChallenger && gameState === 'playing' && (
            <Card className="bg-black/20 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  Dicas ({hintsUsed}/3)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {revealedHints.map((hint, index) => (
                  <div key={index} className="p-2 bg-green-500/20 border border-green-500/50 rounded text-green-300 text-sm">
                    {hint}
                  </div>
                ))}
                
                {hintsUsed < 3 && (
                  <Button
                    onClick={handleUseHint}
                    className="w-full bg-yellow-600 hover:bg-yellow-700"
                    disabled={!timerActive}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Usar Dica (-10 segundos)
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Keyboard */}
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-white">
                {isChallenger ? 'Aguarde...' : 'Sua vez!'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!isChallenger ? (
                <Keyboard
                  onLetterClick={handleLetterGuess}
                  guessedLetters={guessedLetters}
                  currentWord={currentWord}
                  disabled={gameState !== 'playing' || !timerActive}
                />
              ) : (
                <div className="text-center py-8">
                  <Sword className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">Você é o Desafiante!</p>
                  <p className="text-white/70 text-sm">
                    Aguarde {getOtherPlayerInfo().name} adivinhar...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Game Result */}
      {gamePhase === 'result' && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-6 text-center">
            {gameState === 'won' ? (
              <div>
                <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl text-white font-bold mb-2">
                  {isChallenger ? getOtherPlayerInfo().name : getCurrentPlayerInfo().name} Ganhou!
                </h3>
                <p className="text-white/70 mb-4">
                  A palavra era: <span className="text-white font-mono">{secretWord}</span>
                </p>
              </div>
            ) : (
              <div>
                <Heart className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-2xl text-white font-bold mb-2">
                  {isChallenger ? getCurrentPlayerInfo().name : getOtherPlayerInfo().name} Ganhou!
                </h3>
                <p className="text-white/70 mb-4">
                  A palavra era: <span className="text-white font-mono">{secretWord}</span>
                </p>
                <p className="text-pink-300 text-sm">
                  {timeLeft === 0 ? 'Tempo esgotado! ' : ''}Alguém deve cumprir um castigo! 😈
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

// Couple Setup Form Component
function CoupleSetupForm({ onSetup }: { onSetup: (p1: string, p2: string) => void }) {
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (player1Name.trim() && player2Name.trim()) {
      onSetup(player1Name.trim(), player2Name.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          value={player1Name}
          onChange={(e) => setPlayer1Name(e.target.value)}
          placeholder="Nome do Jogador 1..."
          className="bg-white/10 border-white/20 text-white placeholder-white/50"
          required
        />
        <Input
          value={player2Name}
          onChange={(e) => setPlayer2Name(e.target.value)}
          placeholder="Nome do Jogador 2..."
          className="bg-white/10 border-white/20 text-white placeholder-white/50"
          required
        />
      </div>
      
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
        disabled={!player1Name.trim() || !player2Name.trim()}
      >
        <Play className="h-4 w-4 mr-2" />
        Começar Jogo
      </Button>
    </form>
  );
}

// Secret Word Input Form Component
function SecretWordInputForm({ playerName, onWordSet }: { playerName: string, onWordSet: (word: string) => void }) {
  const [word, setWord] = useState('');
  const [showWord, setShowWord] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (word.trim() && word.trim().length >= 3) {
      onWordSet(word.trim().toUpperCase());
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-white font-bold text-lg">{playerName}</h3>
        <p className="text-white/70 text-sm">Escolha uma palavra secreta</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type={showWord ? "text" : "password"}
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Digite a palavra secreta..."
            className="bg-white/10 border-white/20 text-white placeholder-white/50"
            minLength={3}
            maxLength={20}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowWord(!showWord)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
          >
            {showWord ? '👁️' : '👁️‍🗨️'}
          </Button>
        </div>
        
        <Button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={!word.trim() || word.trim().length < 3}
        >
          Definir Palavra
        </Button>
      </form>
    </div>
  );
}