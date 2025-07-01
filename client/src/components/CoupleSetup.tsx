import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCouple } from '@/lib/stores/useCouple';
import { Heart, Users, Settings, Play } from 'lucide-react';

interface CoupleSetupProps {
  onComplete: () => void;
}

export default function CoupleSetup({ onComplete }: CoupleSetupProps) {
  const { 
    setPlayerNames, 
    setMaxWrongGuesses, 
    maxWrongGuesses,
    player1,
    player2 
  } = useCouple();
  
  const [player1Name, setPlayer1Name] = useState(player1.name || '');
  const [player2Name, setPlayer2Name] = useState(player2.name || '');
  const [currentMaxGuesses, setCurrentMaxGuesses] = useState(maxWrongGuesses);

  const handleStart = () => {
    if (player1Name.trim() && player2Name.trim()) {
      setPlayerNames(player1Name.trim(), player2Name.trim());
      setMaxWrongGuesses(currentMaxGuesses);
      onComplete();
    }
  };

  const isFormValid = player1Name.trim() && player2Name.trim();

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      {/* Header */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2 text-2xl">
            <Heart className="h-6 w-6 text-pink-400" />
            Modo Casal
            <Heart className="h-6 w-6 text-pink-400" />
          </CardTitle>
          <p className="text-white/80 text-sm">
            Configure os nomes do casal e as preferências do jogo
          </p>
        </CardHeader>
      </Card>

      {/* Players Names */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Nomes dos Jogadores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="player1" className="text-white">
                Jogador 1
              </Label>
              <Input
                id="player1"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Digite o nome do primeiro jogador..."
                className="bg-white/10 border-white/20 text-white placeholder-white/50"
                maxLength={20}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="player2" className="text-white">
                Jogador 2
              </Label>
              <Input
                id="player2"
                value={player2Name}
                onChange={(e) => setPlayer2Name(e.target.value)}
                placeholder="Digite o nome do segundo jogador..."
                className="bg-white/10 border-white/20 text-white placeholder-white/50"
                maxLength={20}
              />
            </div>
          </div>
          
          {isFormValid && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 mt-4">
              <p className="text-green-300 text-sm text-center">
                🎮 {player1Name} vs {player2Name} - Prontos para jogar!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Game Settings */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações do Jogo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-white">Limite de Erros</Label>
            <div className="flex flex-wrap gap-2">
              {[6, 7, 8, 9, 10].map((num) => (
                <Button
                  key={num}
                  variant={currentMaxGuesses === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentMaxGuesses(num)}
                  className={
                    currentMaxGuesses === num
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "border-white/20 text-white hover:bg-white/10"
                  }
                >
                  {num} erros
                </Button>
              ))}
            </div>
            <p className="text-white/60 text-xs">
              Mais erros = jogo mais fácil
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Game Rules */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white text-lg">Como Funciona o Modo Casal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                Desafiante
              </Badge>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Escolhe a palavra secreta</li>
                <li>• Não pode dar dicas</li>
                <li>• Ganha se o parceiro errar</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
                Adivinhador
              </Badge>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Tenta adivinhar a palavra</li>
                <li>• Pode chutar letras ou palavra</li>
                <li>• Ganha se acertar antes dos erros</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-pink-500/20 border border-pink-500/50 rounded-lg p-3 mt-4">
            <p className="text-pink-300 text-sm">
              💕 <strong>Dica:</strong> Quem perde deve cumprir um castigo! Os papéis alternam a cada rodada.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Start Button */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardContent className="pt-6">
          <Button
            onClick={handleStart}
            disabled={!isFormValid}
            className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-3 text-lg"
          >
            <Play className="h-5 w-5 mr-2" />
            Começar Jogo do Casal
          </Button>
          
          {!isFormValid && (
            <p className="text-white/60 text-sm text-center mt-2">
              Preencha os nomes dos dois jogadores para começar
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}