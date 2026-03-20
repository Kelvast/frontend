'use client';

import { useEffect, useRef } from 'react';
import { useGameStore } from '../../utils/game-store';
import { connectWS } from '../../utils/ws-client';
import { Vector3 } from '@babylonjs/core';
import { GameEngine, GameCamera, GameWorld, PlayerManager } from '../../game-client';

interface GameCanvasProps {
  token: string;
}

const GameCanvas = ({ token }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const { myId, nearbyPlayers } = useGameStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(canvasRef.current);
    const camera = new GameCamera(engine.scene);
    new GameWorld(engine.scene);
    const players = new PlayerManager(engine.scene);

    connectWS(token);

    const gameLoop = () => {
      if (myId) {
        camera.followPlayer(new Vector3(0, 2, 0));
      }
      players.syncPlayers(nearbyPlayers, myId || '');
    };

    engine.engine.runRenderLoop(gameLoop);
    engineRef.current = engine;

    return () => {
      engine.dispose();
    };
  }, [token, myId, nearbyPlayers]);

  return (
    <canvas 
      ref={canvasRef}
      id="game"
      className="w-screen h-screen fixed top-0 left-0 z-50"
      style={{ background: '#87CEEB' }}
    />
  );
};

export default GameCanvas;
