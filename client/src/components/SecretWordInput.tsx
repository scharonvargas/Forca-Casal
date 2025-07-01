import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCouple } from '@/lib/stores/useCouple';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

interface SecretWordInputProps {
  onWordSet: (word: string) => void;
}

export default function SecretWordInput({ onWordSet }: SecretWordInputProps) {
  const { getCurrentPlayer, getOtherPlayer, isCurrentPlayerChallenger, roundNumber } = useCouple();
  const [secretWord, setSecretWord] = useState('');
  const [showWord, setShowWord] = useState(false);
  const [error, setError] = useState('');

  const currentPlayer = getCurrentPlayer();
  const otherPlayer = getOtherPlayer();

  const validateWord = (word: string): boolean => {
    const cleanWord = word.trim().toUpperCase();
    
    if (cleanWord.length < 3) {
      setError('A palavra deve ter pelo menos 3 letras');
      return false;
    }
    
    if (cleanWord.length > 20) {
      setError('A palavra deve ter no máximo 20 letras');
      return false;
    }
    
    if (!/^[A-ZÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇÑ]+$/.test(cleanWord)) {
      setError('Use apenas letras (sem números ou símbolos)');
      return false;
    }
    
    setError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateWord(secretWord)) {
      onWordSet(secretWord.trim().toUpperCase());
    }
  };

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSecretWord(value);
    if (error && validateWord(value)) {
      setError('');
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6 p-4">
      {/* Header */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2 text-xl">
            <Lock className="h-5 w-5 text-yellow-400" />
            Palavra Secreta
          </CardTitle>
          <div className="flex justify-center gap-2 mt-2">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
              Rodada {roundNumber}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Players Status */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <User className="h-4 w-4 text-blue-400" />
                <span className="text-white font-medium">{currentPlayer.name}</span>
              </div>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/50">
                Desafiante
              </Badge>
              <p className="text-white/60 text-xs mt-1">Cria a palavra</p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <User className="h-4 w-4 text-green-400" />
                <span className="text-white font-medium">{otherPlayer.name}</span>
              </div>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/50">
                Adivinhador
              </Badge>
              <p className="text-white/60 text-xs mt-1">Tenta adivinhar</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secret Word Form */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">
            {currentPlayer.name}, escolha uma palavra secreta
          </CardTitle>
          <p className="text-white/70 text-sm">
            {otherPlayer.name} tentará adivinhar sua palavra!
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="secretWord" className="text-white">
                Palavra Secreta
              </Label>
              <div className="relative">
                <Input
                  id="secretWord"
                  type={showWord ? "text" : "password"}
                  value={secretWord}
                  onChange={handleWordChange}
                  placeholder="Digite a palavra secreta..."
                  className="bg-white/10 border-white/20 text-white placeholder-white/50 pr-12"
                  maxLength={20}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWord(!showWord)}
                  className="absolute right-1 top-1 h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                >
                  {showWord ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              
              <div className="text-white/60 text-xs">
                • 3-20 letras • Apenas letras (sem números ou símbolos)
              </div>
            </div>

            <Button
              type="submit"
              disabled={!secretWord.trim() || !!error}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Lock className="h-4 w-4 mr-2" />
              Definir Palavra Secreta
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-black/20 backdrop-blur-sm border-white/10">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="text-white font-medium text-sm">Dicas para uma boa palavra:</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Escolha palavras temáticas (românticas, sensuais)</li>
              <li>• Evite palavras muito óbvias ou muito difíceis</li>
              <li>• Lembre-se: quem perde cumpre castigo! 😈</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}