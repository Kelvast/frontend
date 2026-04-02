"use client";

import { useEffect, useRef } from "react";
import { initGame, connectGame, destroyGame } from "../../game-client";

interface GameCanvasProps {
  token: string;
}

const GameCanvas = ({ token }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const controller = new AbortController();

    initGame(canvas, controller.signal).then((started) => {
      if (started) connectGame(token);
    });

    return () => {
      controller.abort();
      destroyGame();
    };
  }, [token]);

  return (
    <canvas
      ref={canvasRef}
      id="game"
      style={{ width: "100vw", height: "100vh" }}
      className="fixed top-0 left-0 z-50 block"
    />
  );
};

export default GameCanvas;
