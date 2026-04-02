"use client";

import { useEffect, useRef } from "react";
import { initGame, connectGame, destroyGame } from "../../game-client";

interface GameCanvasProps {
  token: string;
}

const GameCanvas = ({ token }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    const run = async () => {
      const p = initGame(canvas);
      initRef.current = p;
      await p;
      initRef.current = null;
      if (cancelled) {
        destroyGame();
        return;
      }
      connectGame(token);
    };

    void run();

    return () => {
      cancelled = true;
      // Wait for any in-progress init to finish before destroying,
      // so destroyGame never races initGame mid-flight
      void (initRef.current ?? Promise.resolve()).then(() => {
        if (cancelled) destroyGame();
      });
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
