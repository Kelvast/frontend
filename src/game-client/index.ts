import { GameEngine } from "./engine";
import { GameCamera } from "./camera";
import { GameWorld } from "./world";
import { PlayerManager } from "./entities/players";
import { connectWS, sendPlayerUpdate } from "../utils/ws-client";
import { useGameStore } from "../utils/game-store";
import { logger } from "../utils/logger";

export { GameCamera } from "./camera";
export { GameEngine } from "./engine";
export { GameInput } from "./input";
export { GameWorld } from "./world";
export { PlayerManager } from "./entities/players";

let _engine: GameEngine | null = null;
let _camera: GameCamera | null = null;
let _players: PlayerManager | null = null;

export function initGame(canvas: HTMLCanvasElement): void {
  if (_engine) {
    logger.game("initGame called but engine already running — skipping");
    return;
  }

  logger.game("Initialising game engine");
  _engine = new GameEngine(canvas);
  const scene = _engine.scene;

  new GameWorld(scene);
  _camera = new GameCamera(scene);
  _players = new PlayerManager(scene);
  _players.spawnLocalPlayer();
  logger.game("Scene ready — engine, camera, world, players initialised");

  scene.onPointerObservable.add((pi) => {
    if (pi.type === 1 && pi.pickInfo?.hit && pi.pickInfo.pickedMesh?.name === "ground") {
      const pt = pi.pickInfo.pickedPoint!;
      const x = Math.round(pt.x / 5) * 5;
      const z = Math.round(pt.z / 5) * 5;
      logger.game("Click → move to tile", { x, z });
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

  logger.game("Render loop started");
}

export function connectGame(token?: string): void {
  logger.game("Connecting to game server");
  connectWS(token);
}

export function destroyGame(): void {
  logger.game("Destroying game instance");
  _engine?.dispose();
  _engine = null;
  _camera = null;
  _players = null;
}
