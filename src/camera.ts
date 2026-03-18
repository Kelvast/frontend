import { ArcRotateCamera, Vector3, Scene } from "@babylonjs/core";

export let playerCamera: ArcRotateCamera;

export function createCamera(canvas: HTMLCanvasElement, scene: Scene): ArcRotateCamera {
  playerCamera = new ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 3,
    500,
    new Vector3(16384, 0, 16384),
    scene
  );

  playerCamera.attachControl(canvas, true);
  playerCamera.lowerRadiusLimit = 100;
  playerCamera.upperRadiusLimit = 1000;
  playerCamera.lowerBetaLimit = Math.PI / 4;
  playerCamera.upperBetaLimit = Math.PI / 2.2;
  playerCamera.wheelPrecision = 0.5;

  return playerCamera;
}

// RS-style: pan target to follow player, preserve angle/zoom
export function followTarget(position: Vector3) {
  if (!playerCamera) return;

  const alpha = playerCamera.alpha;
  const beta = playerCamera.beta;
  const radius = playerCamera.radius;

  playerCamera.target = position.clone();

  playerCamera.alpha = alpha;
  playerCamera.beta = beta;
  playerCamera.radius = radius;
}
