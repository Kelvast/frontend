import { Scene, MeshBuilder, Vector3, Color3, StandardMaterial, AbstractMesh } from "@babylonjs/core";
import { followTarget } from "./camera";

const PLAYER_SIZE = 20;

let mesh: AbstractMesh | null = null;
let targetPos = new Vector3(0, PLAYER_SIZE / 2, 0);
let currentPos = new Vector3(0, PLAYER_SIZE / 2, 0);
let scene: Scene;

export let myPlayerId: number | null = null;

export function initPlayer(sceneRef: Scene) {
  scene = sceneRef;

  window.addEventListener("loginSuccess", (e: any) => {
    myPlayerId = e.detail;
    console.log("I am player ID:", myPlayerId);
  });

  window.addEventListener("serverState", (e: CustomEvent<any[]>) => {
    const me = e.detail.find(p => p.id === myPlayerId);
    if (!me) return;

    if (!mesh) {
      mesh = MeshBuilder.CreateBox("myPlayer", {
        width: PLAYER_SIZE, height: PLAYER_SIZE, depth: PLAYER_SIZE
      }, scene);

      const mat = new StandardMaterial("myPlayerMat", scene);
      mat.diffuseColor = new Color3(0, 0.8, 1); // Brighter blue for self
      mesh.material = mat;

      currentPos = new Vector3(me.x, PLAYER_SIZE / 2, me.y);
      targetPos = currentPos.clone();
      mesh.position.copyFrom(currentPos);
    } else {
      targetPos.copyFromFloats(me.x, PLAYER_SIZE / 2, me.y);
    }
  });
}

export function updatePlayer(deltaTime: number) {
  if (!mesh) return;

  const lerpFactor = Math.min(0.15 * deltaTime * 60, 1);
  currentPos = Vector3.Lerp(currentPos, targetPos, lerpFactor);
  mesh.position.copyFrom(currentPos);

  followTarget(currentPos);
}
