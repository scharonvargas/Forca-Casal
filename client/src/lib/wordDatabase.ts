// Default adult-themed words for the hangman game
// This is a simplified example - in a real app, you'd want a more extensive database
export const getDefaultWords = (): string[] => {
  return [
    // Romantic/Adult themed words (keeping it tasteful)
    "ROMANCE",
    "PASSION",
    "DESIRE",
    "SEDUCTION",
    "INTIMATE",
    "TEMPTATION",
    "ATTRACTION",
    "CHEMISTRY",
    "SENSUAL",
    "ALLURING",
    "CAPTIVATING",
    "ENCHANTING",
    "MAGNETIC",
    "IRRESISTIBLE",
    "PROVOCATIVE",
    "TANTALIZING",
    "MESMERIZING",
    "BEWITCHING",
    "ENTICING",
    "CHARMING",
    "FLIRTATION",
    "COURTSHIP",
    "AFFECTION",
    "DEVOTION",
    "INFATUATION",
    "YEARNING",
    "LONGING",
    "CRAVING",
    "LUST",
    "AROUSAL",
    "PLEASURE",
    "ECSTASY",
    "BLISS",
    "EUPHORIA",
    "RAPTURE",
    "INTOXICATING",
    "BREATHTAKING",
    "STUNNING",
    "GORGEOUS",
    "BEAUTIFUL",
    "HANDSOME",
    "ATTRACTIVE",
    "SEXY",
    "HOT",
    "STEAMY",
    "SIZZLING",
    "BURNING",
    "FIERY",
    "WILD",
    "NAUGHTY",
    "PLAYFUL",
    "MISCHIEVOUS",
    "ADVENTUROUS",
    "BOLD",
    "DARING",
    "RISQUE",
    "SCANDALOUS",
    "FORBIDDEN",
    "SECRET",
    "HIDDEN",
    "MYSTERIOUS",
    "EXOTIC",
    "EROTIC",
    "SENSUOUS",
    "VOLUPTUOUS",
    "CURVACEOUS",
    "SULTRY",
    "SMOLDERING",
    "HYPNOTIC",
    "SPELLBINDING",
    "ELECTRIFYING",
    "THRILLING",
    "EXCITING",
    "STIMULATING",
    "AROUSING",
    "TITILLATING",
    "SUGGESTIVE",
    "SEDUCTIVE"
  ];
};

export const validateWord = (word: string): boolean => {
  const cleanWord = word.trim().toUpperCase();
  return cleanWord.length >= 3 && /^[A-Z]+$/.test(cleanWord);
};

export const getWordHint = (word: string): string => {
  // Simple hints based on word length and theme
  if (word.length <= 4) {
    return "Short and sweet";
  } else if (word.length <= 7) {
    return "Medium intensity";
  } else {
    return "Long and passionate";
  }
};
