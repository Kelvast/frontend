import { Scene } from "@babylonjs/core";
import { Position } from "../types";

export class GameInput {
  private keys = new Set<string>();
  private mouseDown = false;
  private targetPosition: Position = { x: 0, y: 0, z: 0 };

  constructor(scene: Scene) {
    // Keyboard
    window.addEventListener("keydown", (e) => this.keys.add(e.code));
    window.addEventListener("keyup", (e) => this.keys.delete(e.code));

    // Mouse click move
    scene.onPointerObservable.add((pi) => {
      if (pi.type === 4 && pi.pickInfo?.hit) {
        // LEFT_CLICK
        const pick = pi.pickInfo as any;
        this.targetPosition = {
          x: pick.pickedPoint!.x,
          y: 0,
          z: pick.pickedPoint!.z,
        };
      }
    });
  }

  update(delta: number) {
    // WASD movement
    const speed = 5 * delta;
    let dx = 0,
      dz = 0;
    if (this.keys.has("KeyW")) dz -= speed;
    if (this.keys.has("KeyS")) dz += speed;
    if (this.keys.has("KeyA")) dx -= speed;
    if (this.keys.has("KeyD")) dx += speed;

    return { dx, dz, targetPosition: this.targetPosition };
  }
}
