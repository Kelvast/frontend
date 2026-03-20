import { GameEngine } from "./engine";
import { GameCamera } from "./camera";
import { GameWorld } from "./world";
import { PlayerManager } from "./entities/players";
import { connectWS, sendPlayerMove, sendSettings } from "../utils/ws-client";
import { useGameStore } from "../utils/game-store";
import { logger } from "../utils/logger";
import { WORLD } from "./constants";
import { Color3, Mesh, StandardMaterial } from "@babylonjs/core";

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
  const localMesh = _players.spawnLocalPlayer();
  _camera.attachToMesh(localMesh);
  logger.game("Scene ready — engine, camera, world, players initialised");

  let _hoveredMesh: Mesh | null = null;
  let _hoveredOriginalColor: Color3 | null = null;

  scene.onPointerObservable.add((pi) => {
    if (pi.type === 4) {
      const mesh = pi.pickInfo?.pickedMesh as Mesh | null;
      const name = mesh?.name ?? "";

      if (mesh !== _hoveredMesh) {
        if (_hoveredMesh?.material && _hoveredOriginalColor) {
          (_hoveredMesh.material as StandardMaterial).diffuseColor = _hoveredOriginalColor;
        }
        if (mesh && name.startsWith("tile-")) {
          const mat = mesh.material as StandardMaterial;
          _hoveredOriginalColor = mat.diffuseColor.clone();
          mat.diffuseColor = Color3.Lerp(mat.diffuseColor, Color3.White(), 0.35);
          _hoveredMesh = mesh;
        } else {
          _hoveredMesh = null;
          _hoveredOriginalColor = null;
        }
      }
    }

    if (pi.type !== 1) return;
    if ((pi.event as PointerEvent).button !== 0) return;
    if (!pi.pickInfo?.hit || !pi.pickInfo.pickedMesh) return;

    const name = pi.pickInfo.pickedMesh.name;
    const parts = name.split("-");
    if (parts[0] !== "tile" || parts.length !== 5) return;

    const chunkX = parseInt(parts[1], 10);
    const chunkZ = parseInt(parts[2], 10);
    const col = parseInt(parts[3], 10);
    const row = parseInt(parts[4], 10);

    const x = (chunkX * WORLD.CHUNK_SIZE + col) * WORLD.TILE_SIZE;
    const z = (chunkZ * WORLD.CHUNK_SIZE + row) * WORLD.TILE_SIZE;
    const y = pi.pickInfo.pickedMesh.position.y;

    const facing = Math.atan2(
      z - _players!.getLocalTarget().z,
      x - _players!.getLocalTarget().x,
    );

    logger.game("Click → move to tile", { x, y, z });
    _players!.moveLocalPlayer(x, z);
    sendPlayerMove(x, y, z, facing);
  });

  _engine.engine.runRenderLoop(() => {
    const { nearbyPlayers, myId } = useGameStore.getState();
    _players!.syncPlayers(nearbyPlayers, myId ?? "");
    _players!.tickLocalPlayer();
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
  sendSettings(useGameStore.getState().settings);
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
