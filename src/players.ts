import { Scene, MeshBuilder, Vector3, Color3, StandardMaterial, AbstractMesh } from "@babylonjs/core";
import { myPlayerId } from "./player";

const PLAYER_SIZE = 20;

const others = new Map<number, {
  mesh: AbstractMesh;
  targetPos: Vector3;
  currentPos: Vector3;
}>();

let scene: Scene;

export function initPlayers(sceneRef: Scene) {
  scene = sceneRef;

  window.addEventListener("serverState", (e: CustomEvent<any[]>) => {
    e.detail
      .filter(p => p.id !== myPlayerId) // Skip self
      .forEach(updateOther);

    // Remove players no longer in state
    const activeIds = new Set(e.detail.map(p => p.id));
    others.forEach((_, id) => {
      if (!activeIds.has(id)) {
        others.get(id)?.mesh.dispose();
        others.delete(id);
      }
    });
  });
}

function updateOther(player: any) {
  let data = others.get(player.id);

  if (!data) {
    const mesh = MeshBuilder.CreateBox(`player-${player.id}`, {
      width: PLAYER_SIZE, height: PLAYER_SIZE, depth: PLAYER_SIZE
    }, scene);
    mesh.position = new Vector3(player.x, PLAYER_SIZE / 2, player.y);

    const mat = new StandardMaterial(`mat-${player.id}`, scene);
    mat.diffuseColor = new Color3(1, 0.4, 0); // Orange for others
    mesh.material = mat;

    data = {
      mesh,
      targetPos: new Vector3(player.x, PLAYER_SIZE / 2, player.y),
      currentPos: new Vector3(player.x, PLAYER_SIZE / 2, player.y),
    };
    others.set(player.id, data);
  } else {
    data.targetPos.copyFromFloats(player.x, PLAYER_SIZE / 2, player.y);
  }
}

export function updatePlayers(deltaTime: number) {
  others.forEach((data: any) => {
    const lerpFactor = Math.min(0.15 * deltaTime * 60, 1);
    data.currentPos = Vector3.Lerp(data.currentPos, data.targetPos, lerpFactor);
    data.mesh.position.copyFrom(data.currentPos);
  });
}
