import { useEffect, useRef } from "react";

interface HangmanCanvasProps {
  wrongGuesses: number;
}

export default function HangmanCanvas({ wrongGuesses }: HangmanCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set drawing style
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Draw gallows base (always visible)
    ctx.beginPath();
    ctx.moveTo(50, 280);
    ctx.lineTo(150, 280);
    ctx.stroke();

    // Draw gallows pole
    ctx.beginPath();
    ctx.moveTo(100, 280);
    ctx.lineTo(100, 30);
    ctx.stroke();

    // Draw gallows top
    ctx.beginPath();
    ctx.moveTo(100, 30);
    ctx.lineTo(200, 30);
    ctx.stroke();

    // Draw noose
    ctx.beginPath();
    ctx.moveTo(200, 30);
    ctx.lineTo(200, 60);
    ctx.stroke();

    // Draw hangman parts based on wrong guesses
    if (wrongGuesses >= 1) {
      // Head
      ctx.beginPath();
      ctx.arc(200, 80, 20, 0, Math.PI * 2);
      ctx.stroke();
    }

    if (wrongGuesses >= 2) {
      // Body
      ctx.beginPath();
      ctx.moveTo(200, 100);
      ctx.lineTo(200, 200);
      ctx.stroke();
    }

    if (wrongGuesses >= 3) {
      // Left arm
      ctx.beginPath();
      ctx.moveTo(200, 130);
      ctx.lineTo(170, 160);
      ctx.stroke();
    }

    if (wrongGuesses >= 4) {
      // Right arm
      ctx.beginPath();
      ctx.moveTo(200, 130);
      ctx.lineTo(230, 160);
      ctx.stroke();
    }

    if (wrongGuesses >= 5) {
      // Left leg
      ctx.beginPath();
      ctx.moveTo(200, 200);
      ctx.lineTo(170, 240);
      ctx.stroke();
    }

    if (wrongGuesses >= 6) {
      // Right leg (game over)
      ctx.beginPath();
      ctx.moveTo(200, 200);
      ctx.lineTo(230, 240);
      ctx.stroke();

      // Add X eyes for death
      ctx.strokeStyle = '#ff4444';
      ctx.lineWidth = 2;
      
      // Left X
      ctx.beginPath();
      ctx.moveTo(192, 75);
      ctx.lineTo(198, 85);
      ctx.moveTo(198, 75);
      ctx.lineTo(192, 85);
      ctx.stroke();

      // Right X
      ctx.beginPath();
      ctx.moveTo(202, 75);
      ctx.lineTo(208, 85);
      ctx.moveTo(208, 75);
      ctx.lineTo(202, 85);
      ctx.stroke();
    }

  }, [wrongGuesses]);

  return (
    <div className="bg-black/30 rounded-lg p-4 border border-white/10">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="block mx-auto"
      />
    </div>
  );
}
