import { 
  Scene,
  HemisphericLight, 
  Engine,
  Color4,
  Vector3,
} from "@babylonjs/core";
import { createCamera } from "./camera";

export function createScene(canvas: HTMLCanvasElement, engine: Engine): Scene {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.1, 0.1, 0.2, 1.0);

  createCamera(canvas, scene);

  new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // No base ground — tiles ARE the floor, no z-fighting
  return scene;
}
