import {
  MeshBuilder,
  Vector3,
  Color3,
  StandardMaterial,
  AbstractMesh,
  Animation,
  Scene,
} from "@babylonjs/core";
import { PLAYER } from "../constants";
import { WORLD } from "mmo-shared";
import { tileWorldY } from "../world/tile-height";
import { GameWorld } from "../world";
import { logger } from "../../utils/logger";
import { buildMoveAnimation } from "../movement/animation";
import { buildWaypoints } from "../movement/waypoints";

export class PlayerManager {
  private localMesh: AbstractMesh | null = null;
  private onArrival: ((tileX: number, tileZ: number) => void) | null = null;

  constructor(
    private scene: Scene,
    private world: GameWorld,
  ) {
    logger.game("PlayerManager initialised");
  }

  setOnArrival(cb: (tileX: number, tileZ: number) => void): void {
    this.onArrival = cb;
  }

  spawnLocalPlayer(): AbstractMesh {
    logger.game("Spawning local player");
    const mesh = MeshBuilder.CreateBox(
      "localPlayer",
      { width: PLAYER.SIZE, height: PLAYER.HEIGHT, depth: PLAYER.SIZE },
      this.scene,
    );
    const half = WORLD.TILE_SIZE / 2;
    mesh.position = new Vector3(half, PLAYER.Y_OFFSET, half);

    const mat = new StandardMaterial("localPlayerMat", this.scene);
    mat.diffuseColor = new Color3(0, 0.7, 1);
    mesh.material = mat;

    this.localMesh = mesh;
    return mesh;
  }

  moveTo(tileX: number, tileZ: number): void {
    if (!this.localMesh) return;

    this.scene.stopAnimation(this.localMesh);

    const s = WORLD.TILE_SIZE;
    const destWorldX = tileX * s + s / 2;
    const destWorldZ = tileZ * s + s / 2;

    const waypoints = buildWaypoints(this.localMesh.position, destWorldX, destWorldZ);
    if (waypoints.length === 0) return;

    const waypointsWithY: Vector3[] = waypoints.map((wp) => {
      const wpTileX = Math.floor(wp.x / s);
      const wpTileZ = Math.floor(wp.z / s);
      const tile = this.world.getTileAt(wpTileX, wpTileZ);
      const groundY = tile ? tileWorldY(tile.y) + PLAYER.Y_OFFSET : PLAYER.Y_OFFSET;
      return new Vector3(wp.x, groundY, wp.z);
    });

    const { keys, totalFrames, fps } = buildMoveAnimation(
      this.localMesh.position.clone(),
      waypointsWithY,
    );

    const anim = new Animation(
      "playerMove",
      "position",
      fps,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
    );
    anim.setKeys(keys);

    this.localMesh.animations = [anim];
    this.scene.beginAnimation(this.localMesh, 0, totalFrames, false, 1, () => {
      const dest = waypointsWithY[waypointsWithY.length - 1];
      const arrTileX = Math.floor(dest.x / s);
      const arrTileZ = Math.floor(dest.z / s);
      logger.game("Arrived", { tileX: arrTileX, tileZ: arrTileZ });
      this.onArrival?.(arrTileX, arrTileZ);
    });

    logger.game("Moving", {
      to: { tileX, tileZ, worldX: destWorldX, worldZ: destWorldZ },
      steps: waypoints.length,
    });
  }

  getLocalPlayer(): AbstractMesh | null {
    return this.localMesh;
  }

  dispose(): void {
    this.localMesh?.dispose();
    this.localMesh = null;
  }
}
