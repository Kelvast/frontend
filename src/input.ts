import { Scene, PointerEventTypes } from "@babylonjs/core";
import { connectWebSocket } from "./net";
import { flashTile } from "./tiles";
import { setLastTile } from "./store";

let myPlayerId: number | null = null;

window.addEventListener("loginSuccess", (e: CustomEvent<number>) => {
  myPlayerId = e.detail;
});

export function initInput(scene: Scene) {
  scene.onPointerObservable.add(async (pointerInfo) => {
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

    const { serverTileX, serverTileZ } = pickInfo.pickedMesh.metadata as {
      tileX: number; tileZ: number;
      worldX: number; worldZ: number;
      serverTileX: number; serverTileZ: number;
    };

    flashTile(pickInfo.pickedMesh.metadata.tileX, pickInfo.pickedMesh.metadata.tileZ);
    setLastTile(serverTileX, serverTileZ);

    console.log(`Walking to tile (${serverTileX}, ${serverTileZ})`);

    const ws = await connectWebSocket();
    ws.send(JSON.stringify({ type: "click", targetX: serverTileX, targetY: serverTileZ }));
  });
}
