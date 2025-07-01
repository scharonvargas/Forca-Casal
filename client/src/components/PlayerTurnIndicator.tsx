import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCouple } from '@/lib/stores/useCouple';
import { 
  Crown, 
  Target, 
  Sword, 
  Shield, 
  Zap,
  Timer,
  User
} from 'lucide-react';

export default function PlayerTurnIndicator() {
  const {
    getCurrentPlayer,
    getOtherPlayer,
    isCurrentPlayerChallenger,
    roundNumber
  } = useCouple();

  const currentPlayer = getCurrentPlayer();
  const otherPlayer = getOtherPlayer();

  return (
    <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm border-purple-500/30 shadow-xl">
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown className="h-6 w-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white">RODADA {roundNumber}</h2>
            <Crown className="h-6 w-6 text-yellow-400" />
          </div>
          <div className="flex items-center justify-center gap-1">
            <Timer className="h-4 w-4 text-purple-300" />
            <span className="text-purple-300 text-sm">Modo Casal Ativo</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Player (Active) */}
          <div className={`p-4 rounded-xl border-2 transition-all duration-500 ${
            isCurrentPlayerChallenger() 
              ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/30' 
              : 'border-green-400 bg-green-500/20 shadow-lg shadow-green-500/30'
          }`}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                {isCurrentPlayerChallenger() ? (
                  <Sword className="h-6 w-6 text-blue-400 animate-pulse" />
                ) : (
                  <Target className="h-6 w-6 text-green-400 animate-pulse" />
                )}
                <User className="h-5 w-5 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{currentPlayer.name}</h3>
              
              <Badge className={`mb-3 ${
                isCurrentPlayerChallenger() 
                  ? 'bg-blue-500/30 text-blue-200 border-blue-400/50' 
                  : 'bg-green-500/30 text-green-200 border-green-400/50'
              }`}>
                {isCurrentPlayerChallenger() ? 'DESAFIANTE' : 'ADIVINHADOR'}
              </Badge>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Zap className={`h-4 w-4 ${
                    isCurrentPlayerChallenger() ? 'text-blue-400' : 'text-green-400'
                  } animate-pulse`} />
                  <span className="text-white font-bold">SUA VEZ!</span>
                </div>
                
                <div className="text-xs text-white/70">
                  {isCurrentPlayerChallenger() 
                    ? 'Escolha uma palavra secreta' 
                    : 'Tente adivinhar a palavra'}
                </div>
                
                <div className="bg-white/10 rounded-lg p-2 mt-3">
                  <div className="text-white text-sm font-medium">Pontuação</div>
                  <div className="text-2xl font-bold text-yellow-400">{currentPlayer.score}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Other Player (Waiting) */}
          <div className="p-4 rounded-xl border-2 border-white/20 bg-white/5 transition-all duration-500">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                {!isCurrentPlayerChallenger() ? (
                  <Sword className="h-6 w-6 text-white/40" />
                ) : (
                  <Target className="h-6 w-6 text-white/40" />
                )}
                <User className="h-5 w-5 text-white/40" />
              </div>
              
              <h3 className="text-xl font-bold text-white/70 mb-2">{otherPlayer.name}</h3>
              
              <Badge className="bg-white/10 text-white/60 border-white/20 mb-3">
                {!isCurrentPlayerChallenger() ? 'DESAFIANTE' : 'ADIVINHADOR'}
              </Badge>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Timer className="h-4 w-4 text-white/40" />
                  <span className="text-white/60">Aguardando...</span>
                </div>
                
                <div className="text-xs text-white/50">
                  {!isCurrentPlayerChallenger() 
                    ? 'Aguardando palavra secreta' 
                    : 'Vez do parceiro adivinhar'}
                </div>
                
                <div className="bg-white/5 rounded-lg p-2 mt-3">
                  <div className="text-white/60 text-sm font-medium">Pontuação</div>
                  <div className="text-2xl font-bold text-white/40">{otherPlayer.score}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Current Game Phase Instructions */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg border border-purple-500/30">
          <div className="text-center">
            <h4 className="text-white font-bold mb-2">
              {isCurrentPlayerChallenger() ? '🎯 FASE: CRIAÇÃO DA PALAVRA' : '🔍 FASE: ADIVINHAÇÃO'}
            </h4>
            <p className="text-white/80 text-sm">
              {isCurrentPlayerChallenger() 
                ? `${currentPlayer.name}, escolha uma palavra secreta para ${otherPlayer.name} adivinhar!`
                : `${currentPlayer.name}, use dicas estratégicas e tente adivinhar a palavra de ${otherPlayer.name}!`
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}