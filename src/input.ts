import { connectWebSocket } from "./net";

let myPlayerId: number | null = null;
window.addEventListener("loginSuccess", (e: CustomEvent<number>) => {
  myPlayerId = e.detail;
});

export function initInput(canvas: HTMLCanvasElement, scene: any) {
  canvas.addEventListener("click", (event) => {
    if (event.button !== 0 || !myPlayerId) return;
    
    const pickInfo = scene.pick(scene.pointerX, scene.pointerY);
    if (pickInfo?.hit && pickInfo.pickedMesh?.name === "ground") {
      const point = pickInfo.pickedPoint!;
      const ws = connectWebSocket();
      const packet = { 
        type: "click", 
        targetX: Math.round(point.x), 
        targetY: Math.round(point.z) 
      };
      console.log("Player", myPlayerId, "move to:", packet);
      ws.send(JSON.stringify(packet));
    }
  });
}
