// Palavras padrão com temática adulta para o jogo da forca
// Este é um exemplo simplificado - em um app real, você gostaria de um banco de dados mais extenso
export type WordCategory = 'romantico' | 'sensual' | 'acao' | 'corpo';

const WORD_CATEGORIES: Record<WordCategory, string[]> = {
  romantico: [
    // Palavras românticas/adultas temáticas (mantendo o bom gosto)
    "ROMANCE",
    "PAIXAO",
    "DESEJO",
    "SEDUCAO",
    "INTIMIDADE",
    "TENTACAO",
    "ATRACAO",
    "QUIMICA",
    "SENSUAL",
    "ATRAENTE",
    "CATIVANTE",
    "ENCANTADOR",
    "MAGNETICO",
    "IRRESISTIVEL",
    "PROVOCANTE",
    "TENTADOR",
    "HIPNOTIZANTE",
    "ENFEITICANTE",
    "SEDUTOR",
    "CHARMOSO",
    "FLERTE",
    "CORTEJO",
    "CARINHO",
    "DEVOCAO",
    "FASCINACAO",
    "ANSEIO",
    "SAUDADE",
    "DESEJO",
    "LUXURIA",
    "EXCITACAO",
    "PRAZER",
    "EXTASE",
    "FELICIDADE",
    "EUFORIA",
    "ARREBATAMENTO",
    "INEBRIANTE",
    "DESLUMBRANTE",
    "IMPRESSIONANTE",
    "LINDO",
    "BELO",
    "BONITO",
    "ATRAENTE",
    "SEXY",
    "QUENTE",
    "ARDENTE",
    "FERVENTE",
    "QUEIMANDO",
    "FOGOSO",
    "SELVAGEM",
    "TRAVESSO",
    "BRINCALHAO",
    "MALICIOSO",
    "AVENTUREIRO",
    "OUSADO",
    "CORAJOSO",
    "PICANTE",
    "ESCANDALOSO",
    "PROIBIDO",
    "SECRETO",
    "ESCONDIDO",
    "MISTERIOSO",
    "EXOTICO",
    "EROTICO",
    "SENSUAL",
    "VOLUPTUOSO",
    "CURVILÍNEO",
    "SULTRY",
    "ARDOROSO",
    "HIPNOTICO",
    "FASCINANTE",
    "ELETRIZANTE",
    "EMOCIONANTE",
    "EXCITANTE",
    "ESTIMULANTE",
    "EXCITANTE",
    "TITILANTE",
    "SUGESTIVO",
    "SEDUTOR",
    "BEIJO",
    "ABRACO",
    "TOQUE",
    "CARICIA",
    "MASSAGEM",
    "SUSSURRO",
    "GEMIDO",
    "RESPIRACAO",
    "BATIMENTO",
    "TEMPERATURA",
    "SUOR",
    "PELE",
    "CORPO",
    "CURVAS",
    "FORMA",
    "LINGERIE",
    "PRELIMINAR",
    "CLIMAX",
    "ORGASMO",
    "LIBIDO",
    "TESAO",
    "MORDIDA",
    "LAMBIDA"
  ],
  sensual: ["TESAO", "EXCITACAO", "PRAZER"],
  acao: ["MASSAGEM", "TOQUE", "SUSSURRO"],
  corpo: ["CORPO", "PELE", "CURVAS"]
};

export const getDefaultWords = (): string[] => {
  return Object.values(WORD_CATEGORIES).flat();
};

export const getWordsByCategory = (category: WordCategory): string[] => WORD_CATEGORIES[category];

export const validateWord = (word: string): boolean => {
  const cleanWord = word.trim().toUpperCase();
  return cleanWord.length >= 3 && /^[A-Z]+$/.test(cleanWord);
};

export const getWordHint = (word: string): string => {
  // Dicas simples baseadas no tamanho da palavra e tema
  if (word.length <= 4) {
    return "Curta e doce";
  } else if (word.length <= 7) {
    return "Intensidade média";
  } else {
    return "Longa e apaixonada";
  }
};
