import { Scene, PointerEventTypes } from "@babylonjs/core";
import { connectWebSocket } from "./net";
import { flashTile } from "./tiles";
import { setLastTile } from "./store";

let myPlayerId: number | null = null;

window.addEventListener("loginSuccess", (e: CustomEvent<number>) => {
  myPlayerId = e.detail;
});

export function initInput(scene: Scene) {
  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type !== PointerEventTypes.POINTERDOWN) return;

    const event = pointerInfo.event as PointerEvent;
    if (event.button !== 0) return;
    if (!myPlayerId) return;

    const ray = scene.createPickingRay(
      event.clientX,
      event.clientY,
      null,
      scene.activeCamera
    );

    const pickInfo = scene.pickWithRay(ray);
    if (!pickInfo?.hit || !pickInfo.pickedMesh) return;
    if (pickInfo.pickedMesh.metadata?.tileX === undefined) return;

    const { tileX, tileZ, worldX, worldZ } = pickInfo.pickedMesh.metadata as {
      tileX: number; tileZ: number; worldX: number; worldZ: number;
    };

    flashTile(tileX, tileZ);
    setLastTile(tileX, tileZ); // Persist to store + localStorage

    console.log(`Tile (${tileX},${tileZ}) → (${worldX}, ${worldZ})`);

    const ws = connectWebSocket();
    ws.send(JSON.stringify({ type: "click", targetX: worldX, targetY: worldZ }));
  });
}
