import {
  Mesh,
  PointerEventTypes,
  PointerInfo,
  Scene,
} from "@babylonjs/core";
import { PlayerManager } from "../entities/players";
import { logger } from "../../utils/logger";
import { DEV_MODE } from "../../utils/dev";
import { WORLD } from "mmo-shared";

export class PointerInput {
  private scene: Scene;

  constructor(
    scene: Scene,
    private players: PlayerManager,
  ) {
    this.scene = scene;
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

    const pick = this.scene.pick(
      this.scene.pointerX,
      this.scene.pointerY,
      (mesh) => mesh.name.startsWith("grid-"),
    );

    if (DEV_MODE) logger.game("POINTERDOWN", { hit: pick.hit, mesh: pick.pickedMesh?.name ?? null, point: pick.pickedPoint });

    if (!pick.hit || !pick.pickedPoint) {
      if (DEV_MODE) logger.game("Click missed — no grid mesh hit");
      return;
    }

    const tileX = Math.floor(pick.pickedPoint.x / WORLD.TILE_SIZE);
    const tileZ = Math.floor(pick.pickedPoint.z / WORLD.TILE_SIZE);
    const worldX = tileX * WORLD.TILE_SIZE;
    const worldZ = tileZ * WORLD.TILE_SIZE;

    logger.game("Tile clicked", { tileX, tileZ, worldX, worldZ });
    this.players.moveTo(worldX, worldZ);
  }
}
