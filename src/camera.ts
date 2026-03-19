import { ArcRotateCamera, Vector3, Scene } from "@babylonjs/core";
import { getCameraState, setCameraState } from "./store";
import { WORLD_ORIGIN } from "./constants";

export let playerCamera: ArcRotateCamera;

export function createCamera(canvas: HTMLCanvasElement, scene: Scene): ArcRotateCamera {
  const { alpha, beta, radius } = getCameraState();

  playerCamera = new ArcRotateCamera(
    "camera",
    alpha,
    beta,
    radius,
    new Vector3(WORLD_ORIGIN, 0, WORLD_ORIGIN),
    scene
  );

  playerCamera.attachControl(canvas, true);
  playerCamera.lowerRadiusLimit = 100;
  playerCamera.upperRadiusLimit = 1000;
  playerCamera.lowerBetaLimit = Math.PI / 4;
  playerCamera.upperBetaLimit = Math.PI / 2.2;
  playerCamera.wheelPrecision = 0.5;

  playerCamera.onViewMatrixChangedObservable.add(() => {
    setCameraState(playerCamera.alpha, playerCamera.beta, playerCamera.radius);
  });

  return playerCamera;
}

export function followTarget(position: Vector3) {
  if (!playerCamera) return;
  const alpha = playerCamera.alpha;
  const beta = playerCamera.beta;
  const radius = playerCamera.radius;
  playerCamera.setTarget(position.clone());
  playerCamera.alpha = alpha;
  playerCamera.beta = beta;
  playerCamera.radius = radius;
}
