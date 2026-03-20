import { Position } from "./position";
import { TileHeight } from "./world";

export interface NPC {
  id: string;
  name: string;
  position: Position; // permanent home coords in world space
  regionId: string;
}

export interface Interactable {
  id: string;
  type: string;
  position: Position;
  regionId: string;
}
