import { Position } from "./position";

export interface NPC {
  id: string;
  name: string;
  position: Position;
  regionId: string;
}

export interface Interactable {
  id: string;
  type: string;
  position: Position;
  regionId: string;
}
