export { GameCamera } from "./camera";
export { GameEngine } from "./engine";
export { GameInput } from "./input";
export { GameWorld } from "./world";
export { PlayerManager } from "./entities/players";

import { GameEngine } from "./engine";
import { GameCamera } from "./camera";
import { GameWorld } from "./world";
import { PlayerManager } from "./entities/players";
import { connectWS, sendPlayerUpdate } from "../utils/ws-client";
import { useGameStore } from "../utils/game-store";

let _engine: GameEngine | null = null;
let _camera: GameCamera | null = null;
let _players: PlayerManager | null = null;

export function initGame(canvas: HTMLCanvasElement): void {
  if (_engine) return;

  _engine = new GameEngine(canvas);
  const scene = _engine.scene;

  new GameWorld(scene);
  _camera = new GameCamera(scene);
  _players = new PlayerManager(scene);
  _players.spawnLocalPlayer();

  scene.onPointerObservable.add((pi) => {
    if (pi.type === 1 && pi.pickInfo?.hit && pi.pickInfo.pickedMesh?.name === "ground") {
      const pt = pi.pickInfo.pickedPoint!;
      const x = Math.round(pt.x / 5) * 5;
      const z = Math.round(pt.z / 5) * 5;
      _players!.moveLocalPlayer(x, z);
      sendPlayerUpdate({ x, y: 0, z });
    }
  });

  _engine.engine.runRenderLoop(() => {
    const { nearbyPlayers, myId } = useGameStore.getState();
    _players!.syncPlayers(nearbyPlayers, myId ?? "");
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
