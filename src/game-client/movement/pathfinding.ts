import type { Coords } from "mmo-shared";
import type { GameWorld } from "../world";

const MAX_PATH_LENGTH = 64;

interface Node {
  x: number;
  z: number;
  g: number;
  h: number;
  parent: Node | null;
}

function heuristic(ax: number, az: number, bx: number, bz: number): number {
  return Math.abs(ax - bx) + Math.abs(az - bz);
}

function key(x: number, z: number): string {
  return `${x},${z}`;
}

const NEIGHBOURS: [number, number][] = [
  [0, -1],
  [0, 1],
  [-1, 0],
  [1, 0],
];

export function buildClientPath(
  fromX: number,
  fromZ: number,
  toX: number,
  toZ: number,
  world: GameWorld,
): Coords[] {
  if (fromX === toX && fromZ === toZ) return [];

  const destNode = world.getNavNode(toX, toZ);
  if (!destNode || !destNode.walkable) return [];

  const open: Node[] = [];
  const closed = new Set<string>();
  const openMap = new Map<string, Node>();

  const start: Node = {
    x: fromX,
    z: fromZ,
    g: 0,
    h: heuristic(fromX, fromZ, toX, toZ),
    parent: null,
  };
  open.push(start);
  openMap.set(key(fromX, fromZ), start);

  while (open.length) {
    open.sort((a, b) => a.g + a.h - (b.g + b.h));
    const current = open.shift()!;
    const currentKey = key(current.x, current.z);

    if (current.x === toX && current.z === toZ) {
      const path: Coords[] = [];
      let node: Node | null = current;
      while (node) {
        const nav = world.getNavNode(node.x, node.z);
        path.unshift({ x: node.x, y: nav?.y ?? 0, floor: nav?.floor ?? 0, z: node.z });
        node = node.parent;
      }
      /*
       * Strip the starting tile — the player is already there.
       * Cap at MAX_PATH_LENGTH to match server validation limit.
       */
      return path.slice(1, MAX_PATH_LENGTH + 1);
    }

    closed.add(currentKey);
    openMap.delete(currentKey);

    for (const [dx, dz] of NEIGHBOURS) {
      const nx = current.x + dx;
      const nz = current.z + dz;
      const nKey = key(nx, nz);

      if (closed.has(nKey)) continue;

      const nav = world.getNavNode(nx, nz);
      if (!nav || !nav.walkable) continue;

      const g = current.g + 1;
      const existing = openMap.get(nKey);

      if (!existing) {
        const node: Node = { x: nx, z: nz, g, h: heuristic(nx, nz, toX, toZ), parent: current };
        open.push(node);
        openMap.set(nKey, node);
      } else if (g < existing.g) {
        existing.g = g;
        existing.parent = current;
      }
    }
  }

  return [];
}
