import { Scene } from "@babylonjs/core";
import { GameCamera } from "./camera";
import { logger } from "../../utils/logger";

/*
 * KeysInput processes WASD keyboard input and maps it to camera orbit.
 *
 * TODO: decouple from camera — emit an InputIntent event instead so
 *       player movement and camera can both listen independently
 * TODO: support rebindable keys via a key-binding config store
 * TODO: gamepad input
 */
export class KeysInput {
  private keys = { left: false, right: false, up: false, down: false };
  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;

  constructor(scene: Scene, camera: GameCamera) {
    this.onKeyDown = (e) => {
      if (e.code === "KeyA") this.keys.left = true;
      if (e.code === "KeyD") this.keys.right = true;
      if (e.code === "KeyW") this.keys.up = true;
      if (e.code === "KeyS") this.keys.down = true;
    };
    this.onKeyUp = (e) => {
      if (e.code === "KeyA") this.keys.left = false;
      if (e.code === "KeyD") this.keys.right = false;
      if (e.code === "KeyW") this.keys.up = false;
      if (e.code === "KeyS") this.keys.down = false;
    };

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    scene.onBeforeRenderObservable.add(() => {
      if (this.keys.left) camera.orbit("left");
      if (this.keys.right) camera.orbit("right");
      if (this.keys.up) camera.orbit("up");
      if (this.keys.down) camera.orbit("down");
    });

    logger.game("KeysInput initialised");
  }

  dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
