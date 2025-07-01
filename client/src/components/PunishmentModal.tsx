import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Heart, Clock, RefreshCw } from "lucide-react";
import { Punishment, usePunishments } from "../lib/stores/usePunishments";

interface PunishmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  punishment: Punishment | null;
}

export default function PunishmentModal({ isOpen, onClose, punishment }: PunishmentModalProps) {
  const { getRandomPunishment } = usePunishments();
  const [currentPunishment, setCurrentPunishment] = useState<Punishment | null>(punishment);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "leve":
        return "bg-green-500/20 text-green-300 border-green-500/50";
      case "moderado":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "intenso":
        return "bg-red-500/20 text-red-300 border-red-500/50";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/50";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "preliminar":
        return "💋";
      case "posicao":
        return "🔥";
      case "fetiche":
        return "🎭";
      case "dominacao":
        return "👑";
      case "acao":
        return "💃";
      default:
        return "❤️";
    }
  };

  const handleNewPunishment = () => {
    const newPunishment = getRandomPunishment();
    setCurrentPunishment(newPunishment);
  };

  const handleClose = () => {
    setCurrentPunishment(punishment);
    onClose();
  };

  if (!currentPunishment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-red-900/95 backdrop-blur-sm border-pink-500/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-pink-400" />
            Seu Castigo Sexual
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Categoria e Tipo */}
          <div className="flex justify-between items-center">
            <Badge className={getCategoryColor(currentPunishment.category)}>
              {currentPunishment.category.toUpperCase()}
            </Badge>
            <div className="flex items-center gap-2 text-white/80">
              <span className="text-xl">{getTypeIcon(currentPunishment.type)}</span>
              <span className="text-sm capitalize">{currentPunishment.type}</span>
            </div>
          </div>

          {/* Título */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-pink-300 mb-2">
              {currentPunishment.title}
            </h3>
            {currentPunishment.duration && (
              <div className="flex items-center justify-center gap-2 text-white/60">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{currentPunishment.duration}</span>
              </div>
            )}
          </div>

          {/* Descrição */}
          <div className="bg-black/30 rounded-lg p-4 border border-pink-500/30">
            <p className="text-white text-center leading-relaxed">
              {currentPunishment.description}
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              onClick={handleNewPunishment}
              variant="outline"
              className="flex-1 text-white border-pink-500/50 hover:bg-pink-500/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Outro Castigo
            </Button>
            <Button
              onClick={handleClose}
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
            >
              Aceitar Castigo
            </Button>
          </div>

          {/* Aviso */}
          <div className="text-center">
            <p className="text-xs text-white/50">
              Lembre-se: O consentimento é fundamental em qualquer atividade sexual
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}