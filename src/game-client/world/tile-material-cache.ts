import { Scene, StandardMaterial, Color3 } from "@babylonjs/core";
import { TileData } from "kelvast-shared";
import { getTileRenderConfig } from "./tile-render";

const cache = new Map<string, StandardMaterial>();

export function getTileMaterial(tile: TileData, scene: Scene): StandardMaterial {
  const key = `${tile.type}:${tile.y}`;
  const existing = cache.get(key);
  if (existing) return existing;

  const mat = new StandardMaterial(`tile-mat-${key}`, scene);
  mat.diffuseColor = getTileRenderConfig(tile).color;
  mat.specularColor = Color3.Black();
  mat.freeze();

  cache.set(key, mat);
  return mat;
}

export function clearTileMaterialCache(): void {
  cache.forEach((m) => m.dispose());
  cache.clear();
}
