import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useHangman } from '@/lib/stores/useHangman';
import { usePunishments } from '@/lib/stores/usePunishments';
import { useWords } from '@/lib/stores/useWords';
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
  const [maxRounds] = useState(3); // Melhor de 3
  
  // Game phases
  const [gamePhase, setGamePhase] = useState<'setup' | 'word-input' | 'playing' | 'result'>('setup');
  const [secretWord, setSecretWord] = useState('');
  
  // Timer
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  
  // Hints
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);
  
  // Punishment modal with 3 options
  const [showPunishment, setShowPunishment] = useState(false);
  const [punishmentOptions, setPunishmentOptions] = useState<any[]>([]);

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
  const { words, getRandomWord } = useWords();

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
    const newPlayer1 = { name: p1Name, score: 0 };
    const newPlayer2 = { name: p2Name, score: 0 };
    setPlayer1(newPlayer1);
    setPlayer2(newPlayer2);
    setGamePhase('word-input');
  };

  const handleWordSet = (word: string) => {
    setSecretWord(word);
    newGame(word);
    setGamePhase('playing');
    setTimeLeft(60);
    setTimerActive(true);
    // Switch to guesser role when game starts
    setIsChallenger(false);
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
    
    let winnerPlayer: 1 | 2;
    let newPlayer1Score = player1.score;
    let newPlayer2Score = player2.score;
    
    if (gameState === 'won' && !forceLoss) {
      // Adivinhador ganhou
      winnerPlayer = 1;
      newPlayer1Score++;
      setPlayer1(prev => ({ ...prev, score: prev.score + 1 }));
      playSound('victory');
    } else {
      // Desafiante ganhou ou tempo esgotado
      winnerPlayer = 2;
      newPlayer2Score++;
      setPlayer2(prev => ({ ...prev, score: prev.score + 1 }));
      playSound('defeat');
    }
    
    // Only show punishment when match ends (someone reaches 2 wins)
    if (newPlayer1Score === 2 || newPlayer2Score === 2) {
      // Generate 3 random punishment options
      const options: any[] = [];
      for (let i = 0; i < 3; i++) {
        const punishment = getRandomPunishment();
        if (punishment && !options.find(p => p.id === punishment.id)) {
          options.push(punishment);
        }
      }
      
      // Ensure we have at least 3 options (fill with random if needed)
      while (options.length < 3) {
        const punishment = getRandomPunishment();
        if (punishment) {
          options.push(punishment);
        }
      }
      
      if (options.length > 0) {
        setPunishmentOptions(options);
        setShowPunishment(true);
      }
    }
    
    setGamePhase('result');
  };

  const handleNextRound = () => {
    // Check if someone won the match (melhor de 3)
    if (player1.score === 2 || player2.score === 2) {
      // Game over - someone won the match
      return;
    }
    
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

  const playSound = (type: 'correct' | 'wrong' | 'victory' | 'defeat') => {
    try {
      const audio = new Audio();
      switch (type) {
        case 'correct':
          // Som de acerto - frequência alta positiva
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIWAC2WzfHCdSoFl2++8eecSA'; // Simplified beep sound
          break;
        case 'wrong':
          // Som de erro - frequência baixa
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIWAC2WzfHCdSoFl2++8eecSA';
          break;
        case 'victory':
          // Som de vitória
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIWAC2WzfHCdSoFl2++8eecSA';
          break;
        case 'defeat':
          // Som de derrota
          audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIWAC2WzfHCdSoFl2++8eecSA';
          break;
      }
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors if audio fails
    } catch (error) {
      // Ignore audio errors
    }
  };

  const handleLetterGuess = (letter: string) => {
    if (gameState === 'playing' && timerActive) {
      const wasCorrect = currentWord.toUpperCase().includes(letter);
      guessLetter(letter);
      
      // Play sound after a short delay to let the game state update
      setTimeout(() => {
        if (wasCorrect) {
          playSound('correct');
        } else {
          playSound('wrong');
        }
      }, 100);
    }
  };

  // Setup state for names
  const [tempPlayer1Name, setTempPlayer1Name] = useState('');
  const [tempPlayer2Name, setTempPlayer2Name] = useState('');

  const handleSetupComplete = () => {
    if (tempPlayer1Name.trim() && tempPlayer2Name.trim()) {
      setPlayer1({ name: tempPlayer1Name.trim(), score: 0 });
      setPlayer2({ name: tempPlayer2Name.trim(), score: 0 });
      setGamePhase('word-input');
    }
  };

  // Setup Phase - Names input
  if (gamePhase === 'setup') {
    return (
      <div className="max-w-lg mx-auto space-y-6 p-4">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl flex items-center justify-center gap-2">
              <Heart className="h-6 w-6 text-pink-400" />
              Jogo do Casal
            </CardTitle>
            <div className="text-white/70 text-sm mt-2">
              Melhor de 3 rodadas - Digite os nomes dos jogadores
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-white text-sm font-bold block mb-2">
                  🧠 Nome do ADIVINHADOR:
                </label>
                <Input
                  value={tempPlayer1Name}
                  onChange={(e) => setTempPlayer1Name(e.target.value)}
                  placeholder="Ex: Ana, João..."
                  className="bg-green-500/10 border-green-500/30 text-white placeholder-white/50"
                  maxLength={15}
                />
                <div className="text-green-300 text-xs mt-1">
                  Vai descobrir as palavras secretas
                </div>
              </div>
              
              <div>
                <label className="text-white text-sm font-bold block mb-2">
                  🎯 Nome do DESAFIANTE:
                </label>
                <Input
                  value={tempPlayer2Name}
                  onChange={(e) => setTempPlayer2Name(e.target.value)}
                  placeholder="Ex: Carlos, Maria..."
                  className="bg-blue-500/10 border-blue-500/30 text-white placeholder-white/50"
                  maxLength={15}
                />
                <div className="text-blue-300 text-xs mt-1">
                  Vai escolher as palavras secretas
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleSetupComplete}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 py-3"
              disabled={!tempPlayer1Name.trim() || !tempPlayer2Name.trim()}
            >
              <Play className="h-4 w-4 mr-2" />
              Começar Jogo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Word Input Phase - Simplified
  if (gamePhase === 'word-input') {
    return (
      <div className="max-w-lg mx-auto space-y-4 p-4">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              Rodada {roundNumber}
            </CardTitle>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50 mt-2">
              🎯 {player2.name} - DESAFIANTE: Escolha uma palavra secreta
            </Badge>
            <div className="text-white/60 text-xs mt-2 bg-blue-500/10 rounded p-2">
              {player2.name} escolhe uma palavra que {player1.name} deve adivinhar
            </div>
          </CardHeader>
          <CardContent>
            <SecretWordInputForm 
              playerName="Desafiante"
              onWordSet={handleWordSet}
              availableWords={words}
              getRandomWord={getRandomWord}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const timePercentage = (timeLeft / 60) * 100;

  return (
    <div className="max-w-6xl mx-auto space-y-2 p-2">
      {/* Header with Timer - Compacto */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardContent className="p-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="text-center">
                <Crown className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                <div className="text-white font-bold text-xs">Rodada {roundNumber}/3</div>
                <div className="text-white/60 text-xs">Melhor de 3</div>
              </div>
              
              {/* Timer - More prominent on mobile */}
              <div className="flex flex-col items-center bg-black/30 rounded-lg p-2 min-w-[80px]">
                <Timer className={`h-4 w-4 mb-1 ${timeLeft > 20 ? 'text-green-400' : timeLeft > 10 ? 'text-yellow-400' : 'text-red-400'}`} />
                <div className={`font-mono font-bold text-lg ${timeLeft > 20 ? 'text-green-400' : timeLeft > 10 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="w-16 h-1 rounded-full bg-white/20 overflow-hidden mt-1">
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
              size="sm"
              className="text-white border-white/20 hover:bg-white/10 text-xs flex items-center gap-1 px-2 py-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Nova Partida</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Players Info - Compacto */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardContent className="p-2">
          <div className="flex items-center justify-between gap-2">
            {/* Current Player */}
            <div className={`flex-1 p-2 rounded-lg border-2 text-center transition-all ${
              isChallenger 
                ? 'border-blue-500 bg-blue-500/20' 
                : 'border-green-500 bg-green-500/20'
            }`}>
              <div className="flex items-center justify-center gap-1 mb-1">
                {isChallenger ? (
                  <Sword className="h-4 w-4 text-blue-400" />
                ) : (
                  <Target className="h-4 w-4 text-green-400" />
                )}
              </div>
              <h3 className="text-white font-bold text-sm mb-1">{getCurrentPlayerInfo().name}</h3>
              <Badge className={`text-xs mb-1 ${
                isChallenger 
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/50' 
                  : 'bg-green-500/20 text-green-300 border-green-500/50'
              }`}>
                {isChallenger ? 'Desafiante' : 'Adivinhador'}
              </Badge>
              <div className="flex items-center justify-center gap-1">
                <Trophy className="h-3 w-3 text-yellow-400" />
                <span className="text-white font-bold text-sm">{getCurrentPlayerInfo().score}</span>
              </div>
            </div>

            <div className="text-white/40 text-lg">VS</div>

            {/* Other Player */}
            <div className="flex-1 p-2 rounded-lg border-2 border-white/20 bg-white/5 text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                {!isChallenger ? (
                  <Sword className="h-4 w-4 text-white/40" />
                ) : (
                  <Target className="h-4 w-4 text-white/40" />
                )}
              </div>
              <h3 className="text-white/70 font-bold text-sm mb-1">{getOtherPlayerInfo().name}</h3>
              <Badge className="bg-white/10 text-white/60 border-white/20 text-xs mb-1">
                {!isChallenger ? 'Desafiante' : 'Adivinhador'}
              </Badge>
              <div className="flex items-center justify-center gap-1">
                <Trophy className="h-3 w-3 text-white/40" />
                <span className="text-white/70 font-bold text-sm">{getOtherPlayerInfo().score}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* FORCA NO TOPO - Layout Mobile */}
      <div className="space-y-2">
        {/* 1. FORCA SEMPRE NO TOPO - MAIOR E MAIS DESTACADA */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-2">
            <div className="flex justify-center">
              <div className="w-72 h-72 md:w-80 md:h-80">
                <HangmanCanvas wrongGuesses={wrongGuesses} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. PALAVRA SECRETA - MAIS COMPACTA */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-3 text-center">
            <div className="mb-2">
              <div className="text-white/70 text-xs mb-1">Palavra Secreta:</div>
              <div className="text-xl md:text-2xl font-mono text-white tracking-widest bg-white/10 rounded-lg p-3">
                {getDisplayWord()}
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-3 text-xs">
              <div>
                <Heart className="h-3 w-3 text-red-400 inline mr-1" />
                <span className="text-white">Erros: {wrongGuesses}/6</span>
              </div>
              <div>
                <span className={`px-2 py-1 rounded text-xs ${
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

        {/* 3. TECLADO - SEMPRE VISÍVEL */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-center">
              🎯 Escolha uma letra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Keyboard
              onLetterClick={handleLetterGuess}
              guessedLetters={guessedLetters}
              currentWord={currentWord}
              disabled={gameState !== 'playing' || !timerActive}
            />
            
            <div className="mt-4 space-y-2">
              <div className="text-center py-2 bg-green-500/10 rounded-lg">
                <p className="text-green-300 text-sm">
                  💡 Clique nas letras para adivinhar a palavra!
                </p>
              </div>
              <div className="text-center py-2 bg-blue-500/10 rounded-lg">
                <p className="text-blue-300 text-xs">
                  🎮 REGRAS: ADIVINHADOR descobre a palavra | DESAFIANTE escolhe a palavra | Melhor de 3 rodadas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. DICAS */}
        {gameState === 'playing' && (
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center justify-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                💡 Dicas ({hintsUsed}/3)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {revealedHints.map((hint, index) => (
                <div key={index} className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300">
                  {hint}
                </div>
              ))}
              
              {hintsUsed < 3 && (
                <Button
                  onClick={handleUseHint}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 py-3 text-sm flex items-center justify-center gap-2"
                  disabled={!timerActive}
                >
                  <Clock className="h-4 w-4" />
                  <span>Usar Dica (-10s)</span>
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Game Result */}
      {gamePhase === 'result' && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-6 text-center">
            {gameState === 'won' ? (
              <div>
                <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl text-white font-bold mb-2">
                  {player1.name} (Adivinhador) Ganhou!
                </h3>
                <p className="text-white/70 mb-4">
                  A palavra era: <span className="text-white font-mono">{secretWord}</span>
                </p>
              </div>
            ) : (
              <div>
                <Heart className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-2xl text-white font-bold mb-2">
                  {player2.name} (Desafiante) Ganhou!
                </h3>
                <p className="text-white/70 mb-4">
                  A palavra era: <span className="text-white font-mono">{secretWord}</span>
                </p>
                <p className="text-pink-300 text-sm">
                  {timeLeft === 0 ? 'Tempo esgotado! ' : ''}
                  {(player1.score < 2 && player2.score < 2) ? 'Só castigo no final! 😈' : 'Hora do castigo! 😈'}
                </p>
              </div>
            )}
            
            {(player1.score < 2 && player2.score < 2) ? (
              <Button
                onClick={handleNextRound}
                className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Próxima Rodada ({roundNumber + 1}/3)
              </Button>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                    🏆 {player1.score === 2 ? player1.name : player2.name} VENCEU!
                  </h2>
                  <p className="text-white text-lg">
                    Melhor de 3: {player1.name} {player1.score} x {player2.score} {player2.name}
                  </p>
                </div>
                <Button
                  onClick={handleNewGame}
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 py-3"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nova Partida
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Punishment Modal with 3 Options */}
      <PunishmentChoiceModal
        isOpen={showPunishment}
        onClose={() => setShowPunishment(false)}
        punishmentOptions={punishmentOptions}
        loserName={player1.score === 2 ? player2.name : player1.name}
      />
    </div>
  );
}

// Punishment Choice Modal Component
function PunishmentChoiceModal({ 
  isOpen, 
  onClose, 
  punishmentOptions, 
  loserName 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  punishmentOptions: any[], 
  loserName: string 
}) {
  const [selectedPunishment, setSelectedPunishment] = useState<any>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onClose();
    setSelectedPunishment(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-pink-400 mb-2">
              🔥 Hora do Castigo! 
            </h2>
            <p className="text-white text-lg">
              {loserName} perdeu a partida!
            </p>
            <p className="text-white/70 text-sm">
              Escolha 1 das 3 opções de castigo:
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {punishmentOptions.map((punishment, index) => (
              <button
                key={punishment.id}
                onClick={() => setSelectedPunishment(punishment)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  selectedPunishment?.id === punishment.id
                    ? 'border-pink-500 bg-pink-500/20'
                    : 'border-white/20 bg-white/5 hover:border-pink-500/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{index + 1}</div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2">
                      {punishment.title}
                    </h3>
                    <p className="text-white/80 text-sm mb-2">
                      {punishment.description}
                    </p>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        punishment.category === 'leve' ? 'bg-green-500/20 text-green-300' :
                        punishment.category === 'moderado' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {punishment.category}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                        {punishment.type}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {selectedPunishment && (
              <div className="p-4 bg-pink-500/20 rounded-lg border border-pink-500/50">
                <h4 className="text-pink-300 font-bold mb-2">Castigo Selecionado:</h4>
                <p className="text-white text-lg">{selectedPunishment.title}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button
                onClick={handleConfirm}
                disabled={!selectedPunishment}
                className="flex-1 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700"
              >
                {selectedPunishment ? 'Aceitar Castigo 😈' : 'Selecione um castigo'}
              </Button>
            </div>
          </div>
        </div>
      </div>
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
function SecretWordInputForm({ 
  playerName, 
  onWordSet, 
  availableWords, 
  getRandomWord 
}: { 
  playerName: string, 
  onWordSet: (word: string) => void,
  availableWords: string[],
  getRandomWord: () => string | null
}) {
  const [inputMode, setInputMode] = useState<'custom' | 'predefined'>('custom');
  const [customWord, setCustomWord] = useState('');
  const [selectedWord, setSelectedWord] = useState('');
  const [showCustomWord, setShowCustomWord] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customWord.trim() && customWord.trim().length >= 3) {
      onWordSet(customWord.trim().toUpperCase());
    }
  };

  const handlePredefinedSubmit = () => {
    if (selectedWord) {
      onWordSet(selectedWord);
    }
  };

  const handleRandomWord = () => {
    const randomWord = getRandomWord();
    if (randomWord) {
      onWordSet(randomWord);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-white font-bold text-lg">{playerName}</h3>
        <p className="text-white/70 text-sm">Escolha uma palavra secreta</p>
      </div>

      {/* Mode Selection */}
      <div className="flex rounded-lg bg-white/10 p-1 gap-1">
        <Button
          type="button"
          variant={inputMode === 'custom' ? 'default' : 'ghost'}
          className={`flex-1 text-xs sm:text-sm px-2 py-2 ${inputMode === 'custom' ? 'bg-blue-600' : 'text-white/70'}`}
          onClick={() => setInputMode('custom')}
        >
          <span className="hidden sm:inline">Palavra Personalizada</span>
          <span className="sm:hidden">Personalizada</span>
        </Button>
        <Button
          type="button"
          variant={inputMode === 'predefined' ? 'default' : 'ghost'}
          className={`flex-1 text-xs sm:text-sm px-2 py-2 ${inputMode === 'predefined' ? 'bg-purple-600' : 'text-white/70'}`}
          onClick={() => setInputMode('predefined')}
        >
          <span className="hidden sm:inline">Palavras Pré-cadastradas</span>
          <span className="sm:hidden">Pré-cadastradas</span>
        </Button>
      </div>

      {/* Custom Word Input */}
      {inputMode === 'custom' && (
        <form onSubmit={handleCustomSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type={showCustomWord ? "text" : "password"}
              value={customWord}
              onChange={(e) => setCustomWord(e.target.value)}
              placeholder="Digite a palavra secreta..."
              className="bg-white/10 border-white/20 text-white placeholder-white/50 pr-12"
              minLength={3}
              maxLength={20}
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomWord(!showCustomWord)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white p-1"
            >
              {showCustomWord ? '👁️' : '🔒'}
            </Button>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2 py-3"
            disabled={!customWord.trim() || customWord.trim().length < 3}
          >
            <Target className="h-4 w-4" />
            <span>Usar Esta Palavra</span>
          </Button>
        </form>
      )}

      {/* Predefined Words */}
      {inputMode === 'predefined' && (
        <div className="space-y-4">
          <div className="space-y-3">
            <Button
              onClick={handleRandomWord}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-2 py-3"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Palavra Aleatória</span>
            </Button>
            
            <div className="text-center text-white/60 text-sm">
              ou escolha uma palavra específica:
            </div>

            <div className="max-h-48 overflow-y-auto bg-white/5 rounded-lg border border-white/10">
              <div className="grid grid-cols-1 gap-1 p-2">
                {availableWords.slice(0, 20).map((word, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => setSelectedWord(word)}
                    className={`justify-start text-left h-auto py-2 px-3 ${
                      selectedWord === word 
                        ? 'bg-purple-500/30 text-purple-200 border border-purple-500/50' 
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    {word}
                  </Button>
                ))}
              </div>
            </div>

            {selectedWord && (
              <Button
                onClick={handlePredefinedSubmit}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Target className="h-4 w-4 mr-2" />
                Usar: {selectedWord}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}