import { PointerEventTypes, PointerInfo, Scene, Observer } from "@babylonjs/core";
import { logger } from "../../utils/logger";
import { DEV_MODE } from "../../utils/dev";
import { sendPlayerMove } from "../../ws/messages/move";

/*
 * PointerInput handles left-click tile selection and sends the destination
 * to the server via WS. All pathfinding is server-side.
 *
 * TODO: right-click context menu (examine, attack, pick up)
 * TODO: hover highlight on walkable tiles
 * TODO: drag-select for multi-tile actions
 */
export class PointerInput {
  private observer: Observer<PointerInfo>;

  constructor(private scene: Scene) {
    this.observer = scene.onPointerObservable.add((pi) => this.onPointer(pi));
    logger.game("PointerInput initialised");
  }

  private onPointer(pi: PointerInfo): void {
    try {
      if (pi.type === PointerEventTypes.POINTERDOWN) this.handleDown(pi);
    } catch (err) {
      if (DEV_MODE) logger.game("PointerInput error", { err });
    }
  }

  private handleDown(pi: PointerInfo): void {
    const button = (pi.event as PointerEvent).button;
    if (button !== 0) return;

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
  }
}
