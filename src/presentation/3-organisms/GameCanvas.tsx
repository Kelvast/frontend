'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '../../utils/game-store';
import { connectWS, sendPlayerUpdate } from '../../utils/ws-client';
import { Vector3 } from '@babylonjs/core';
import { GameEngine, GameInput, GameCamera, PlayerManager, GameGrid, GameWorld } from '../../game-client';

interface GameCanvasProps {
  token: string;
}

const GameCanvas = ({ token }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const inputRef = useRef<GameInput | null>(null);
  const cameraRef = useRef<GameCamera | null>(null);
  const playersRef = useRef<PlayerManager | null>(null);
  
  const { myId, nearbyPlayers } = useGameStore();

  // Cleanup callback
  const cleanupGame = useCallback(() => {
    inputRef.current = null;
    cameraRef.current = null;
    playersRef.current = null;
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize EXACTLY like main.ts sequence
    const engine = new GameEngine(canvasRef.current);
    const input = new GameInput(engine.scene);
    const camera = new GameCamera(engine.scene);
    new GameGrid(engine.scene);
    new GameWorld(engine.scene);
    const players = new PlayerManager(engine.scene);

    // Store refs for cleanup
    inputRef.current = input;
    cameraRef.current = camera;
    playersRef.current = players;
    engineRef.current = engine;

    // Connect MMO server
    connectWS(token);

    // Production 60fps game loop (main.ts core)
    const gameLoop = () => {
      if (!engineRef.current) return;

      const deltaTime = engineRef.current.engine.getDeltaTime() / 1000;
      
      // Input handling + send to server
      const inputDelta = input.update(deltaTime);
      sendPlayerUpdate({
        x: inputDelta.targetPosition.x,
        y: 0,
        z: inputDelta.targetPosition.z
      });

      // Camera follows player smoothly
      if (myId && cameraRef.current) {
        cameraRef.current.followPlayerSmooth(new Vector3(0, 2, 0));
      }

      // Sync all players from WS/store (100fps smooth)
      if (playersRef.current) {
        playersRef.current.syncPlayers(nearbyPlayers, myId || '');
      }
    };

    engineRef.current.engine.runRenderLoop(gameLoop);

    return () => {
      if (engineRef.current) {
        engineRef.current.engine.stopRenderLoop();
        engineRef.current.dispose();
      }
      cleanupGame();
    };
  }, [token, myId, nearbyPlayers.length, cleanupGame]); // Optimized deps

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
