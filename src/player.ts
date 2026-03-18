import { Scene, MeshBuilder, Vector3, Color3, StandardMaterial, AbstractMesh } from "@babylonjs/core";
import { followTarget } from "./camera";
import { getMyPlayer } from "./store";

const PLAYER_SIZE = 20;

let mesh: AbstractMesh | null = null;
let targetPos = new Vector3(0, PLAYER_SIZE / 2, 0);
let currentPos = new Vector3(0, PLAYER_SIZE / 2, 0);
let scene: Scene;

export function initPlayer(sceneRef: Scene) {
  scene = sceneRef;
}

export function updatePlayer(deltaTime: number) {
  const me = getMyPlayer();
  if (!me) return;

  if (!mesh) {
    mesh = MeshBuilder.CreateBox("myPlayer", {
      width: PLAYER_SIZE, height: PLAYER_SIZE, depth: PLAYER_SIZE
    }, scene);
    const mat = new StandardMaterial("myPlayerMat", scene);
    mat.diffuseColor = new Color3(0, 0.8, 1);
    mesh.material = mat;
    currentPos = new Vector3(me.x, PLAYER_SIZE / 2, me.y);
    targetPos = currentPos.clone();
    mesh.position.copyFrom(currentPos);
  }

  targetPos.copyFromFloats(me.x, PLAYER_SIZE / 2, me.y);

  const lerpFactor = Math.min(0.15 * deltaTime * 60, 1);
  currentPos = Vector3.Lerp(currentPos, targetPos, lerpFactor);
  mesh.position.copyFrom(currentPos);

  followTarget(currentPos);
}
