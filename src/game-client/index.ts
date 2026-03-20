export { GameCamera } from './camera';
export { GameEngine } from './engine';
export { GameGrid } from './grid';
export { GameInput } from './input';
export { GameWorld } from './world';
export { PlayerManager } from './players';

import { GameEngine } from './engine';
import { GameCamera } from './camera';
import { GameWorld } from './world';
import { GameGrid } from './grid';
import { PlayerManager } from './players';
import { connectWS, sendPlayerUpdate } from '../utils/ws-client';
import { useGameStore } from '../utils/game-store';

let _engine: GameEngine | null = null;
let _camera: GameCamera | null = null;
let _players: PlayerManager | null = null;

export function initGame(canvas: HTMLCanvasElement): void {
  if (_engine) return; // already running

  console.log('canvas dims:', canvas.width, canvas.height);
  console.log('canvas client dims:', canvas.clientWidth, canvas.clientHeight);
  
  _engine = new GameEngine(canvas);
  
  console.log('engine size:', _engine.engine.getRenderWidth(), _engine.engine.getRenderHeight());
  console.log('scene meshes:', _engine.scene.meshes.length);
  const scene = _engine.scene;

  new GameWorld(scene);
  new GameGrid(scene);
  _camera = new GameCamera(scene);
  _players = new PlayerManager(scene);

  _players.spawnLocalPlayer();

  // Click-to-move: snap to 5-unit grid
  scene.onPointerObservable.add((pi) => {
    if (pi.type === 1 && pi.pickInfo?.hit && pi.pickInfo.pickedMesh?.name === 'ground') {
      const pt = pi.pickInfo.pickedPoint!;
      const x = Math.round(pt.x / 5) * 5;
      const z = Math.round(pt.z / 5) * 5;
      _players!.moveLocalPlayer(x, z);
      sendPlayerUpdate({ x, y: 0, z });
    }
  });

  let logged = false;
  _engine.engine.runRenderLoop(() => {
    if (!logged) {
      console.log('render loop running');
      console.log('camera target:', _camera!.camera.target);
      console.log('camera position:', _camera!.camera.position);
      console.log('meshes in scene:', _engine!.scene.meshes.length);
      logged = true;
    }
    scene.render();
  });

  // Single render loop — reads store directly
  _engine.engine.runRenderLoop(() => {
    console.log('cam target:', _camera!.camera.target);  // should show (0,1,0)
    console.log('local mesh:', _players!.getLocalPlayer()?.position); // should show 
    const { nearbyPlayers, myId } = useGameStore.getState();
    _players!.syncPlayers(nearbyPlayers, myId ?? '');

    // Add these two lines
    const localPos = _players!.getLocalPlayer()?.position;
    if (localPos) _camera!.followPlayer(localPos);

    scene.render();
  });

}

export function connectGame(token: string): void {
  connectWS(token);
}

export function destroyGame(): void {
  _engine?.dispose();
  _engine = null;
  _camera = null;
  _players = null;
}
