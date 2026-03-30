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
import { buildWaypoints, buildMoveAnimation } from "../movement";
import { logger } from "../../utils/logger";

export class PlayerManager {
  private localMesh: AbstractMesh | null = null;
  private onArrival: ((x: number, z: number) => void) | null = null;

  constructor(private scene: Scene) {
    logger.game("PlayerManager initialised");
  }

  setOnArrival(cb: (x: number, z: number) => void): void {
    this.onArrival = cb;
  }

  spawnLocalPlayer(): AbstractMesh {
    logger.game("Spawning local player");
    const mesh = MeshBuilder.CreateBox(
      "localPlayer",
      { width: PLAYER.SIZE, height: PLAYER.HEIGHT, depth: PLAYER.SIZE },
      this.scene,
    );
    mesh.position = new Vector3(0, PLAYER.Y_OFFSET, 0);

    const mat = new StandardMaterial("localPlayerMat", this.scene);
    mat.diffuseColor = new Color3(0, 0.7, 1);
    mesh.material = mat;

    this.localMesh = mesh;
    return mesh;
  }

  moveTo(worldX: number, worldZ: number): void {
    if (!this.localMesh) return;

    this.scene.stopAnimation(this.localMesh);

    const waypoints = buildWaypoints(this.localMesh.position, worldX, worldZ);
    if (waypoints.length === 0) return;

    const { keys, totalFrames, fps } = buildMoveAnimation(
      this.localMesh.position.clone(),
      waypoints,
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
      const dest = waypoints[waypoints.length - 1];
      logger.game("Arrived", { x: dest.x, z: dest.z });
      this.onArrival?.(dest.x, dest.z);
    });

    logger.game("Moving", { to: { x: worldX, z: worldZ }, steps: waypoints.length });
  }

  getLocalPlayer(): AbstractMesh | null {
    return this.localMesh;
  }

  dispose(): void {
    this.localMesh?.dispose();
    this.localMesh = null;
  }
}
