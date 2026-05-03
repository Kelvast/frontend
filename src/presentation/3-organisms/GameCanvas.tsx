"use client";
import { useEffect, useRef } from "react";
import { startGame, destroyGame } from "../../game-client";
import { setLoadEventCallback as setSessionCallback } from "../../ws/messages/session-opened";
import { setLoadEventCallback as setPlayerDataCallback } from "../../ws/messages/player-data";
import type { OnLoadEvent } from "../../types/mmo/loading";

interface Props {
  onLoadEvent: OnLoadEvent;
}

const GameCanvas = ({ onLoadEvent }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const controller = new AbortController();

    setSessionCallback(onLoadEvent);
    setPlayerDataCallback(onLoadEvent);

    startGame(canvas, controller.signal, onLoadEvent);

    return () => {
      controller.abort();
      destroyGame();
    };
    // onLoadEvent is stable (useCallback in GamePage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
