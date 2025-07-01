import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Punishment {
  id: string;
  title: string;
  description: string;
  category: "leve" | "moderado" | "intenso";
  duration?: string;
  type: "acao" | "posicao" | "fetiche" | "preliminar" | "dominacao";
}

interface PunishmentsState {
  punishments: Punishment[];
  
  // Actions
  addPunishment: (punishment: Omit<Punishment, 'id'>) => void;
  removePunishment: (id: string) => void;
  getPunishmentsByCategory: (category: string) => Punishment[];
  getRandomPunishment: (category?: string) => Punishment | null;
  resetToDefaults: () => void;
}

const getDefaultPunishments = (): Punishment[] => [
  // Castigos Leves
  {
    id: "1",
    title: "Beijo Apaixonado",
    description: "Dê um beijo longo e apaixonado no seu parceiro por 30 segundos",
    category: "leve",
    duration: "30 segundos",
    type: "preliminar"
  },
  {
    id: "2",
    title: "Massagem Sensual",
    description: "Faça uma massagem sensual nas costas do seu parceiro por 2 minutos",
    category: "leve",
    duration: "2 minutos",
    type: "preliminar"
  },
  {
    id: "3",
    title: "Strip Tease",
    description: "Faça um strip tease sexy tirando uma peça de roupa lentamente",
    category: "leve",
    type: "acao"
  },
  {
    id: "4",
    title: "Sussurro Safado",
    description: "Sussurre no ouvido do seu parceiro o que você quer fazer com ele",
    category: "leve",
    type: "preliminar"
  },
  {
    id: "5",
    title: "Dança Sedutora",
    description: "Dance de forma sedutora para o seu parceiro por 1 minuto",
    category: "leve",
    duration: "1 minuto",
    type: "acao"
  },

  // Castigos Moderados
  {
    id: "6",
    title: "Oral Teasing",
    description: "Use apenas a boca e língua para provocar o seu parceiro por 3 minutos sem permitir o clímax",
    category: "moderado",
    duration: "3 minutos",
    type: "preliminar"
  },
  {
    id: "7",
    title: "Posição da Amazona",
    description: "Fique por cima e controle o ritmo durante o próximo round",
    category: "moderado",
    type: "posicao"
  },
  {
    id: "8",
    title: "Vendas nos Olhos",
    description: "Seu parceiro ficará vendado enquanto você o toca e provoca por 5 minutos",
    category: "moderado",
    duration: "5 minutos",
    type: "fetiche"
  },
  {
    id: "9",
    title: "Gelo e Calor",
    description: "Use cubos de gelo e depois sua boca quente em pontos sensíveis",
    category: "moderado",
    type: "fetiche"
  },
  {
    id: "10",
    title: "Dominação Suave",
    description: "Você tem controle total por 10 minutos - seu parceiro só pode obedecer",
    category: "moderado",
    duration: "10 minutos",
    type: "dominacao"
  },

  // Castigos Intensos
  {
    id: "11",
    title: "Bondage Light",
    description: "Amarre as mãos do seu parceiro com gravata ou lenço e faça o que quiser",
    category: "intenso",
    type: "fetiche"
  },
  {
    id: "12",
    title: "Negação de Orgasmo",
    description: "Leve seu parceiro quase ao clímax 3 vezes mas pare antes dele gozar",
    category: "intenso",
    type: "dominacao"
  },
  {
    id: "13",
    title: "Posição Dominante",
    description: "Doggy style com você no controle total do ritmo e intensidade",
    category: "intenso",
    type: "posicao"
  },
  {
    id: "14",
    title: "Role Play",
    description: "Interpretem professor/aluna ou chefe/secretária durante a próxima sessão",
    category: "intenso",
    type: "fetiche"
  },
  {
    id: "15",
    title: "Submissão Total",
    description: "Seu parceiro deve satisfazer todos os seus desejos pelos próximos 15 minutos",
    category: "intenso",
    duration: "15 minutos",
    type: "dominacao"
  },
  {
    id: "16",
    title: "Tapa na Bunda",
    description: "Dê 10 tapas na bunda do seu parceiro (pode ser durante ou antes do ato)",
    category: "intenso",
    type: "dominacao"
  },
  {
    id: "17",
    title: "Uso de Brinquedos",
    description: "Use um brinquedo erótico (vibrador, algemas, etc.) na próxima sessão",
    category: "intenso",
    type: "fetiche"
  },
  {
    id: "18",
    title: "Sexo no Local Inusitado",
    description: "Façam amor em um local diferente da casa (cozinha, banheiro, sala, etc.)",
    category: "intenso",
    type: "acao"
  },
  {
    id: "19",
    title: "Controle do Prazer",
    description: "Você escolhe quando, como e por quanto tempo seu parceiro pode sentir prazer",
    category: "intenso",
    type: "dominacao"
  },
  {
    id: "20",
    title: "Fantasia Realizada",
    description: "Seu parceiro deve realizar uma fantasia sexual sua que você sempre quis experimentar",
    category: "intenso",
    type: "fetiche"
  }
];

export const usePunishments = create<PunishmentsState>()(
  persist(
    (set, get) => ({
      punishments: getDefaultPunishments(),

      addPunishment: (punishment: Omit<Punishment, 'id'>) => {
        const newPunishment: Punishment = {
          ...punishment,
          id: Date.now().toString()
        };
        set(state => ({
          punishments: [...state.punishments, newPunishment]
        }));
      },

      removePunishment: (id: string) => {
        set(state => ({
          punishments: state.punishments.filter(p => p.id !== id)
        }));
      },

      getPunishmentsByCategory: (category: string) => {
        return get().punishments.filter(p => p.category === category);
      },

      getRandomPunishment: (category?: string) => {
        const punishments = category 
          ? get().punishments.filter(p => p.category === category)
          : get().punishments;
          
        if (punishments.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * punishments.length);
        return punishments[randomIndex];
      },

      resetToDefaults: () => {
        set({ punishments: getDefaultPunishments() });
      }
    }),
    {
      name: 'hangman-punishments'
    }
  )
);