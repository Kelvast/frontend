'use client';

import { useCallback, useEffect, useRef } from 'react';
import { 
  Engine, Scene, FreeCamera, HemisphericLight, MeshBuilder, 
  Vector3, Color3, StandardMaterial, AbstractMesh 
} from '@babylonjs/core';
import { useGameStore } from '../../utils/game-store';
import { Position, PlayerState } from '../../types';
import { connectWS } from '../../utils/ws-client';

interface GameCanvasProps {
  token: string;
}

const GameCanvas = ({ token }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const playerMeshes = useRef<Record<string, AbstractMesh>>({});
  const renderLoopRef = useRef<(() => void) | null>(null);
  
  const { myId, player, nearbyPlayers } = useGameStore();

  const cleanupPlayerMesh = useCallback((id: string) => {
    if (playerMeshes.current[id]) {
      playerMeshes.current[id].dispose();
      delete playerMeshes.current[id];
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true, { 
      preserveDrawingBuffer: true, 
      stencil: true,
      disableWebGL2Support: false 
    });
    const scene = new Scene(engine);
    
    engineRef.current = engine;
    sceneRef.current = scene;

    const camera = new FreeCamera('camera', new Vector3(0, 10, -20), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvasRef.current, true);
    camera.speed = 0.5;
    camera.keysUp.push(87); // W
    camera.keysDown.push(83); // S
    camera.keysLeft.push(65); // A
    camera.keysRight.push(68); // D

    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    const ground = MeshBuilder.CreateGround('ground', { width: 200, height: 200 }, scene);
    const groundMat = new StandardMaterial('groundMat', scene);
    groundMat.diffuseColor = new Color3(0.15, 0.45, 0.15);
    ground.material = groundMat;

    if (myId) {
      const myPlayer = MeshBuilder.CreateCapsule(`player-${myId}`, { height: 2, radius: 0.5 }, scene);
      myPlayer.position.y = 1;
      const myMat = new StandardMaterial('myMat', scene);
      myMat.diffuseColor = new Color3(0, 0.5, 1);
      myPlayer.material = myMat;
      playerMeshes.current[myId] = myPlayer;
    }

    connectWS(token);

    const renderLoop = () => {
      const scene = sceneRef.current;
      if (!scene) return;

      if (myId && playerMeshes.current[myId] && player?.position) {
        camera.target = new Vector3(
          player.position.x, 
          player.position.y + 2, 
          player.position.z
        );
      }

      scene.render();

      nearbyPlayers.forEach((playerState: PlayerState) => {
        const meshId = `player-${playerState.id}`;
        
        if (!playerMeshes.current[playerState.id]) {
          const mesh = MeshBuilder.CreateCapsule(meshId, { height: 2, radius: 0.5 }, scene);
          mesh.position = new Vector3(playerState.position.x, 1, playerState.position.z);
          
          const mat = new StandardMaterial(meshId + '-mat', scene);
          mat.diffuseColor = playerState.id === myId 
            ? new Color3(0, 0.5, 1) 
            : new Color3(1, 0.2, 0.2);
          mesh.material = mat;
          
          playerMeshes.current[playerState.id] = mesh;
        } else {
          const mesh = playerMeshes.current[playerState.id];
          mesh.position = Vector3.Lerp(
            mesh.position, 
            new Vector3(playerState.position.x, 1, playerState.position.z), 
            0.1
          );
        }
      });

      Object.keys(playerMeshes.current).forEach((id) => {
        if (!nearbyPlayers.find((p: PlayerState) => p.id === id)) {
          cleanupPlayerMesh(id);
        }
      });
    };

    renderLoopRef.current = renderLoop;
    engine.runRenderLoop(renderLoop);

    const resize = () => engine.resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (engineRef.current) {
        engineRef.current.stopRenderLoop();
        engineRef.current.dispose();
      }
      Object.values(playerMeshes.current).forEach(mesh => mesh.dispose());
      playerMeshes.current = {};
    };
  }, [token, myId, nearbyPlayers.length, cleanupPlayerMesh]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-screen h-screen fixed top-0 left-0 z-50"
      style={{ background: '#87CEEB' }}
    />
  );
};

export default GameCanvas;
