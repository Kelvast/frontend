import {
  MeshBuilder, Vector3, Color3, StandardMaterial, AbstractMesh, Scene,
} from '@babylonjs/core';
import { PlayerState } from '../types';

export class PlayerManager {
  private meshes: Record<string, AbstractMesh> = {};
  private localMesh: AbstractMesh | null = null;

  constructor(private scene: Scene) {}

  // Call this immediately on game init — no WS needed
  spawnLocalPlayer(): AbstractMesh {
    const mesh = MeshBuilder.CreateBox('localPlayer', { size: 2 }, this.scene);
    mesh.position = new Vector3(0, 1, 0);

    const mat = new StandardMaterial('localPlayerMat', this.scene);
    mat.diffuseColor = new Color3(0, 0.7, 1);
    mesh.material = mat;

    this.localMesh = mesh;
    return mesh;
  }

  moveLocalPlayer(x: number, z: number) {
    if (this.localMesh) {
      this.localMesh.position.x = x;
      this.localMesh.position.z = z;
    }
  }

  getLocalPlayer(): AbstractMesh | null {
    return this.localMesh;
  }

  spawnPlayer(player: PlayerState) {
    if (this.meshes[player.id]) return;
    const meshId = `player-${player.id}`;
    const mesh = MeshBuilder.CreateBox(meshId, { size: 2 }, this.scene);
    mesh.position = new Vector3(player.position.x, 1, player.position.z);
    const mat = new StandardMaterial(`${meshId}-mat`, this.scene);
    mat.diffuseColor = new Color3(0, 0.7, 1);
    mesh.material = mat;
    this.meshes[player.id] = mesh;
  }

  updatePlayer(player: PlayerState) {
    const mesh = this.meshes[player.id];
    if (mesh) {
      mesh.position = Vector3.Lerp(
        mesh.position,
        new Vector3(player.position.x, 1, player.position.z),
        0.12
      );
    }
  }

  removePlayer(id: string) {
    if (this.meshes[id]) {
      this.meshes[id].dispose();
      delete this.meshes[id];
    }
  }

  syncPlayers(players: PlayerState[], myId: string) {
    players.forEach(player => {
      if (player.id === myId) return; // local player handled separately
      if (!this.meshes[player.id]) {
        this.spawnPlayer(player);
      } else {
        this.updatePlayer(player);
      }
    });

    Object.keys(this.meshes).forEach(id => {
      if (!players.find(p => p.id === id)) this.removePlayer(id);
    });
  }
}
