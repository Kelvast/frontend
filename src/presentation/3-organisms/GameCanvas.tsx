'use client';

import { useEffect, useRef } from 'react';
import { Engine, Scene, FreeCamera, HemisphericLight, MeshBuilder, Vector3 } from '@babylonjs/core';
import { useGameStore } from '../../utils/game-store';
import { connectWS } from '../../utils/ws-client';

interface GameCanvasProps {
  token: string;
}

export default function GameCanvas({ token }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const { myId, player, nearbyPlayers, setNearbyPlayers } = useGameStore();

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true);
    engineRef.current = engine;
    const scene = new Scene(engine);

    // Basic setup from typical Babylon MMO main.ts
    const camera = new FreeCamera('camera', new Vector3(0, 5, -10), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvasRef.current, true);

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);

    // Ground
    MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, scene);

    // Render loop for MMO updates
    engine.runRenderLoop(() => {
      scene.render();
      // Sync nearbyPlayers from store/WS here
    });

    connectWS(token); // Connect to MMO server

    return () => {
      engine.dispose();
    };
  }, [token]);

  return <canvas ref={canvasRef} style={{ width: '100vw', height: '100vh' }} />;
}
