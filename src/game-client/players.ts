import { 
  MeshBuilder, Vector3, Color3, StandardMaterial, AbstractMesh, Scene, 
} from '@babylonjs/core';
import { PlayerState } from '../types';

export class PlayerManager {
  private meshes: Record<string, AbstractMesh> = {};

  constructor(private scene: Scene) {}

  spawnPlayer(player: PlayerState, isMe = false) {
    const meshId = `player-${player.id}`;
    
    if (this.meshes[player.id]) return;

    // ✅ MAIN BRANCH: Blue Box (not capsule)
    const mesh = MeshBuilder.CreateBox(meshId, { 
      width: 1.5, 
      height: 2.5, 
      depth: 1.5 
    }, this.scene);
    
    mesh.position = new Vector3(player.position.x, 1.25, player.position.z);

    // Main branch colors
    const mat = new StandardMaterial(`${meshId}-mat`, this.scene);
    mat.diffuseColor = isMe 
      ? new Color3(0, 0.4, 1)     // Blue for SELF (main branch)
      : new Color3(1, 0.3, 0.3);  // Red for others
    mesh.material = mat;

    this.meshes[player.id] = mesh;
  }

  updatePlayer(player: PlayerState) {
    const mesh = this.meshes[player.id];
    if (mesh) {
      // Smooth lerp (main branch 60fps)
      const targetPos = new Vector3(player.position.x, 1.25, player.position.z);
      mesh.position = Vector3.Lerp(mesh.position, targetPos, 0.12);
    }
  }

  removePlayer(id: string) {
    if (this.meshes[id]) {
      this.meshes[id].dispose();
      delete this.meshes[id];
    }
  }

  syncPlayers(players: PlayerState[], myId: string) {
    // Spawn new players
    players.forEach(player => {
      if (!this.meshes[player.id]) {
        this.spawnPlayer(player, player.id === myId);
      } else {
        this.updatePlayer(player);
      }
    });

    // Cleanup disconnected (memory safe)
    Object.keys(this.meshes).forEach(id => {
      if (!players.find(p => p.id === id)) {
        this.removePlayer(id);
      }
    });
  }
}
