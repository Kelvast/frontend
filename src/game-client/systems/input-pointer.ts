import { PointerEventTypes, PointerInfo, Scene, Observer } from "@babylonjs/core";
import { PlayerManager } from "../entities/players";
import { logger } from "../../utils/logger";
import { DEV_MODE } from "../../utils/dev";
import { WORLD } from "mmo-shared";

/*
 * PointerInput handles left-click tile selection and routes it to
 * PlayerManager.moveTo().
 *
 * TODO: right-click context menu (examine, attack, pick up)
 * TODO: hover highlight on walkable tiles
 * TODO: drag-select for multi-tile actions
 */
export class PointerInput {
  private observer: Observer<PointerInfo>;

  constructor(
    private scene: Scene,
    private players: PlayerManager,
  ) {
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

    const pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY, (mesh) =>
      mesh.name.startsWith("grid-"),
    );

    if (DEV_MODE)
      logger.game("POINTERDOWN", {
        hit: pick.hit,
        mesh: pick.pickedMesh?.name ?? null,
        point: pick.pickedPoint,
      });

    if (!pick.hit || !pick.pickedPoint) return;

    const s = WORLD.TILE_SIZE;
    const tileX = Math.floor(pick.pickedPoint.x / s);
    const tileZ = Math.floor(pick.pickedPoint.z / s);

    logger.game("Tile clicked", { tileX, tileZ });
    this.players.moveTo(tileX, tileZ);
  }

  dispose(): void {
    this.scene.onPointerObservable.remove(this.observer);
  }
}
