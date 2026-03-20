import { TileHeight } from "./world";

export interface NPC {
  id: string;
  name: string;
  x: number;
  y: TileHeight;
  z: number;
  region: string;
}
