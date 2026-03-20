import { Scene } from "@babylonjs/core";
import { Position } from "../types";
import { logger } from "../utils/logger";

export class GameInput {
  private _onKeyDown: (e: KeyboardEvent) => void;
  private _onKeyUp: (e: KeyboardEvent) => void;
  private keys = new Set<string>();
  private targetPosition: Position = { x: 0, y: 0, z: 0 };

  constructor(scene: Scene) {
    logger.game("GameInput initialised");

    this._onKeyDown = (e) => this.keys.add(e.code);
    this._onKeyUp = (e) => this.keys.delete(e.code);

    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);

    scene.onPointerObservable.add((pi) => {
      if (pi.type === 4 && pi.pickInfo?.hit) {
        const point = pi.pickInfo.pickedPoint!;
        this.targetPosition = { x: point.x, y: 0, z: point.z };
        logger.game("Click target set:", this.targetPosition);
      }
    });
  }

  update(delta: number) {
    return { targetPosition: this.targetPosition };
  }

  dispose() {
    logger.game("Disposing GameInput");
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
  }
}
