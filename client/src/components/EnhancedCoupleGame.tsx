import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useHangman } from "@/lib/stores/useHangman";
import { usePunishments, type Punishment } from "@/lib/stores/usePunishments";
import { useWords } from "@/lib/stores/useWords";
import HangmanCanvas from "./HangmanCanvas";
import Keyboard from "./Keyboard";
// import PunishmentModal from './PunishmentModal'; // Removido, pois PunishmentChoiceModal é o utilizado
import CoupleSetup from "./CoupleSetup";
import { useCouple } from "@/lib/stores/useCouple";
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
  RefreshCw,
  Eye, // Adicionado para o input de palavra secreta
  EyeOff, // Adicionado para o input de palavra secreta
} from "lucide-react";
import { playSound } from "@/lib/utils/playSound";
// import { GameTimer } from '@/components/GameTimer'; // Removido, pois a lógica do timer foi consolidada aqui
import { useTimeConfig } from "@/lib/stores/useTimeConfig";
import {
  useDifficulty,
  getDifficultySettings,
} from "@/lib/stores/useDifficulty";

export default function EnhancedCoupleGame() {
  // Game state
  const { player1, player2, setPlayerNames, addScore, resetGame } = useCouple();
  const [currentPlayerId, setCurrentPlayerId] = useState<1 | 2>(1); // ID do jogador que está adivinhando
  const [isChallengerTurn, setIsChallengerTurn] = useState(true); // Indica se é a vez do desafiante escolher a palavra
  const [roundNumber, setRoundNumber] = useState(1);
  const [maxRounds] = useState(3); // Melhor de 3
  const { config: timeConfig } = useTimeConfig();
  const { level } = useDifficulty();
  const difficulty = getDifficultySettings(level);

  // Game phases
  const [gamePhase, setGamePhase] = useState<
    "setup" | "word-input" | "playing" | "result"
  >("setup");
  const [secretWord, setSecretWord] = useState("");

  // Timer
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef<number | null>(null); // Usar useRef para o ID do intervalo do timer

  // Hints
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedHints, setRevealedHints] = useState<string[]>([]);

  // Punishment modal with 3 options
  const [showPunishment, setShowPunishment] = useState(false);
  const [punishmentOptions, setPunishmentOptions] = useState<Punishment[]>([]);
  const [loserNameForPunishment, setLoserNameForPunishment] = useState("");

  const {
    currentWord,
    guessedLetters,
    wrongGuesses,
    gameState,
    guessLetter,
    newGame,
    getDisplayWord,
  } = useHangman();

  const { getRandomPunishment } = usePunishments();
  const { words, getRandomWord } = useWords();

  // Efeito para iniciar a fase de input da palavra se os nomes dos jogadores estiverem definidos
  useEffect(() => {
    if (player1.name && player2.name && gamePhase === "setup") {
      setGamePhase("word-input");
      // Na primeira rodada, o Player 2 é o desafiante.
      // O currentPlayerId indica quem vai ADIVINHAR (Player 1 na Rodada 1).
      setCurrentPlayerId(1);
      setIsChallengerTurn(true); // Player 2 será o desafiante para esta rodada
    }
  }, [player1.name, player2.name, gamePhase]);

  // Efeito do Timer
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      // O timer só deve acionar handleTimeUp se ele realmente terminou
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive, timeLeft]);

  // Observador do estado do jogo (ganhou/perdeu)
  useEffect(() => {
    if (gameState === "won" || gameState === "lost") {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setTimerActive(false);
      handleGameEnd();
    }
  }, [gameState]); // Depende apenas de gameState para evitar re-execuções desnecessárias

  const collectPunishments = (desired: number): Punishment[] => {
    const options: Punishment[] = [];
    const seenIds = new Set<string>();

    // Proteção contra loop infinito se não houver punições suficientes
    let attempts = 0;
    const maxAttempts = usePunishments.getState().punishments.length * 2; // Tenta o dobro do número de punições existentes

    while (options.length < desired && attempts < maxAttempts) {
      const punishment = getRandomPunishment();
      if (punishment && !seenIds.has(punishment.id)) {
        options.push(punishment);
        seenIds.add(punishment.id);
      }
      attempts++;
    }

    if (options.length < desired) {
      console.warn(
        "Não foi possível coletar o número desejado de castigos únicos.",
      );
    }
    return options;
  };

  const getCurrentPlayerInfo = () =>
    currentPlayerId === 1 ? player1 : player2;
  const getOtherPlayerInfo = () => (currentPlayerId === 1 ? player2 : player1);

  const handleWordSet = (word: string) => {
    setSecretWord(word);
    newGame(word); // Inicializa o jogo da forca com a nova palavra
    setGamePhase("playing");

    // Inicializa o timer com a configuração
    if (timeConfig.enabled) {
      const initialTime = Math.round(
        timeConfig.initialTime * difficulty.timeMultiplier,
      );
      setTimeLeft(initialTime);
      setTimerActive(true);
    } else {
      setTimerActive(false); // Desativa o timer se não estiver habilitado
    }
  };

  const handleTimeUp = () => {
    if (timerActive) {
      // Garante que a lógica só é aplicada se o timer estava ativo
      setTimerActive(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Se o tempo acabar enquanto o Adivinhador está jogando, ele perde
      if (!isChallengerTurn && gameState === "playing") {
        handleGameEnd(true); // Força a perda para o Adivinhador
      }
      // Se o tempo acabar em outra fase (como word-input), não é uma perda de jogo
      // pois o timer só está ativo na fase 'playing' para o adivinhador.
    }
  };

  const handleGameEnd = (forceLoss = false) => {
    // Parar o timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerActive(false);

    let winnerPlayerIdForRound: 1 | 2;
    let loserPlayerName: string;

    // Determina quem era o desafiante e adivinhador na rodada que acabou
    const guesserForRound =
      (currentPlayerId === 1 && !isChallengerTurn) ||
      (currentPlayerId === 2 && isChallengerTurn)
        ? player1
        : player2;
    const challengerForRound =
      (currentPlayerId === 1 && isChallengerTurn) ||
      (currentPlayerId === 2 && !isChallengerTurn)
        ? player1
        : player2;

    if (gameState === "won" && !forceLoss) {
      // O Adivinhador (guesserForRound) ganhou
      winnerPlayerIdForRound = guesserForRound.id;
      loserPlayerName = challengerForRound.name;
      addScore(guesserForRound.id);
      playSound("victory");
    } else {
      // O Adivinhador (guesserForRound) perdeu (erros esgotados ou tempo esgotado)
      winnerPlayerIdForRound = challengerForRound.id;
      loserPlayerName = guesserForRound.name;
      addScore(challengerForRound.id);
      playSound("defeat");
    }

    // Calcula os scores atualizados para verificar a vitória da partida
    const currentP1Score =
      player1.score + (player1.id === winnerPlayerIdForRound ? 1 : 0);
    const currentP2Score =
      player2.score + (player2.id === winnerPlayerIdForRound ? 1 : 0);

    // Só mostra o castigo quando alguém alcança 2 vitórias
    if (currentP1Score >= 2 || currentP2Score >= 2) {
      const options = collectPunishments(3);
      if (options.length > 0) {
        setPunishmentOptions(options);
        setLoserNameForPunishment(loserPlayerName); // Define o nome do perdedor para o modal
        setShowPunishment(true);
      }
    }

    setGamePhase("result");
  };

  const handleNextRound = () => {
    // Verifica se alguém já ganhou a partida (melhor de 3)
    if (player1.score >= 2 || player2.score >= 2) {
      return; // A partida já acabou, não deve ir para a próxima rodada
    }

    // Alterna o número da rodada
    setRoundNumber((prev) => prev + 1);

    // Define quem é o desafiante e o adivinhador na PRÓXIMA rodada
    // Se a rodada atual é ímpar (1), na próxima (2) o Player 1 será o desafiante.
    // Se a rodada atual é par (2), na próxima (3) o Player 2 será o desafiante.
    const isNextRoundChallengerPlayer1 = (roundNumber + 1) % 2 === 0;

    if (isNextRoundChallengerPlayer1) {
      setIsChallengerTurn(true); // Player 1 será o desafiante
      setCurrentPlayerId(2); // Player 2 será o adivinhador (quem joga)
    } else {
      setIsChallengerTurn(true); // Player 2 será o desafiante
      setCurrentPlayerId(1); // Player 1 será o adivinhador (quem joga)
    }

    setGamePhase("word-input"); // Volta para a fase de escolha da palavra
    setSecretWord(""); // Limpa a palavra secreta anterior
    setHintsUsed(0);
    setRevealedHints([]);
    // Reinicia o tempo para a próxima rodada com base na configuração e dificuldade
    setTimeLeft(
      timeConfig.enabled
        ? Math.round(timeConfig.initialTime * difficulty.timeMultiplier)
        : 0,
    );
  };

  const handleNewGame = () => {
    setPlayerNames("", "");
    resetGame();
    setCurrentPlayerId(1); // Player 1 começa como adivinhador
    setIsChallengerTurn(true); // Player 2 será o desafiante na primeira rodada
    setRoundNumber(1);
    setGamePhase("setup");
    setSecretWord("");
    setHintsUsed(0);
    setRevealedHints([]);
    setTimeLeft(0); // Reinicia o timer
    setTimerActive(false);
    if (timerRef.current) {
      // Limpa qualquer timer restante
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setShowPunishment(false); // Esconde o modal de castigo
    setPunishmentOptions([]); // Limpa as opções de castigo
    setLoserNameForPunishment("");
  };

  const getHints = (word: string) => {
    const hints = [];
    const cleanWord = word.toUpperCase();

    // Hint 1: Length and category
    if (cleanWord.length <= 5) {
      hints.push(`💫 Palavra curta e doce (${cleanWord.length} letras)`);
    } else if (cleanWord.length <= 8) {
      hints.push(
        `🔥 Palavra de intensidade média (${cleanWord.length} letras)`,
      );
    } else {
      hints.push(`💋 Palavra longa e apaixonada (${cleanWord.length} letras)`);
    }

    // Hint 2: First letter
    hints.push(`🎯 Começa com a letra "${cleanWord[0]}"`);

    // Hint 3: Vowels
    const vowels = cleanWord.match(/[AEIOU]/g);
    if (vowels && vowels.length > 0) {
      // Garante que há vogais para evitar erro
      const uniqueVowels = Array.from(new Set(vowels));
      hints.push(`🎵 Contém as vogais: ${uniqueVowels.join(", ")}`);
    } else {
      hints.push(`🎵 Não contém vogais comuns`);
    }

    return hints;
  };

  const handleUseHint = () => {
    if (hintsUsed < 3 && timerActive) {
      // Só permite usar dica se o timer estiver ativo
      const hints = getHints(secretWord);
      // Garante que não tentamos acessar um índice de hint que não existe
      if (hintsUsed < hints.length) {
        setRevealedHints((prev) => [...prev, hints[hintsUsed]]);
        setHintsUsed((prev) => prev + 1);
        setTimeLeft((prev) => Math.max(prev - 10, 0)); // Penalidade: -10 segundos
        playSound("hint"); // Adicionar som para a dica
      }
    }
  };

  const handleLetterGuess = (letter: string) => {
    if (gameState === "playing" && timerActive) {
      // Só permite adivinhar se o jogo está ativo e o timer rodando
      const wasCorrect = currentWord.includes(letter.toUpperCase());
      guessLetter(letter);

      // Aplica bônus/penalidade de tempo
      if (timeConfig.enabled) {
        if (wasCorrect) {
          setTimeLeft((prev) => prev + timeConfig.bonusPerCorrect);
        } else {
          setTimeLeft((prev) => Math.max(0, prev - timeConfig.penaltyPerWrong));
        }
      }

      // Play sound after a small delay to allow state update
      setTimeout(() => {
        playSound(wasCorrect ? "correct" : "wrong");
      }, 100);
    }
  };

  // Setup Phase - Names input
  if (gamePhase === "setup") {
    return <CoupleSetup onComplete={() => setGamePhase("word-input")} />;
  }

  // Determine current challenger/guesser for display purposes
  // Adivinhador é o currentPlayerId. O desafiante é o outro.
  const currentGuesser = currentPlayerId === 1 ? player1 : player2;
  const currentChallenger = currentPlayerId === 1 ? player2 : player1;

  // Word Input Phase - Simplified
  if (gamePhase === "word-input") {
    return (
      <div className="max-w-lg mx-auto space-y-4 p-4">
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-white flex items-center justify-center gap-2">
              <Crown className="h-5 w-5 text-yellow-400" />
              Rodada {roundNumber}
            </CardTitle>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50 mt-2">
              🎯 {currentChallenger.name} - DESAFIANTE: Escolha uma palavra
              secreta
            </Badge>
            <div className="text-white/60 text-xs mt-2 bg-blue-500/10 rounded p-2">
              {currentChallenger.name} escolhe uma palavra que{" "}
              {currentGuesser.name} deve adivinhar
            </div>
          </CardHeader>
          <CardContent>
            <SecretWordInputForm
              playerName={currentChallenger.name} // Passa o nome do desafiante
              onWordSet={handleWordSet}
              availableWords={words}
              getRandomWord={getRandomWord}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  const timePercentage =
    (timeLeft /
      (timeConfig.enabled
        ? Math.round(timeConfig.initialTime * difficulty.timeMultiplier)
        : 60)) *
    100;

  return (
    <div className="max-w-6xl mx-auto space-y-2 p-2">
      {/* Header com Timer - Compacto */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardContent className="p-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="text-center">
                <Crown className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
                <div className="text-white font-bold text-xs">
                  Rodada {roundNumber}/3
                </div>
                <div className="text-white/60 text-xs">Melhor de 3</div>
              </div>

              {/* Timer - Mais proeminente no mobile */}
              {timeConfig.enabled && (
                <div className="flex flex-col items-center bg-black/30 rounded-lg p-2 min-w-[80px]">
                  <Timer
                    className={`h-4 w-4 mb-1 ${timeLeft > 20 ? "text-green-400" : timeLeft > 10 ? "text-yellow-400" : "text-red-400"}`}
                  />
                  <div
                    className={`font-mono font-bold text-lg ${timeLeft > 20 ? "text-green-400" : timeLeft > 10 ? "text-yellow-400" : "text-red-400"}`}
                  >
                    {Math.floor(timeLeft / 60)}:
                    {(timeLeft % 60).toString().padStart(2, "0")}
                  </div>
                  <div className="w-16 h-1 rounded-full bg-white/20 overflow-hidden mt-1">
                    <div
                      className={`h-full transition-all duration-1000 ${
                        timeLeft > 20
                          ? "bg-green-400"
                          : timeLeft > 10
                            ? "bg-yellow-400"
                            : "bg-red-400"
                      }`}
                      style={{ width: `${timePercentage}%` }}
                    />
                  </div>
                </div>
              )}
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
            {/* Jogador Adivinhador */}
            <div
              className={`flex-1 p-2 rounded-lg border-2 text-center transition-all ${
                // Se o currentPlayerId é o adivinhador (quem está jogando agora)
                // e não é a vez do desafiante escolher a palavra, então ele é o "active guesser"
                gamePhase === "playing"
                  ? "border-green-500 bg-green-500/20"
                  : "border-white/20 bg-white/5"
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-green-400" />
              </div>
              <h3 className="text-white font-bold text-sm mb-1">
                {currentGuesser.name}
              </h3>
              <Badge
                className={`text-xs mb-1 ${
                  gamePhase === "playing"
                    ? "bg-green-500/20 text-green-300 border-green-500/50"
                    : "bg-white/10 text-white/60 border-white/20"
                }`}
              >
                Adivinhador
              </Badge>
              <div className="flex items-center justify-center gap-1">
                <Trophy className="h-3 w-3 text-yellow-400" />
                <span className="text-white font-bold text-sm">
                  {currentGuesser.score}
                </span>
              </div>
            </div>

            <div className="text-white/40 text-lg">VS</div>

            {/* Jogador Desafiante */}
            <div
              className={`flex-1 p-2 rounded-lg border-2 text-center transition-all ${
                // Se é a vez do desafiante escolher a palavra (word-input)
                // ou se ele é o "active challenger" na rodada de jogo
                gamePhase === "word-input"
                  ? "border-blue-500 bg-blue-500/20"
                  : "border-white/20 bg-white/5"
              }`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <Sword className="h-4 w-4 text-blue-400" />
              </div>
              <h3 className="text-white/70 font-bold text-sm mb-1">
                {currentChallenger.name}
              </h3>
              <Badge
                className={`text-xs mb-1 ${
                  gamePhase === "word-input"
                    ? "bg-blue-500/20 text-blue-300 border-blue-500/50"
                    : "bg-white/10 text-white/60 border-white/20"
                }`}
              >
                Desafiante
              </Badge>
              <div className="flex items-center justify-center gap-1">
                <Trophy className="h-3 w-3 text-white/40" />
                <span className="text-white/70 font-bold text-sm">
                  {currentChallenger.score}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LAYOUT PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {/* COLUNA ESQUERDA: DICAS + FORCA */}
        <div className="space-y-2">
          {gamePhase === "playing" && (
            <div className="space-y-2">
              <Card className="bg-black/20 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white flex items-center justify-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-400" />
                    💡 Dicas ({hintsUsed}/3)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {revealedHints.map((hint, index) => (
                    <div
                      key={index}
                      className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300"
                    >
                      {hint}
                    </div>
                  ))}

                  {hintsUsed < 3 && (
                    <Button
                      onClick={handleUseHint}
                      className="w-full bg-yellow-600 hover:bg-yellow-700 py-3 text-sm flex items-center justify-center gap-2"
                      disabled={!timerActive || gameState !== "playing"} // Desabilita se o timer não estiver ativo ou jogo não está "playing"
                    >
                      <Clock className="h-4 w-4" />
                      <span>Usar Dica (-10s)</span>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* FORCA */}
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardContent className="p-2">
              <div className="flex justify-center">
                <div className="w-72 h-72 md:w-80 md:h-80">
                  <HangmanCanvas wrongGuesses={wrongGuesses} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: PALAVRA + TECLADO */}
        <div className="space-y-2">
          {/* PALAVRA SECRETA */}
          <Card className="bg-black/20 backdrop-blur-sm border-white/10">
            <CardContent className="p-3 text-center">
              <div className="mb-2">
                <div className="text-white/70 text-xs mb-1">
                  Palavra Secreta:
                </div>
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
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      gameState === "playing"
                        ? "bg-green-500/20 text-green-300"
                        : gameState === "won"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {gameState === "playing"
                      ? "Jogando"
                      : gameState === "won"
                        ? "Ganhou!"
                        : "Perdeu!"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TECLADO */}
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
                disabled={
                  gameState !== "playing" || !timerActive || !secretWord
                } // Desabilita se o timer não estiver ativo ou sem palavra
              />

              <div className="mt-4 space-y-2">
                <div className="text-center py-2 bg-green-500/10 rounded-lg">
                  <p className="text-green-300 text-sm">
                    💡 Clique nas letras para adivinhar a palavra!
                  </p>
                </div>
                <div className="text-center py-2 bg-blue-500/10 rounded-lg">
                  <p className="text-blue-300 text-xs">
                    🎮 REGRAS: ADIVINHADOR descobre a palavra | DESAFIANTE
                    escolhe a palavra | Melhor de 3 rodadas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Game Result */}
      {gamePhase === "result" && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="p-6 text-center">
            {gameState === "won" ? (
              <div>
                <Trophy className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-2xl text-white font-bold mb-2">
                  {currentGuesser.name} (Adivinhador) Ganhou a rodada!
                </h3>
                <p className="text-white/70 mb-4">
                  A palavra era:{" "}
                  <span className="text-white font-mono">{secretWord}</span>
                </p>
              </div>
            ) : (
              <div>
                <Heart className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-2xl text-white font-bold mb-2">
                  {currentChallenger.name} (Desafiante) Ganhou a rodada!
                </h3>
                <p className="text-white/70 mb-4">
                  A palavra era:{" "}
                  <span className="text-white font-mono">{secretWord}</span>
                </p>
                <p className="text-pink-300 text-sm">
                  {timeLeft === 0 ? "Tempo esgotado! " : ""}
                  {player1.score < 2 && player2.score < 2
                    ? "Só castigo no final! 😈"
                    : "Hora do castigo! 😈"}
                </p>
              </div>
            )}

            {player1.score < 2 && player2.score < 2 ? (
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
                    🏆 {player1.score >= 2 ? player1.name : player2.name} VENCEU
                    A PARTIDA!
                  </h2>
                  <p className="text-white text-lg">
                    Placar Final: {player1.name} {player1.score} x{" "}
                    {player2.score} {player2.name}
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

      {/* Punishment Modal com 3 opções */}
      <PunishmentChoiceModal
        isOpen={showPunishment}
        onClose={() => setShowPunishment(false)}
        punishmentOptions={punishmentOptions}
        loserName={loserNameForPunishment} // Passa o nome do perdedor diretamente
      />
    </div>
  );
}

// Punishment Choice Modal Component
function PunishmentChoiceModal({
  isOpen,
  onClose,
  punishmentOptions,
  loserName,
}: {
  isOpen: boolean;
  onClose: () => void;
  punishmentOptions: Punishment[]; // Tipo correto
  loserName: string;
}) {
  const [selectedPunishment, setSelectedPunishment] =
    useState<Punishment | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    // Aqui você pode adicionar lógica para o que acontece quando o castigo é "aceito"
    // Por exemplo, registrar que o castigo foi aplicado, etc.
    onClose();
    setSelectedPunishment(null); // Limpa a seleção após fechar
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-black/90 backdrop-blur-sm rounded-lg border border-white/20 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-pink-400 mb-2">
              🔥 Hora do Castigo!
            </h2>
            <p className="text-white text-lg">{loserName} perdeu a partida!</p>
            <p className="text-white/70 text-sm">
              Escolha 1 das 3 opções de castigo:
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {punishmentOptions.map(
              (
                punishment, // Removido o 'index' pois o 'id' é mais único
              ) => (
                <button
                  key={punishment.id} // Usar punishment.id para a key
                  onClick={() => setSelectedPunishment(punishment)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedPunishment?.id === punishment.id
                      ? "border-pink-500 bg-pink-500/20"
                      : "border-white/20 bg-white/5 hover:border-pink-500/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      {punishmentOptions.indexOf(punishment) + 1}
                    </div>{" "}
                    {/* Número da opção */}
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-2">
                        {punishment.title}
                      </h3>
                      <p className="text-white/80 text-sm mb-2">
                        {punishment.description}
                      </p>
                      <div className="flex gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            punishment.category === "leve"
                              ? "bg-green-500/20 text-green-300"
                              : punishment.category === "moderado"
                                ? "bg-yellow-500/20 text-yellow-300"
                                : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {punishment.category}
                        </span>
                        <span className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300">
                          {punishment.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ),
            )}
          </div>

          <div className="space-y-3">
            {selectedPunishment && (
              <div className="p-4 bg-pink-500/20 rounded-lg border border-pink-500/50">
                <h4 className="text-pink-300 font-bold mb-2">
                  Castigo Selecionado:
                </h4>
                <p className="text-white text-lg">{selectedPunishment.title}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleConfirm}
                disabled={!selectedPunishment}
                className="flex-1 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700"
              >
                {selectedPunishment
                  ? "Aceitar Castigo 😈"
                  : "Selecione um castigo"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Secret Word Input Form Component
function SecretWordInputForm({
  playerName,
  onWordSet,
  availableWords,
  getRandomWord,
}: {
  playerName: string;
  onWordSet: (word: string) => void;
  availableWords: string[];
  getRandomWord: () => string | null;
}) {
  const [inputMode, setInputMode] = useState<"custom" | "predefined">("custom");
  const [customWord, setCustomWord] = useState("");
  const [selectedWord, setSelectedWord] = useState("");
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
      onWordSet(randomWord.toUpperCase()); // Garante que a palavra aleatória também seja maiúscula
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h3 className="text-white font-bold text-lg">{playerName}</h3>
        <p className="text-white/70 text-sm">Escolha uma palavra secreta</p>
      </div>

      {/* Seleção de Modo */}
      <div className="flex rounded-lg bg-white/10 p-1 gap-1">
        <Button
          type="button"
          variant={inputMode === "custom" ? "default" : "ghost"}
          className={`flex-1 text-xs sm:text-sm px-2 py-2 ${inputMode === "custom" ? "bg-blue-600" : "text-white/70"}`}
          onClick={() => setInputMode("custom")}
        >
          <span className="hidden sm:inline">Palavra Personalizada</span>
          <span className="sm:hidden">Personalizada</span>
        </Button>
        <Button
          type="button"
          variant={inputMode === "predefined" ? "default" : "ghost"}
          className={`flex-1 text-xs sm:text-sm px-2 py-2 ${inputMode === "predefined" ? "bg-purple-600" : "text-white/70"}`}
          onClick={() => setInputMode("predefined")}
        >
          <span className="hidden sm:inline">Palavras Pré-cadastradas</span>
          <span className="sm:hidden">Pré-cadastradas</span>
        </Button>
      </div>

      {/* Input de Palavra Personalizada */}
      {inputMode === "custom" && (
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
              {showCustomWord ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
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

      {/* Palavras Pré-definidas */}
      {inputMode === "predefined" && (
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
                {/* Limita a 20 palavras para evitar uma lista muito longa no scroll */}
                {availableWords.slice(0, 20).map((word, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => setSelectedWord(word)}
                    className={`justify-start text-left h-auto py-2 px-3 ${
                      selectedWord === word
                        ? "bg-purple-500/30 text-purple-200 border border-purple-500/50"
                        : "text-white/80 hover:bg-white/10"
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
