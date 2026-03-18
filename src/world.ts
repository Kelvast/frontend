import { 
  Scene, 
  ArcRotateCamera, 
  HemisphericLight, 
  Engine,
  Color4,
  Color3,
  Vector3,
  MeshBuilder,
  StandardMaterial
} from "@babylonjs/core";

export let playerCamera: ArcRotateCamera;

export function createScene(canvas: HTMLCanvasElement, engine: Engine): Scene {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.1, 0.1, 0.2, 1.0);

  // RS isometric-style camera
  playerCamera = new ArcRotateCamera(
    "camera",
    -Math.PI / 2, // Face north
    Math.PI / 3,  // ~60° tilt down
    25,           // Zoom distance
    new Vector3(16384, 0, 16384),
    scene
  );
  playerCamera.attachControl(canvas, true);
  playerCamera.lowerRadiusLimit = 10;
  playerCamera.upperRadiusLimit = 50;
  playerCamera.lowerBetaLimit = Math.PI / 4;
  playerCamera.upperBetaLimit = Math.PI / 2.2;

  new HemisphericLight("light", new Vector3(0, 1, 0), scene);

  // Dark base ground
  const ground = MeshBuilder.CreateGround("ground", { width: 600, height: 600 }, scene);
  ground.position.set(16384, 0, 16384);
  const groundMat = new StandardMaterial("groundMat", scene);
  groundMat.diffuseColor = new Color3(0.1, 0.1, 0.1);
  ground.material = groundMat;

  return scene;
}
