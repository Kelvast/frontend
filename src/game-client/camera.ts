import { ArcRotateCamera, Scene, Vector3 } from "@babylonjs/core";
import { CAMERA } from "./constants";
import { logger } from "../utils/logger";

export class GameCamera {
  public readonly camera: ArcRotateCamera;
  private _keys = { left: false, right: false, up: false, down: false };
  private _onKeyDown: (e: KeyboardEvent) => void;
  private _onKeyUp: (e: KeyboardEvent) => void;

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
    this.camera.lowerRadiusLimit = CAMERA.MIN_ZOOM;
    this.camera.upperRadiusLimit = CAMERA.MAX_ZOOM;
    this.camera.lowerBetaLimit = 0.2;
    this.camera.upperBetaLimit = (Math.PI / 2) * 0.95;
    this.camera.angularSensibilityX = CAMERA.ANGULAR_SENSIBILITY;
    this.camera.angularSensibilityY = CAMERA.ANGULAR_SENSIBILITY;

    this._onKeyDown = (e) => {
      if (e.code === "KeyA") this._keys.left = true;
      if (e.code === "KeyD") this._keys.right = true;
      if (e.code === "KeyW") this._keys.up = true;
      if (e.code === "KeyS") this._keys.down = true;
    };
    this._onKeyUp = (e) => {
      if (e.code === "KeyA") this._keys.left = false;
      if (e.code === "KeyD") this._keys.right = false;
      if (e.code === "KeyW") this._keys.up = false;
      if (e.code === "KeyS") this._keys.down = false;
    };

    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);

    scene.onBeforeRenderObservable.add(() => {
      if (this._keys.left) this.camera.alpha -= CAMERA.ORBIT_SPEED;
      if (this._keys.right) this.camera.alpha += CAMERA.ORBIT_SPEED;
      if (this._keys.up) this.camera.beta -= CAMERA.ORBIT_SPEED;
      if (this._keys.down) this.camera.beta += CAMERA.ORBIT_SPEED;
    });

    logger.game("Camera ready");
  }

  followPlayer(target: Vector3) {
    this.camera.setTarget(target);
  }

  dispose() {
    logger.game("Disposing camera");
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
  }
}
