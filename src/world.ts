import { 
  Scene, 
  ArcRotateCamera, 
  HemisphericLight, 
  Engine,
  Color4,
  Vector3
} from "@babylonjs/core";

export let playerCamera: ArcRotateCamera;

export function createScene(canvas: HTMLCanvasElement, engine: Engine): Scene {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.1, 0.1, 0.2, 1.0);

  playerCamera = new ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 3.5,
    35,
    new Vector3(16384, 20, 16384),
    scene
  );
  playerCamera.attachControl(canvas, true);
  playerCamera.lowerRadiusLimit = 15;
  playerCamera.upperRadiusLimit = 60;
  playerCamera.lowerBetaLimit = Math.PI / 4;
  playerCamera.upperBetaLimit = Math.PI / 2.2;

  new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  return scene;
}
