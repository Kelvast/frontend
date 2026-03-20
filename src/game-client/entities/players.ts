import {
  MeshBuilder,
  Vector3,
  Color3,
  StandardMaterial,
  AbstractMesh,
  Scene,
} from "@babylonjs/core";
import { PlayerState } from "../../types";
import { PLAYER } from "../constants";
import { logger } from "../../utils/logger";

export class PlayerManager {
  private meshes: Record<string, AbstractMesh> = {};
  private localMesh: AbstractMesh | null = null;
  private localTarget: Vector3 = Vector3.Zero();

  constructor(private scene: Scene) {
    logger.game("PlayerManager initialised");
  }

  spawnLocalPlayer(): AbstractMesh {
    logger.game("Spawning local player");
    const mesh = MeshBuilder.CreateBox("localPlayer", { size: PLAYER.SIZE }, this.scene);
    mesh.position = new Vector3(0, PLAYER.Y_OFFSET, 0);
    this.localTarget = mesh.position.clone();

    const mat = new StandardMaterial("localPlayerMat", this.scene);
    mat.diffuseColor = new Color3(0, 0.7, 1);
    mesh.material = mat;

    this.localMesh = mesh;
    return mesh;
  }

  moveLocalPlayer(x: number, z: number): void {
    if (!this.localMesh) return;
    logger.game("Moving local player to", { x, z });
    this.localTarget.set(x, PLAYER.Y_OFFSET, z);
  }

  tickLocalPlayer(): void {
    if (!this.localMesh) return;
    Vector3.LerpToRef(
      this.localMesh.position,
      this.localTarget,
      PLAYER.LERP_SPEED,
      this.localMesh.position,
    );
  }

  getLocalTarget(): Vector3 {
    return this.localTarget;
  }

  getLocalPlayer(): AbstractMesh | null {
    return this.localMesh;
  }

  spawnPlayer(player: PlayerState): void {
    if (this.meshes[player.id]) return;
    logger.game("Spawning remote player:", player.id);

    const meshId = `player-${player.id}`;
    const mesh = MeshBuilder.CreateBox(meshId, { size: PLAYER.SIZE }, this.scene);
    mesh.position = new Vector3(player.position.x, PLAYER.Y_OFFSET, player.position.z);

    const mat = new StandardMaterial(`${meshId}-mat`, this.scene);
    mat.diffuseColor = new Color3(0.8, 0.4, 0);
    mesh.material = mat;

    this.meshes[player.id] = mesh;
  }

  updatePlayer(player: PlayerState): void {
    const mesh = this.meshes[player.id];
    if (mesh) {
      Vector3.LerpToRef(
        mesh.position,
        new Vector3(player.position.x, PLAYER.Y_OFFSET, player.position.z),
        PLAYER.LERP_SPEED,
        mesh.position,
      );
    }
  }

  removePlayer(id: string): void {
    if (this.meshes[id]) {
      logger.game("Removing remote player:", id);
      this.meshes[id].dispose();
      delete this.meshes[id];
    }
  }

  syncPlayers(players: PlayerState[], myId: string): void {
    players.forEach((player) => {
      if (player.id === myId) return;
      if (!this.meshes[player.id]) {
        this.spawnPlayer(player);
      } else {
        this.updatePlayer(player);
      }
    });

    Object.keys(this.meshes).forEach((id) => {
      if (!players.find((p) => p.id === id)) this.removePlayer(id);
    });
  }
}
