import { Engine, Scene, ArcRotateCamera, HemisphericLight, MeshBuilder } from "@babylonjs/core";

export function createScene(canvas: HTMLCanvasElement): Scene {
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  // Camera
  const camera = new ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 4,
    1000,
    BABYLON.Vector3.Zero(),
    scene,
  );
  camera.attachControl(canvas, true);

  // Light
  const light = new HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

  // Ground plane
  const ground = MeshBuilder.CreateGround("ground", { width: 2048, height: 2048 }, scene);
  ground.position.y = -1;

  return scene;
}
