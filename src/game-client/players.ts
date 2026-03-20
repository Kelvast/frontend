import { MeshBuilder, Vector3, Color3, StandardMaterial, AbstractMesh, Scene, SceneLoader } from '@babylonjs/core';
import { PlayerState } from '../types';

export class PlayerManager {
  private meshes: Record<string, AbstractMesh> = {};

  constructor(private scene: Scene) {}

  spawnPlayer(player: PlayerState, isMe = false) {
    const meshId = `player-${player.id}`;
    
    if (this.meshes[player.id]) return;

    const mesh = MeshBuilder.CreateCapsule(meshId, { height: 2, radius: 0.5 }, this.scene);
    mesh.position = new Vector3(player.position.x, 1, player.position.z);

    const mat = new StandardMaterial(`${meshId}-mat`, this.scene);
    mat.diffuseColor = isMe ? new Color3(0, 0.5, 1) : new Color3(1, 0.2, 0.2);
    mesh.material = mat;

    this.meshes[player.id] = mesh;
  }

  updatePlayer(player: PlayerState) {
    const mesh = this.meshes[player.id];
    if (mesh) {
      mesh.position = Vector3.Lerp(
        mesh.position,
        new Vector3(player.position.x, 1, player.position.z),
        0.1
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
    // Spawn new
    players.forEach(player => {
      if (!this.meshes[player.id]) {
        this.spawnPlayer(player, player.id === myId);
      } else {
        this.updatePlayer(player);
      }
    });

    // Cleanup disconnected
    Object.keys(this.meshes).forEach(id => {
      if (!players.find(p => p.id === id)) {
        this.removePlayer(id);
      }
    });
  }
}
