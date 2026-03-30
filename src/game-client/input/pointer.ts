import {
  Color3,
  Mesh,
  PointerEventTypes,
  PointerInfo,
  Scene,
  StandardMaterial,
} from "@babylonjs/core";
import { PlayerManager } from "../entities/players";
import { WORLD } from "../constants";
import { logger } from "../../utils/logger";

export class PointerInput {
  private hoveredMesh: Mesh | null = null;
  private hoveredOriginalColor: Color3 | null = null;

  constructor(
    scene: Scene,
    private players: PlayerManager,
  ) {
    scene.onPointerObservable.add((pi) => this._onPointer(pi));
    logger.game("PointerInput initialised");
  }

  private _onPointer(pi: PointerInfo): void {
    if (pi.type === PointerEventTypes.POINTERMOVE) {
      this._handleHover(pi.pickInfo?.pickedMesh as Mesh | null);
    }
    if (pi.type === PointerEventTypes.POINTERDOWN) {
      this._handleDown(pi);
    }
  }

  private _handleDown(pi: PointerInfo): void {
    if (!pi.pickInfo?.hit || !pi.pickInfo.pickedMesh) return;
    const button = (pi.event as PointerEvent).button;
    if (button === 0) this._handleLeftClick(pi.pickInfo.pickedMesh as Mesh);
  }

  private _handleLeftClick(mesh: Mesh): void {
    const parts = mesh.name.split("-");
    if (parts[0] !== "tile" || parts.length !== 5) return;

    const chunkX = parseInt(parts[1], 10);
    const chunkZ = parseInt(parts[2], 10);
    const col = parseInt(parts[3], 10);
    const row = parseInt(parts[4], 10);

    const x = (chunkX * WORLD.CHUNK_SIZE + col) * WORLD.TILE_SIZE;
    const z = (chunkZ * WORLD.CHUNK_SIZE + row) * WORLD.TILE_SIZE;

    logger.game("Tile clicked", { x, z });
    this.players.moveTo(x, z);
  }

  private _handleHover(mesh: Mesh | null): void {
    if (mesh === this.hoveredMesh) return;

    if (this.hoveredMesh?.material && this.hoveredOriginalColor) {
      (this.hoveredMesh.material as StandardMaterial).diffuseColor = this.hoveredOriginalColor;
    }

    if (mesh?.name.startsWith("tile-")) {
      const mat = mesh.material as StandardMaterial;
      this.hoveredOriginalColor = mat.diffuseColor.clone();
      mat.diffuseColor = Color3.Lerp(mat.diffuseColor, Color3.White(), 0.35);
      this.hoveredMesh = mesh;
    } else {
      this.hoveredMesh = null;
      this.hoveredOriginalColor = null;
    }
  }
}
