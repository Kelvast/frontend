import { PointerEventTypes, PointerInfo, Scene } from "@babylonjs/core";
import { PlayerManager } from "../entities/players";
import { logger } from "../../utils/logger";
import { DEV_MODE } from "../../utils/dev";
import { WORLD } from "mmo-shared";

export class PointerInput {
  constructor(
    private scene: Scene,
    private players: PlayerManager,
  ) {
    scene.onPointerObservable.add((pi) => this._onPointer(pi));
    logger.game("PointerInput initialised");
  }

  private _onPointer(pi: PointerInfo): void {
    try {
      if (pi.type === PointerEventTypes.POINTERDOWN) {
        this._handleDown(pi);
      }
    } catch (err) {
      if (DEV_MODE) logger.game("PointerInput error", { err });
    }
  }

  private _handleDown(pi: PointerInfo): void {
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

    if (!pick.hit || !pick.pickedPoint) {
      if (DEV_MODE) logger.game("Click missed - no grid mesh hit");
      return;
    }

    const s = WORLD.TILE_SIZE;
    const tileX = Math.floor(pick.pickedPoint.x / s);
    const tileZ = Math.floor(pick.pickedPoint.z / s);

    // world position = tile centre
    const worldX = tileX * s + s / 2;
    const worldZ = tileZ * s + s / 2;

    logger.game("Tile clicked", { tileX, tileZ, worldX, worldZ });
    this.players.moveTo(tileX, tileZ);
  }
}
