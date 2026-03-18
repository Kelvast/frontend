import {
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  MeshBuilder,
  Vector3,
  StandardMaterial,
  Engine,
  Color3,
  Color4,
} from "@babylonjs/core";

export function createScene(canvas: HTMLCanvasElement): Scene {
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.1, 0.1, 0.2, 1.0);

  const camera = new ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 4,
    60,
    new Vector3(0, 10, 0),
    scene,
  );
  camera.attachControl(canvas, true);
  camera.lowerBetaLimit = 0.1;
  camera.upperBetaLimit = (Math.PI / 2) * 0.9;

  new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  const ground = MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
  ground.position.y = 0;

  const groundMat = new StandardMaterial("groundMat", scene);
  groundMat.diffuseColor = new Color3(0.2, 0.8, 0.2);
  ground.material = groundMat;

  return scene;
}
