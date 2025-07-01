import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Eye, EyeOff, Star, AlertCircle } from 'lucide-react';

interface WordHintSystemProps {
  word: string;
  onHintUsed: (penalty: number) => void;
  disabled?: boolean;
  hintsUsed: number;
  maxHints?: number;
}

export default function WordHintSystem({ 
  word, 
  onHintUsed, 
  disabled = false, 
  hintsUsed,
  maxHints = 3 
}: WordHintSystemProps) {
  const [showHints, setShowHints] = useState(false);

  const getWordHints = (word: string): string[] => {
    const hints: string[] = [];
    const cleanWord = word.toUpperCase();
    
    // Hint 1: Word length and theme
    if (cleanWord.length <= 5) {
      hints.push(`💫 Palavra curta e doce (${cleanWord.length} letras)`);
    } else if (cleanWord.length <= 8) {
      hints.push(`🔥 Palavra de intensidade média (${cleanWord.length} letras)`);
    } else {
      hints.push(`💋 Palavra longa e apaixonada (${cleanWord.length} letras)`);
    }

    // Hint 2: First letter
    hints.push(`🎯 Começa com a letra "${cleanWord[0]}"`);

    // Hint 3: Category hint based on the word
    const romanticWords = ['ROMANCE', 'PAIXAO', 'AMOR', 'CARINHO', 'BEIJO', 'ABRACO'];
    const sensualWords = ['DESEJO', 'SEDUCAO', 'SENSUAL', 'TESAO', 'EXCITACAO', 'PRAZER'];
    const actionWords = ['MASSAGEM', 'TOQUE', 'CARICIA', 'MORDIDA', 'LAMBIDA', 'SUSSURRO'];
    const bodyWords = ['CORPO', 'PELE', 'CURVAS', 'RESPIRACAO', 'BATIMENTO', 'SUOR'];

    if (romanticWords.some(w => cleanWord.includes(w.substring(0, 3)) || w.includes(cleanWord.substring(0, 3)))) {
      hints.push(`💕 Categoria: Romântico/Sentimental`);
    } else if (sensualWords.some(w => cleanWord.includes(w.substring(0, 3)) || w.includes(cleanWord.substring(0, 3)))) {
      hints.push(`🔥 Categoria: Sensual/Desejo`);
    } else if (actionWords.some(w => cleanWord.includes(w.substring(0, 3)) || w.includes(cleanWord.substring(0, 3)))) {
      hints.push(`👐 Categoria: Ação/Toque`);
    } else if (bodyWords.some(w => cleanWord.includes(w.substring(0, 3)) || w.includes(cleanWord.substring(0, 3)))) {
      hints.push(`🫦 Categoria: Corpo/Físico`);
    } else {
      // Generic hints based on word characteristics
      if (cleanWord.includes('A') && cleanWord.includes('O')) {
        hints.push(`💭 Dica: Tem as vogais A e O`);
      } else if (cleanWord.includes('E') && cleanWord.includes('I')) {
        hints.push(`💭 Dica: Tem as vogais E e I`);
      } else {
        hints.push(`💭 Dica: Palavra relacionada à intimidade`);
      }
    }

    return hints;
  };

  const hints = getWordHints(word);
  const remainingHints = maxHints - hintsUsed;
  const canUseHint = !disabled && remainingHints > 0;

  const handleUseHint = (hintIndex: number) => {
    if (canUseHint) {
      const penalty = hintIndex === 0 ? 0 : hintIndex === 1 ? 1 : 2; // Different penalties for different hints
      onHintUsed(penalty);
    }
  };

  return (
    <Card className="bg-black/20 backdrop-blur-sm border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            Sistema de Dicas
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHints(!showHints)}
            className="text-white border-white/20"
          >
            {showHints ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Ocultar
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Mostrar
              </>
            )}
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={`${remainingHints > 0 ? 'bg-green-500/20 text-green-300 border-green-500/50' : 'bg-red-500/20 text-red-300 border-red-500/50'}`}>
            {remainingHints} dicas restantes
          </Badge>
          {hintsUsed > 0 && (
            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/50">
              {hintsUsed} usadas
            </Badge>
          )}
        </div>
      </CardHeader>

      {showHints && (
        <CardContent className="space-y-3">
          {hints.map((hint, index) => {
            const isUsed = index < hintsUsed;
            const isNext = index === hintsUsed;
            const penalty = index === 0 ? 0 : index === 1 ? 1 : 2;
            
            return (
              <div
                key={index}
                className={`p-3 rounded-lg border transition-all ${
                  isUsed 
                    ? 'bg-green-500/20 border-green-500/50' 
                    : isNext && canUseHint
                    ? 'bg-yellow-500/20 border-yellow-500/50 hover:bg-yellow-500/30 cursor-pointer'
                    : 'bg-white/5 border-white/20'
                }`}
                onClick={() => isNext && canUseHint && handleUseHint(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      isUsed ? 'bg-green-500 text-white' : 
                      isNext && canUseHint ? 'bg-yellow-500 text-black' : 
                      'bg-white/20 text-white/60'
                    }`}>
                      {index + 1}
                    </div>
                    <span className={`${
                      isUsed ? 'text-green-300' : 
                      isNext && canUseHint ? 'text-yellow-300' : 
                      'text-white/40'
                    }`}>
                      Dica {index + 1}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {penalty > 0 && (
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/50 text-xs">
                        -{penalty} vida
                      </Badge>
                    )}
                    {index === 0 && (
                      <Star className="h-4 w-4 text-yellow-400" />
                    )}
                  </div>
                </div>
                
                {isUsed ? (
                  <p className="text-green-300 text-sm mt-2 font-medium">
                    {hint}
                  </p>
                ) : isNext && canUseHint ? (
                  <div className="mt-2">
                    <p className="text-yellow-300 text-sm font-medium mb-1">
                      Clique para revelar esta dica
                    </p>
                    {penalty > 0 && (
                      <p className="text-red-300 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Custa {penalty} {penalty === 1 ? 'vida' : 'vidas'}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-white/40 text-sm mt-2">
                    Dica bloqueada
                  </p>
                )}
              </div>
            );
          })}
          
          {!canUseHint && remainingHints === 0 && (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-300 text-sm font-medium">
                Todas as dicas foram usadas!
              </p>
              <p className="text-white/60 text-xs">
                Continue tentando adivinhar a palavra
              </p>
            </div>
          )}
          
          <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-3 mt-4">
            <h4 className="text-purple-300 font-medium text-sm mb-1">Como funcionam as dicas:</h4>
            <ul className="text-purple-200 text-xs space-y-1">
              <li>• Dica 1: Grátis - Informações básicas</li>
              <li>• Dica 2: Custa 1 vida - Primeira letra</li>
              <li>• Dica 3: Custa 2 vidas - Categoria temática</li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
}