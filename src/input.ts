import { Scene, PointerEventTypes } from "@babylonjs/core";
import { connectWebSocket } from "./net";
import { flashTile } from "./tiles";

let myPlayerId: number | null = null;

window.addEventListener("loginSuccess", (e: CustomEvent<number>) => {
  myPlayerId = e.detail;
});

export function initInput(scene: Scene) {
  scene.onPointerObservable.add((pointerInfo) => {
    if (pointerInfo.type !== PointerEventTypes.POINTERDOWN) return;
    if (!myPlayerId) return;

    const pickInfo = scene.pick(scene.pointerX!, scene.pointerY!);
    if (!pickInfo.hit || !pickInfo.pickedPoint) return;
    if (pickInfo.pickedMesh?.metadata?.tileX === undefined) return;

    // Use actual world position from raycast — no index conversion
    const worldX = pickInfo.pickedPoint.x;
    const worldZ = pickInfo.pickedPoint.z;

    const { tileX, tileZ } = pickInfo.pickedMesh.metadata as { tileX: number; tileZ: number };
    flashTile(tileX, tileZ);

    console.log(`Walk to world (${worldX.toFixed(1)}, ${worldZ.toFixed(1)})`);

    const ws = connectWebSocket();
    ws.send(JSON.stringify({ type: "click", targetX: Math.round(worldX), targetY: Math.round(worldZ) }));
  });
}
