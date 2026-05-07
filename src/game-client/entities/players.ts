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

/*
 * PlayerManager spawns and drives the local player mesh.
 * Movement is triggered directly by the PLAYER_MOVE_ACK message handler
 * via animatePath() — no Zustand subscription, no pendingPath polling.
 *
 * TODO: replace box mesh with animated character model
 * TODO: nameplate rendering above mesh
 * TODO: equip slot visuals (weapon, hat, cape)
 */
export class PlayerManager {
  private localMesh: AbstractMesh | null = null;

  constructor(
    private scene: Scene,
    private world: GameWorld,
  ) {
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
   * Called directly by the PLAYER_MOVE_ACK handler — not via a store subscription.
   * Driving animation from the message handler guarantees it fires exactly once
   * per server ack, with no risk of a subscriber re-firing on unrelated state
   * changes or on the clearPendingPath write that used to follow it.
   *
   * A fresh Animation instance is created on every call. Reusing a shared
   * Animation object and mutating its keys while Babylon still holds a reference
   * caused the keyframe curve to be double-applied on rapid re-clicks.
   */
  animatePath(path: Coords[], pace: ResolvedPace): void {
    if (!this.localMesh || path.length === 0) return;

    // Stop any in-progress animation and clear stale references before
    // attaching a new Animation object.
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

    logger.game("animatePath — steps:", path.length, "pace:", pace, "fpt:", fpt);
  }

  /*
   * Snap the local player mesh to a server-authoritative tile position.
   * Called when the server sends player_stopped with a corrected position.
   */
  snapToTile(tileX: number, tileZ: number): void {
    if (!this.localMesh) return;
    this.scene.stopAnimation(this.localMesh);
    this.localMesh.animations = [];
    const s = WORLD.TILE_SIZE;
    const node = this.world.getNavNode(tileX, tileZ);
    const worldY = node ? node.worldY + PLAYER.Y_OFFSET : PLAYER.Y_OFFSET;
    this.localMesh.position = new Vector3(tileX * s + s / 2, worldY, tileZ * s + s / 2);
    logger.game("snapToTile — x:", tileX, "z:", tileZ);
  }

  getLocalPlayer(): AbstractMesh | null {
    return this.localMesh;
  }

  dispose(): void {
    if (this.localMesh) {
      this.scene.stopAnimation(this.localMesh);
      this.localMesh.animations = [];
      this.localMesh.material?.dispose();
      this.localMesh.dispose();
      this.localMesh = null;
    }
  }
}
