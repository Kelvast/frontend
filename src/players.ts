import { Scene, MeshBuilder, Vector3, Color3, StandardMaterial, AbstractMesh } from "@babylonjs/core";
import { getOtherPlayers } from "./store";
import { PLAYER_SIZE } from "./constants";

const meshes = new Map<number, {
  mesh: AbstractMesh;
  currentPos: Vector3;
  targetPos: Vector3;
}>();

let scene: Scene;

export function initPlayers(sceneRef: Scene) {
  scene = sceneRef;
}

export function updatePlayers(deltaTime: number) {
  const others = getOtherPlayers();
  const activeIds = new Set(others.map(p => p.id));

  // Remove departed players
  meshes.forEach((data, id) => {
    if (!activeIds.has(id)) {
      data.mesh.dispose();
      meshes.delete(id);
    }
  });

  // Upsert + lerp
  others.forEach(player => {
    let data = meshes.get(player.id);

    if (!data) {
      const mesh = MeshBuilder.CreateBox(`player-${player.id}`, {
        width: PLAYER_SIZE, height: PLAYER_SIZE, depth: PLAYER_SIZE
      }, scene);
      mesh.position = new Vector3(player.x, PLAYER_SIZE / 2, player.y);
      const mat = new StandardMaterial(`mat-${player.id}`, scene);
      mat.diffuseColor = new Color3(1, 0.4, 0);
      mesh.material = mat;

      data = {
        mesh,
        targetPos: new Vector3(player.x, PLAYER_SIZE / 2, player.y),
        currentPos: new Vector3(player.x, PLAYER_SIZE / 2, player.y),
      };
      meshes.set(player.id, data);
    } else {
      data.targetPos.copyFromFloats(player.x, PLAYER_SIZE / 2, player.y);
      const lerpFactor = Math.min(0.15 * deltaTime * 60, 1);
      data.currentPos = Vector3.Lerp(data.currentPos, data.targetPos, lerpFactor);
      data.mesh.position.copyFrom(data.currentPos);
    }
  });
}
