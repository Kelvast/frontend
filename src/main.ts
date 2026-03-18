import { Engine } from "@babylonjs/core";
import { connectWebSocket } from "./net";
import { createScene } from "./world";
import { init, update } from "./players";

document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
  const engine = new Engine(canvas, true);
  const scene = createScene(canvas);

  init(scene); // Initialize players

  engine.runRenderLoop(() => {
    update(engine.getDeltaTime()); // Update player positions
    scene.render();
  });

  window.addEventListener("resize", () => {
    engine.resize();
  });

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    const pickInfo = scene.pick(scene.pointerX, scene.pointerY);
    if (pickInfo?.hit && pickInfo.pickedMesh?.name === "ground") {
      const { x, z } = pickInfo.pickedPoint!;
      connectWebSocket().send(
        JSON.stringify({
          type: "click",
          targetX: Math.round(x),
          targetY: Math.round(z),
        }),
      );
    }
  });
});
