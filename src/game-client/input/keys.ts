import { Scene } from "@babylonjs/core";
import { GameCamera } from "../camera";
import { CAMERA } from "../constants";
import { logger } from "../../utils/logger";

export class KeysInput {
  private keys = { left: false, right: false, up: false, down: false };
  private _onKeyDown: (e: KeyboardEvent) => void;
  private _onKeyUp: (e: KeyboardEvent) => void;

  constructor(scene: Scene, camera: GameCamera) {
    this._onKeyDown = (e) => {
      if (e.code === "KeyA") this.keys.left = true;
      if (e.code === "KeyD") this.keys.right = true;
      if (e.code === "KeyW") this.keys.up = true;
      if (e.code === "KeyS") this.keys.down = true;
    };
    this._onKeyUp = (e) => {
      if (e.code === "KeyA") this.keys.left = false;
      if (e.code === "KeyD") this.keys.right = false;
      if (e.code === "KeyW") this.keys.up = false;
      if (e.code === "KeyS") this.keys.down = false;
    };

    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);

    scene.onBeforeRenderObservable.add(() => {
      if (this.keys.left) camera.orbit("left");
      if (this.keys.right) camera.orbit("right");
      if (this.keys.up) camera.orbit("up");
      if (this.keys.down) camera.orbit("down");
    });

    logger.game("KeysInput initialised");
  }

  dispose(): void {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
  }
}
