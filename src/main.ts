import { Engine } from "@babylonjs/core";
import { createScene } from "./world";
import * as players from "./players";
import "./tiles";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

const scene = createScene(canvas, engine);

// Init modules
players.init(scene);

// Global update reference
(window as any).update = players.update;

engine.runRenderLoop(() => {
  if ((window as any).update) (window as any).update(engine.getDeltaTime() / 1000);
  scene.render();
});

window.addEventListener("resize", () => engine.resize());
