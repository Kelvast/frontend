import { Scene, MeshBuilder, Vector3, Color3, StandardMaterial } from "@babylonjs/core";
import type { ServerPlayer } from "./types";

const players = new Map<
  number,
  {
    mesh: import("@babylonjs/core").AbstractMesh;
    targetPos: Vector3;
    currentPos: Vector3;
  }
>();

let scene: Scene;

export function init(sceneRef: Scene) {
  scene = sceneRef;
  // Listen for server state updates
  window.addEventListener("serverState", (e: CustomEvent<ServerPlayer[]>) => {
    e.detail.forEach(updatePlayerState);
  });
}

function updatePlayerState(player: ServerPlayer) {
  let playerData = players.get(player.id);

  if (!playerData) {
    // Create new player mesh
    const mesh = MeshBuilder.CreateBox(`player-${player.id}`, { size: 1 }, scene);
    mesh.position = new Vector3(player.x, 0.5, player.y);

    // Blue material (different color per player later)
    const mat = new StandardMaterial(`mat-${player.id}`, scene);
    mat.diffuseColor = new Color3(0, 0.5, 1);
    mesh.material = mat;

    playerData = {
      mesh,
      targetPos: new Vector3(player.x, 0.5, player.y),
      currentPos: new Vector3(player.x, 0.5, player.y),
    };
    players.set(player.id, playerData);
  } else {
    // Update target for interpolation
    playerData.targetPos.copyFromFloats(player.x, 0.5, player.y);
  }
}

export function update(deltaTime: number) {
  players.forEach((data) => {
    const lerpFactor = Math.min(0.15 * deltaTime * 60, 1);
    data.currentPos = Vector3.Lerp(data.currentPos, data.targetPos, lerpFactor);
    data.mesh.position.copyFrom(data.currentPos);
  });
}
