import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCouple } from '@/lib/stores/useCouple';
import CoupleSetup from './CoupleSetup';
import { User, Heart, Play, Settings } from 'lucide-react';

interface GameModeSelectorProps {
  onModeSelected: () => void;
}

export default function GameModeSelector({ onModeSelected }: GameModeSelectorProps) {
  const { gameMode, setGameMode, player1, player2 } = useCouple();
  const [showCoupleSetup, setShowCoupleSetup] = useState(false);

  const handleSinglePlayerMode = () => {
    setGameMode('single');
    onModeSelected();
  };

  const handleCoupleMode = () => {
    // If couple names are already set, go directly to game
    if (player1.name && player2.name) {
      setGameMode('couple');
      onModeSelected();
    } else {
      // Otherwise, show setup screen
      setGameMode('couple');
      setShowCoupleSetup(true);
    }
  };

  const handleCoupleSetupComplete = () => {
    setShowCoupleSetup(false);
    onModeSelected();
  };

  if (showCoupleSetup) {
    return <CoupleSetup onComplete={handleCoupleSetupComplete} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-white text-2xl sm:text-3xl">
            Escolha o Modo de Jogo
          </CardTitle>
          <p className="text-white/80 text-sm sm:text-base">
            Como você gostaria de jogar hoje?
          </p>
        </CardHeader>
      </Card>

      {/* Game Mode Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Single Player Mode */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="p-4 bg-blue-500/20 rounded-full group-hover:bg-blue-500/30 transition-colors">
                <User className="h-8 w-8 text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-white text-xl">Modo Solo</CardTitle>
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50 mx-auto">
              Clássico
            </Badge>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-white font-medium">Características:</h4>
              <ul className="text-white/80 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Jogue sozinho contra palavras aleatórias
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Castigos surpresa quando perder
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Perfeito para aquecimento
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  Estatísticas pessoais
                </li>
              </ul>
            </div>
            
            <Button
              onClick={handleSinglePlayerMode}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-6"
            >
              <Play className="h-4 w-4 mr-2" />
              Jogar Solo
            </Button>
          </CardContent>
        </Card>

        {/* Couple Mode */}
        <Card className="bg-black/20 backdrop-blur-sm border-white/10 hover:border-pink-500/50 transition-all duration-300 cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <div className="p-4 bg-pink-500/20 rounded-full group-hover:bg-pink-500/30 transition-colors">
                <Heart className="h-8 w-8 text-pink-400" />
              </div>
            </div>
            <CardTitle className="text-white text-xl">Modo Casal</CardTitle>
            <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/50 mx-auto">
              Recomendado
            </Badge>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-white font-medium">Características:</h4>
              <ul className="text-white/80 text-sm space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-1">•</span>
                  Um cria a palavra, outro adivinha
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-1">•</span>
                  Papéis alternam a cada rodada
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-1">•</span>
                  Castigos personalizados para quem perde
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-pink-400 mt-1">•</span>
                  Placar competitivo entre vocês
                </li>
              </ul>
            </div>
            
            {/* Show existing couple info if available */}
            {player1.name && player2.name && (
              <div className="bg-pink-500/20 border border-pink-500/50 rounded-lg p-3">
                <p className="text-pink-300 text-sm text-center">
                  Configurado: {player1.name} vs {player2.name}
                </p>
                <p className="text-white/60 text-xs text-center mt-1">
                  Placar: {player1.score} - {player2.score}
                </p>
              </div>
            )}
            
            <Button
              onClick={handleCoupleMode}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white mt-6"
            >
              {player1.name && player2.name ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Continuar Jogo do Casal
                </>
              ) : (
                <>
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Casal
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Current Selection */}
      {gameMode !== 'single' && (
        <Card className="bg-black/20 backdrop-blur-sm border-white/10">
          <CardContent className="pt-6 text-center">
            <p className="text-white/70 text-sm">
              Modo atual: <span className="text-white font-medium">
                {gameMode === 'couple' ? 'Casal' : 'Solo'}
              </span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}