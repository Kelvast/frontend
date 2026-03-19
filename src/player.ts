import { Scene, MeshBuilder, Vector3, Color3, StandardMaterial, AbstractMesh } from "@babylonjs/core";
import { followTarget } from "./camera";
import { getMyPlayer } from "./store";
import { PLAYER_SIZE, WORLD_ORIGIN, TILE_SIZE } from "./constants";

const HALF = Math.floor(21 / 2);

let mesh: AbstractMesh | null = null;
let targetPos: Vector3 | null = null;
let currentPos: Vector3 | null = null;
let initialised = false;
let scene: Scene;

export function initPlayer(sceneRef: Scene) {
  scene = sceneRef;
  initialised = false;
  mesh = null;
  targetPos = null;
  currentPos = null;
}

export function updatePlayer(deltaTime: number) {
  const me = getMyPlayer();
  if (!me) return;

  const worldX = (me.x - HALF) * TILE_SIZE + WORLD_ORIGIN;
  const worldZ = (me.y - HALF) * TILE_SIZE + WORLD_ORIGIN;

  if (!mesh) {
    mesh = MeshBuilder.CreateBox("myPlayer", {
      width: PLAYER_SIZE, height: PLAYER_SIZE, depth: PLAYER_SIZE
    }, scene);
    const mat = new StandardMaterial("myPlayerMat", scene);
    mat.diffuseColor = new Color3(0, 0.8, 1);
    mesh.material = mat;
    currentPos = new Vector3(worldX, PLAYER_SIZE / 2, worldZ);
    targetPos = currentPos.clone();
    mesh.position.copyFrom(currentPos);
    initialised = true;
  }

  if (!initialised || !currentPos || !targetPos) return;

  targetPos.copyFromFloats(worldX, PLAYER_SIZE / 2, worldZ);

  const lerpFactor = Math.min(0.15 * deltaTime * 60, 1);
  currentPos = Vector3.Lerp(currentPos, targetPos, lerpFactor);
  mesh.position.copyFrom(currentPos);

  followTarget(currentPos);
}
