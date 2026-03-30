import {
  ArcRotateCamera,
  ArcRotateCameraPointersInput,
  ArcRotateCameraMouseWheelInput,
  Scene,
  AbstractMesh,
  Vector3,
} from "@babylonjs/core";
import { CAMERA } from "./constants";
import { logger } from "../utils/logger";

export class GameCamera {
  public readonly camera: ArcRotateCamera;

  constructor(scene: Scene) {
    logger.game("Creating camera");

    this.camera = new ArcRotateCamera(
      "gameCamera",
      CAMERA.DEFAULT_ALPHA,
      CAMERA.DEFAULT_BETA,
      CAMERA.DEFAULT_RADIUS,
      Vector3.Zero(),
      scene,
    );

    this.camera.attachControl(scene.getEngine().getRenderingCanvas()!, true);

    const pointersInput = this.camera.inputs.attached["pointers"] as ArcRotateCameraPointersInput;
    pointersInput.buttons = [1, 2];

    const wheelInput = this.camera.inputs.attached["mousewheel"] as ArcRotateCameraMouseWheelInput;
    wheelInput.wheelPrecision = CAMERA.WHEEL_PRECISION;

    this.camera.lowerRadiusLimit = CAMERA.MIN_ZOOM;
    this.camera.upperRadiusLimit = CAMERA.MAX_ZOOM;
    this.camera.lowerBetaLimit = 0.2;
    this.camera.upperBetaLimit = (Math.PI / 2) * 0.95;
    this.camera.angularSensibilityX = CAMERA.ANGULAR_SENSIBILITY;
    this.camera.angularSensibilityY = CAMERA.ANGULAR_SENSIBILITY;

    logger.game("Camera ready");
  }

  attachToMesh(mesh: AbstractMesh): void {
    this.camera.lockedTarget = mesh;
  }

  orbit(direction: "left" | "right" | "up" | "down"): void {
    if (direction === "left") this.camera.alpha -= CAMERA.ORBIT_SPEED;
    if (direction === "right") this.camera.alpha += CAMERA.ORBIT_SPEED;
    if (direction === "up") this.camera.beta -= CAMERA.ORBIT_SPEED;
    if (direction === "down") this.camera.beta += CAMERA.ORBIT_SPEED;
  }

  dispose(): void {
    logger.game("Disposing camera");
    this.camera.lockedTarget = null;
  }
}
