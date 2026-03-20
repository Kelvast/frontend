'use client';

import { useEffect, useRef } from 'react';
import { initGame, connectGame, destroyGame } from '../../game-client';

interface GameCanvasProps {
  token: string;
}

const GameCanvas = ({ token }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (!canvasRef.current || initialized.current) return;
    initialized.current = true;

    initGame(canvasRef.current);
    connectGame(token);

    return () => destroyGame();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="game"
      className="w-screen h-screen fixed top-0 left-0 z-50"
    />
  );
};

export default GameCanvas;
