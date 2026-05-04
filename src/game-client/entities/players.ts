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
import { WORLD, calcMoveSpeed, DEFAULT_SPEED_MODIFIERS } from "mmo-shared";
import { tileWorldY } from "../world/tile-height";
import { GameWorld } from "../world";
import { logger } from "../../utils/logger";
import { buildMoveAnimation } from "../movement/animation";
import { buildWaypoints } from "../movement/waypoints";
import { sendPlayerMove } from "../../ws/messages/move";

/*
 * PlayerManager spawns and drives the local player mesh.
 * Remote player management lives in remote-player.ts.
 *
 * TODO: replace box mesh with animated character model
 * TODO: nameplate rendering above mesh
 * TODO: equip slot visuals (weapon, hat, cape)
 */
export class PlayerManager {
  private localMesh: AbstractMesh | null = null;
  private moveAnim: Animation;
  private onArrival:
    | ((tileX: number, tileY: number, tileFloor: number, tileZ: number) => void)
    | null = null;

  /*
   * Walk pace is constant while equipment modifiers are not yet implemented.
   * Computed once and reused on every move to avoid redundant recalculation.
   */
  private readonly walkPace = calcMoveSpeed("walk", DEFAULT_SPEED_MODIFIERS);

  constructor(
    private scene: Scene,
    private world: GameWorld,
  ) {
    /*
     * The Animation object is created once — only its keys are replaced on each
     * move. Name, target property, type, and loop mode are always identical.
     */
    this.moveAnim = new Animation(
      "playerMove",
      "position",
      60,
      Animation.ANIMATIONTYPE_VECTOR3,
      Animation.ANIMATIONLOOPMODE_CONSTANT,
    );
    logger.game("PlayerManager initialised");
  }

  /*
   * Callback fires on arrival with the full tile position (x, y, floor, z)
   * so callers can sync the store without re-deriving tile data.
   */
  setOnArrival(cb: (tileX: number, tileY: number, tileFloor: number, tileZ: number) => void): void {
    this.onArrival = cb;
  }

  /*
   * Spawns the local player box at world origin.
   * Position is overridden once SESSION_OPENED arrives with the server's
   * authoritative coordinates — this is just an initial placement.
   *
   * TODO: replace box with animated character model
   */
  spawnLocalPlayer(spawnTileX = 0, spawnTileZ = 0): AbstractMesh {
    logger.game("Spawning local player", { spawnTileX, spawnTileZ });
    const mesh = MeshBuilder.CreateBox(
      "localPlayer",
      { width: PLAYER.SIZE, height: PLAYER.HEIGHT, depth: PLAYER.SIZE },
      this.scene,
    );
    const s = WORLD.TILE_SIZE;
    const tile = this.world.getTileAt(spawnTileX, spawnTileZ);
    const groundY = tile ? tileWorldY(tile.y) + PLAYER.Y_OFFSET : PLAYER.Y_OFFSET;
    mesh.position = new Vector3(spawnTileX * s + s / 2, groundY, spawnTileZ * s + s / 2);

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

    const { keys, totalFrames } = buildMoveAnimation(
      this.localMesh.position.clone(),
      waypointsWithY,
    );

    /*
     * Send destination tile coords (not world-space) to the server.
     * MoveMessage.x/z are tile coordinates per protocol. y and floor come
     * from the destination tile — Vector3 only carries world-space position.
     * The server is authoritative — a player_stopped reply will snap the
     * client to the corrected position if the move is rejected.
     */
    const destTile = this.world.getTileAt(tileX, tileZ);
    const destY = destTile?.y ?? 0;
    const destFloor = destTile?.floor ?? 0;
    sendPlayerMove(tileX, destY, destFloor, tileZ, this.walkPace);

    this.moveAnim.setKeys(keys);
    this.localMesh.animations = [this.moveAnim];
    this.scene.beginAnimation(this.localMesh, 0, totalFrames, false, 1, () => {
      const dest = waypointsWithY[waypointsWithY.length - 1];
      const arrTileX = Math.floor(dest.x / s);
      const arrTileZ = Math.floor(dest.z / s);
      const arrTile = this.world.getTileAt(arrTileX, arrTileZ);
      const arrY = arrTile?.y ?? 0;
      const arrFloor = arrTile?.floor ?? 0;
      logger.game("Arrived", { tileX: arrTileX, tileY: arrY, floor: arrFloor, tileZ: arrTileZ });
      sendPlayerMove(arrTileX, arrY, arrFloor, arrTileZ, this.walkPace);
      this.onArrival?.(arrTileX, arrY, arrFloor, arrTileZ);
    });

    logger.game("Moving", { to: { tileX, tileZ }, steps: waypoints.length });
  }

  getLocalPlayer(): AbstractMesh | null {
    return this.localMesh;
  }

  dispose(): void {
    if (this.localMesh) {
      this.localMesh.material?.dispose();
      this.localMesh.dispose();
      this.localMesh = null;
    }
  }
}
