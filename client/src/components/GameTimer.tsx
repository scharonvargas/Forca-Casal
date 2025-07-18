import React, { useEffect, useState } from 'react';
import { useHangman } from '@/lib/stores/useHangman';
import { useTimeConfig } from '@/lib/stores/useTimeConfig';
import { Timer, AlertCircle } from 'lucide-react';

interface GameTimerProps {
  onTimeUp: () => void;
  onTimeChange?: (time: number) => void;
}

export default function GameTimer({ onTimeUp, onTimeChange }: GameTimerProps) {
  const { timeLeft, timeEnabled, setTimeLeft, gameState } = useHangman();
  const { config } = useTimeConfig();
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (!timeEnabled || !config.enabled || gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(Math.max(0, timeLeft - 1));
      onTimeChange?.(timeLeft - 1);
      
      if (timeLeft <= 1) {
        onTimeUp();
        return;
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timeEnabled, config.enabled, gameState, setTimeLeft, onTimeUp, onTimeChange]);

  useEffect(() => {
    setIsWarning(timeLeft <= 30 && timeLeft > 0);
  }, [timeLeft]);

  if (!timeEnabled || !config.enabled) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 10) return 'text-red-400';
    if (timeLeft <= 30) return 'text-yellow-400';
    return 'text-white';
  };

  const getBackgroundColor = () => {
    if (timeLeft <= 10) return 'bg-red-500/20 border-red-500/50';
    if (timeLeft <= 30) return 'bg-yellow-500/20 border-yellow-500/50';
    return 'bg-purple-500/20 border-purple-500/50';
  };

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border backdrop-blur-sm ${getBackgroundColor()}`}>
      {isWarning ? (
        <AlertCircle className={`h-5 w-5 ${getTimerColor()} animate-pulse`} />
      ) : (
        <Timer className={`h-5 w-5 ${getTimerColor()}`} />
      )}
      <span className={`font-mono text-lg font-semibold ${getTimerColor()}`}>
        {formatTime(timeLeft)}
      </span>
    </div>
  );
}