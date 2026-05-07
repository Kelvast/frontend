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
import { WORLD, ResolvedPace, Coords } from "mmo-shared";
import { GameWorld } from "../world";
import { logger } from "../../utils/logger";
import { buildMoveAnimation, ANIM_FPS } from "../movement/animation";
import { useGameStore } from "../../utils/game-store";

/*
 * PlayerManager spawns and drives the local player mesh.
 * Movement is driven entirely by server path responses — the client
 * never calculates waypoints or sends pace.
 *
 * TODO: replace box mesh with animated character model
 * TODO: nameplate rendering above mesh
 * TODO: equip slot visuals (weapon, hat, cape)
 */
export class PlayerManager {
  private localMesh: AbstractMesh | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(
    private scene: Scene,
    private world: GameWorld,
  ) {
    /*
     * Subscribe to pendingPath. When the store receives a PLAYER_MOVE_ACK
     * the path is written here, we animate immediately, then clear it.
     */
    this.unsubscribe = useGameStore.subscribe((state) => {
      if (state.pendingPath) {
        this.animatePath(state.pendingPath.path, state.pendingPath.pace);
        useGameStore.getState().clearPendingPath();
      }
    });

    logger.game("PlayerManager initialised");
  }

  spawnLocalPlayer(spawnTileX = 0, spawnTileZ = 0): AbstractMesh {
    logger.game("Spawning local player", { spawnTileX, spawnTileZ });
    const mesh = MeshBuilder.CreateBox(
      "localPlayer",
      { width: PLAYER.SIZE, height: PLAYER.HEIGHT, depth: PLAYER.SIZE },
      this.scene,
    );
    const s = WORLD.TILE_SIZE;
    const node = this.world.getNavNode(spawnTileX, spawnTileZ);
    const groundY = node ? node.worldY + PLAYER.Y_OFFSET : PLAYER.Y_OFFSET;
    mesh.position = new Vector3(spawnTileX * s + s / 2, groundY, spawnTileZ * s + s / 2);

    const mat = new StandardMaterial("localPlayerMat", this.scene);
    mat.diffuseColor = new Color3(0, 0.7, 1);
    mesh.material = mat;

    this.localMesh = mesh;
    return mesh;
  }

  /*
   * Animates the local player along the server-resolved path.
   * pace is tiles/s — higher = faster, fewer frames per tile.
   *
   * A fresh Animation instance is created on every call. Reusing a shared
   * Animation object and mutating it with setKeys while Babylon still holds
   * a reference to it caused the keyframe curve to be double-applied,
   * making the player shoot to the destination on rapid re-clicks.
   */
  private animatePath(path: Coords[], pace: ResolvedPace): void {
    if (!this.localMesh || path.length === 0) return;

    // Stop any running animation and clear the array so Babylon holds no
    // stale reference before we attach the new Animation object.
    this.scene.stopAnimation(this.localMesh);
    this.localMesh.animations = [];

    const s = WORLD.TILE_SIZE;
    const fpt = Math.round(ANIM_FPS / pace);

    const waypoints: Vector3[] = path.map((step) => {
      const node = this.world.getNavNode(step.x, step.z);
      const worldY = node ? node.worldY + PLAYER.Y_OFFSET : PLAYER.Y_OFFSET;
      return new Vector3(step.x * s + s / 2, worldY, step.z * s + s / 2);
    });

    const anim = new Animation(
      "playerMove",
      "position",
      ANIM_FPS,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
    );

    const { keys, totalFrames } = buildMoveAnimation(
      this.localMesh.position.clone(),
      waypoints,
      fpt,
    );

    anim.setKeys(keys);
    this.localMesh.animations = [anim];
    this.scene.beginAnimation(this.localMesh, 0, totalFrames, false, 1);
  }

  getLocalPlayer(): AbstractMesh | null {
    return this.localMesh;
  }

  dispose(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    if (this.localMesh) {
      this.scene.stopAnimation(this.localMesh);
      this.localMesh.animations = [];
      this.localMesh.material?.dispose();
      this.localMesh.dispose();
      this.localMesh = null;
    }
  }
}
