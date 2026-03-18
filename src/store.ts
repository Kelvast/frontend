import type { ServerPlayer } from "./types";

interface CameraState {
  alpha: number;
  beta: number;
  radius: number;
}

interface GameState {
  myId: number | null;
  players: Map<number, ServerPlayer>;
  camera: CameraState;
  lastTile: { x: number; z: number } | null;
}

const STORAGE_KEY = "mmo_client_state";

// Load persisted camera/tile from localStorage on boot
function loadPersisted(): Pick<GameState, "camera" | "lastTile"> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    camera: { alpha: -Math.PI / 2, beta: Math.PI / 3, radius: 500 },
    lastTile: null,
  };
}

function savePersisted() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      camera: state.camera,
      lastTile: state.lastTile,
    }));
  } catch {}
}

const persisted = loadPersisted();

const state: GameState = {
  myId: null,
  players: new Map(),
  camera: persisted.camera,
  lastTile: persisted.lastTile,
};

// ── Player getters ──────────────────────────────────────
export function getMyId() { return state.myId; }
export function getMyPlayer(): ServerPlayer | undefined {
  if (state.myId === null) return undefined;
  return state.players.get(state.myId);
}
export function getOtherPlayers(): ServerPlayer[] {
  return [...state.players.values()].filter(p => p.id !== state.myId);
}
export function getAllPlayers(): ServerPlayer[] {
  return [...state.players.values()];
}

// ── Camera getters/setters ──────────────────────────────
export function getCameraState(): CameraState {
  return { ...state.camera };
}
export function setCameraState(alpha: number, beta: number, radius: number) {
  state.camera = { alpha, beta, radius };
  savePersisted();
}

// ── Tile getters/setters ────────────────────────────────
export function getLastTile() { return state.lastTile; }
export function setLastTile(x: number, z: number) {
  state.lastTile = { x, z };
  savePersisted();
}

// ── Mutations (net.ts only) ─────────────────────────────
export function setMyId(id: number) {
  state.myId = id;
}
export function syncPlayers(incoming: ServerPlayer[]) {
  const incomingIds = new Set(incoming.map(p => p.id));
  state.players.forEach((_, id) => {
    if (!incomingIds.has(id)) state.players.delete(id);
  });
  incoming.forEach(p => state.players.set(p.id, p));
}
