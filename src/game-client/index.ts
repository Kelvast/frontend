import { GameEngine } from "./engine";
import { GameCamera } from "./camera";
import { GameWorld } from "./world";
import { PlayerManager } from "./entities/players";
import { connectWS, sendPlayerMove } from "../utils/ws-client";
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
let _world: GameWorld | null = null;
let _canvas: HTMLCanvasElement | null = null;
let _token: string | undefined;

function loadAllRegions(): void {
  const ctx: RequireContext = require.context("./world/regions", true, /\/index\.ts$/);
  ctx.keys().forEach((key: string) => {
    _world!.loadRegion(ctx(key).default);
  });
}

export function initGame(canvas: HTMLCanvasElement): void {
  if (_engine) {
    logger.game("initGame called but engine already running — skipping");
    return;
  }

  _canvas = canvas;

  logger.game("Initialising game engine");
  _engine = new GameEngine(canvas);
  const scene = _engine.scene;

  _world = new GameWorld(scene);
  loadAllRegions();

  _camera = new GameCamera(scene);
  _players = new PlayerManager(scene);
  _players.spawnLocalPlayer();
  logger.game("Scene ready — engine, camera, world, players initialised");

  scene.onPointerObservable.add((pi) => {
    if (pi.type === 1 && pi.pickInfo?.hit && pi.pickInfo.pickedPoint) {
      const pt = pi.pickInfo.pickedPoint;
      const x = Math.round(pt.x / 5) * 5;
      const y = Math.round(pt.y * 100) / 100;
      const z = Math.round(pt.z / 5) * 5;
      const facing = Math.atan2(
        z - (_players!.getLocalPlayer()?.position.z ?? 0),
        x - (_players!.getLocalPlayer()?.position.x ?? 0),
      );
      logger.game("Click → move to tile", { x, y, z });
      _players!.moveLocalPlayer(x, z);
      sendPlayerMove(x, y, z, facing);
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
  _token = token;
  logger.game("Connecting to game server");
  connectWS(token);
}

export function destroyGame(): void {
  if (!_engine) return;
  logger.game("Destroying game instance");
  _engine.dispose();
  _engine = null;
  _camera = null;
  _players = null;
  _world = null;
}

declare const module: {
  hot?: {
    accept: (deps: string[], cb: () => void) => void;
    dispose: (cb: (data: Record<string, unknown>) => void) => void;
  };
};

if (process.env.NODE_ENV === "development" && module.hot) {
  module.hot.dispose((data) => {
    data["canvas"] = _canvas;
    data["token"] = _token;
    destroyGame();
  });

  const regionCtx: RequireContext = require.context("./world/regions", true, /\/index\.ts$/);

  module.hot.accept([regionCtx.id], () => {
    if (!_world) return;
    const freshCtx: RequireContext = require.context("./world/regions", true, /\/index\.ts$/);
    freshCtx.keys().forEach((key: string) => {
      const mod = freshCtx(key);
      if (typeof mod.buildRegion === "function") {
        const fresh = mod.buildRegion();
        logger.game(`HMR — diffing region "${fresh.id}"`);
        _world!.reloadRegion(fresh);
      }
    });
  });
}
