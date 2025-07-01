import { Button } from "./ui/button";

interface KeyboardProps {
  onLetterClick: (letter: string) => void;
  guessedLetters: Set<string>;
  currentWord: string;
  disabled?: boolean;
}

export default function Keyboard({ onLetterClick, guessedLetters, currentWord, disabled }: KeyboardProps) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const getButtonVariant = (letter: string) => {
    if (!guessedLetters.has(letter)) {
      return 'outline';
    }
    
    if (currentWord.toUpperCase().includes(letter)) {
      return 'default'; // Correct letter - green-ish
    } else {
      return 'destructive'; // Wrong letter - red
    }
  };

  const isLetterDisabled = (letter: string) => {
    return disabled || guessedLetters.has(letter);
  };

  return (
    <div className="space-y-2">
      {/* Mobile-optimized keyboard layout */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-w-4xl mx-auto">
        {letters.map((letter) => (
          <Button
            key={letter}
            variant={getButtonVariant(letter)}
            onClick={() => onLetterClick(letter)}
            disabled={isLetterDisabled(letter)}
            className="aspect-square text-sm sm:text-base font-bold hover:scale-105 transition-transform min-h-[48px] sm:min-h-[52px] touch-manipulation"
            style={{ touchAction: 'manipulation' }}
          >
            {letter}
          </Button>
        ))}
      </div>
    </div>
  );
}
