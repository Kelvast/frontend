import { PointerEventTypes, PointerInfo, Scene, Observer } from "@babylonjs/core";
import { logger } from "../../utils/logger";
import { DEV_MODE } from "../../utils/dev";
import { sendPlayerMove } from "../../ws/messages/move";

/*
 * PointerInput handles left-click tile selection and sends the destination
 * to the server via WS. All pathfinding is server-side.
 *
 * Click vs drag is disambiguated by tracking pointer-down position and
 * only firing on pointer-up if the pointer moved less than DRAG_THRESHOLD px.
 * This prevents tile clicks from registering during camera orbit.
 *
 * TODO: right-click context menu (examine, attack, pick up)
 * TODO: hover highlight on walkable tiles
 * TODO: drag-select for multi-tile actions
 */

const DRAG_THRESHOLD = 6;

export class PointerInput {
  private observer: Observer<PointerInfo>;
  private downX = 0;
  private downY = 0;
  private isDown = false;

  constructor(private scene: Scene) {
    this.observer = scene.onPointerObservable.add((pi) => this.onPointer(pi));
    logger.game("PointerInput initialised");
  }

  private onPointer(pi: PointerInfo): void {
    try {
      if (pi.type === PointerEventTypes.POINTERDOWN) this.handleDown(pi);
      else if (pi.type === PointerEventTypes.POINTERUP) this.handleUp(pi);
    } catch (err) {
      if (DEV_MODE) logger.game("PointerInput error", { err });
    }
  }

  private handleDown(pi: PointerInfo): void {
    const button = (pi.event as PointerEvent).button;
    if (button !== 0) return;
    this.downX = this.scene.pointerX;
    this.downY = this.scene.pointerY;
    this.isDown = true;
  }

  private handleUp(pi: PointerInfo): void {
    const button = (pi.event as PointerEvent).button;
    if (button !== 0 || !this.isDown) return;
    this.isDown = false;

    const dx = this.scene.pointerX - this.downX;
    const dy = this.scene.pointerY - this.downY;
    if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) return;

    const pick = this.scene.pick(
      this.scene.pointerX,
      this.scene.pointerY,
      (mesh) => mesh.name.startsWith("tile-"),
    );

    if (!pick.hit || !pick.pickedMesh) return;

    /*
     * Tile coords are embedded in the mesh name (tile-{x}-{z}).
     * No world-space math needed — the name is the source of truth.
     */
    const parts = pick.pickedMesh.name.split("-");
    const tileX = parseInt(parts[1], 10);
    const tileZ = parseInt(parts[2], 10);

    if (isNaN(tileX) || isNaN(tileZ)) return;

    if (DEV_MODE) logger.game("Tile clicked", { tileX, tileZ });

    sendPlayerMove(tileX, tileZ);
  }

  dispose(): void {
    this.scene.onPointerObservable.remove(this.observer);
    this.isDown = false;
  }
}
