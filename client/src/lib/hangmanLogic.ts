export const MAX_WRONG_GUESSES = 6;

export const isGameWon = (word: string, guessedLetters: Set<string>): boolean => {
  return word.split('').every(letter => guessedLetters.has(letter.toUpperCase()));
};

export const isGameLost = (wrongGuesses: number): boolean => {
  return wrongGuesses >= MAX_WRONG_GUESSES;
};

export const getDisplayWord = (word: string, guessedLetters: Set<string>): string => {
  return word
    .split('')
    .map(letter => guessedLetters.has(letter.toUpperCase()) ? letter : '_')
    .join(' ');
};

export const isValidLetter = (input: string): boolean => {
  return /^[A-Za-z]$/.test(input);
};

export const normalizeWord = (word: string): string => {
  return word.toUpperCase().trim();
};
