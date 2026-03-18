import { Scene, MeshBuilder, Vector3, Color3, StandardMaterial, AbstractMesh, ArcRotateCamera } from "@babylonjs/core";
import type { ServerPlayer } from "./types";

export let playerCamera: ArcRotateCamera;

const players = new Map<number, {
  mesh: AbstractMesh;
  targetPos: Vector3;
  currentPos: Vector3;
}>();

let scene: Scene;
let myPlayerId: number | null = null;

export function init(sceneRef: Scene) {
  scene = sceneRef;
  console.log("Players module initialized");
  window.addEventListener("loginSuccess", (e: any) => {
    myPlayerId = e.detail;
    console.log("I am player ID:", myPlayerId);
  });
  window.addEventListener("serverState", (e: CustomEvent<ServerPlayer[]>) => {
    console.log("State received:", e.detail.length, "players");
    e.detail.forEach(updatePlayerState);
  });
}

function updatePlayerState(player: ServerPlayer) {
  console.log("updatePlayerState id:", player.id, "pos:", player.x, player.y);
  let playerData = players.get(player.id);

  if (!playerData) {
    const mesh = MeshBuilder.CreateBox(`player-${player.id}`, { size: 1 }, scene);
    mesh.position = new Vector3(player.x, 0.5, player.y);

    const mat = new StandardMaterial(`mat-${player.id}`, scene);
    mat.diffuseColor = new Color3(0, 0.5, 1);
    mesh.material = mat;

    playerData = {
      mesh,
      targetPos: new Vector3(player.x, 0.5, player.y),
      currentPos: new Vector3(player.x, 0.5, player.y),
    };
    players.set(player.id, playerData);
    console.log("Created blue cube for player", player.id);
  } else {
    playerData.targetPos.copyFromFloats(player.x, 0.5, player.y);
  }
}

export function update(deltaTime: number) {
  let myPlayerData: any = null;
  players.forEach((data: any, id: number) => {
    const lerpFactor = Math.min(0.15 * deltaTime * 60, 1);
    data.currentPos = Vector3.Lerp(data.currentPos, data.targetPos, lerpFactor);
    data.mesh.position.copyFrom(data.currentPos);
    
    if (id === myPlayerId) {
      myPlayerData = data;
    }
  });

  if (myPlayerData && playerCamera) {
    playerCamera.setTarget(myPlayerData.currentPos);
  }
}
