import { Engine } from "@babylonjs/core";
import { createScene } from "./world";
import * as players from "./players";
import { createTiles } from "./tiles";
import { initInput } from "./input";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

const scene = createScene(canvas, engine);

players.init(scene);
createTiles(scene);
initInput(scene);

(window as any).update = players.update;

engine.runRenderLoop(() => {
  if ((window as any).update) (window as any).update(engine.getDeltaTime() / 1000);
  scene.render();
});

window.addEventListener("resize", () => engine.resize());
