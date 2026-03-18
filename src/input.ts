import { Scene, PointerEventTypes, Ray } from "@babylonjs/core";
import { connectWebSocket } from "./net";
import { flashTile } from "./tiles";

let myPlayerId: number | null = null;

window.addEventListener("loginSuccess", (e: CustomEvent<number>) => {
  myPlayerId = e.detail;
});

export function initInput(scene: Scene) {
  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type !== PointerEventTypes.POINTERDOWN) return;

    const event = pointerInfo.event as PointerEvent;

    // LEFT click only (button 0) — right/middle pan camera freely
    if (event.button !== 0) return;
    if (!myPlayerId) return;

    // Fresh ray from exact pointer coords via current camera matrix
    const ray = scene.createPickingRay(
      event.clientX,
      event.clientY,
      null,
      scene.activeCamera
    );

    const pickInfo = scene.pickWithRay(ray);
    if (!pickInfo?.hit || !pickInfo.pickedMesh) return;
    if (pickInfo.pickedMesh.metadata?.tileX === undefined) return;

    // Always use baked centre from metadata — never raw pickedPoint
    const { tileX, tileZ, worldX, worldZ } = pickInfo.pickedMesh.metadata as {
      tileX: number; tileZ: number; worldX: number; worldZ: number;
    };

    flashTile(tileX, tileZ);
    console.log(`Tile (${tileX},${tileZ}) → server (${worldX}, ${worldZ})`);

    const ws = connectWebSocket();
    ws.send(JSON.stringify({ type: "click", targetX: worldX, targetY: worldZ }));
  });
}
