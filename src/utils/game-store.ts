import { create } from "zustand";
import type { GameStoreState } from "../types";
import type { UserSettings } from "../types/mmo/settings";
import { loadSettings, patchSettings } from "./settings";
import { logger } from "./logger";
import { defaultSkills, defaultInventory, defaultEquipment } from "kelvast-shared";
import type { Coords, ResolvedPace } from "kelvast-shared";

export const useGameStore = create<GameStoreState>((set) => ({
  identity: null,
  gameSessionToken: null,
  gameSessionExpiresAt: null,
  localPlayer: null,
  nearbyPlayers: [],
  worldTime: 0,
  isConnected: false,
  latency: 0,
  settings: loadSettings(),
  pendingPath: null,

  setConnected: (connected) => {
    logger.game("Connection state:", connected ? "connected" : "disconnected");
    set({ isConnected: connected });
  },

  storeIdentity: ({ uuid, playerName }) => {
    logger.auth("Identity stored - uuid:", uuid, "playerName:", playerName);
    set({ identity: { uuid, playerName } });
  },

  storeGameSession: ({ gameSessionToken, gameSessionExpiresAt }) => {
    logger.game("Game session stored, expires:", new Date(gameSessionExpiresAt).toISOString());
    set({ gameSessionToken, gameSessionExpiresAt });
  },

  onLoginSuccess: (msg) => {
    set((state) => {
      if (!state.identity) {
        logger.warn("onLoginSuccess called before storeIdentity - identity missing");
      }
      const localPlayer = {
        id: msg.id,
        uuid: state.identity?.uuid ?? msg.uuid,
        playerName: state.identity?.playerName ?? msg.playerName,
        x: msg.x,
        y: msg.y,
        floor: msg.floor,
        z: msg.z,
        facing: msg.facing,
        skills: defaultSkills(),
        inventory: defaultInventory(),
        equipment: defaultEquipment(),
        isMoving: false,
        pace: "walk" as const,
        lastUpdated: Date.now(),
        animationState: "idle" as const,
      };
      logger.game("Local player ready - id:", msg.id, "uuid:", localPlayer.uuid);
      return { localPlayer };
    });
  },

  onLogout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({
      identity: null,
      gameSessionToken: null,
      gameSessionExpiresAt: null,
      localPlayer: null,
      nearbyPlayers: [],
      isConnected: false,
      pendingPath: null,
    });
    logger.auth("Logged out - identity and session cleared");
  },

  onWorldState: ({ players }) => {
    set({
      nearbyPlayers: players.map((p) => ({
        id: p.id,
        playerName: p.playerName,
        x: p.x,
        y: p.y,
        floor: p.floor,
        z: p.z,
        facing: p.facing,
        isMoving: false,
        lastUpdated: Date.now(),
        animationState: "idle" as const,
      })),
    });
    logger.game("World state received - players in range:", players.length);
  },

  onPlayerJoin: (msg) =>
    set((state) => {
      const player = {
        id: msg.player.id,
        playerName: msg.player.playerName,
        x: msg.player.x,
        y: msg.player.y,
        floor: msg.player.floor,
        z: msg.player.z,
        facing: msg.player.facing,
        isMoving: false,
        lastUpdated: Date.now(),
        animationState: "idle" as const,
      };
      logger.game("Player joined - id:", msg.player.id, "playerName:", msg.player.playerName);
      const exists = state.nearbyPlayers.some((p) => p.id === msg.player.id);
      return {
        nearbyPlayers: exists
          ? state.nearbyPlayers.map((p) => (p.id === msg.player.id ? { ...p, ...player } : p))
          : [...state.nearbyPlayers, player],
      };
    }),

  onPlayerLeave: ({ id }) =>
    set((state) => {
      logger.game("Player left - id:", id);
      return { nearbyPlayers: state.nearbyPlayers.filter((p) => p.id !== id) };
    }),

  onTick: ({ players }) =>
    set((state) => {
      const updates = new Map(
        players.map(({ id, x, y, floor, z, facing, pace }) => [
          id,
          { x, y, floor, z, facing, pace, isMoving: true },
        ]),
      );
      return {
        nearbyPlayers: state.nearbyPlayers.map((player) => {
          const delta = updates.get(player.id);
          if (!delta) return player;
          return { ...player, ...delta, lastUpdated: Date.now() };
        }),
      };
    }),

  onPlayerStopped: ({ id, x, y, floor, z, facing }) =>
    set((state) => ({
      nearbyPlayers: state.nearbyPlayers.map((p) =>
        p.id === id
          ? { ...p, x, y, floor, z, facing, isMoving: false, lastUpdated: Date.now() }
          : p,
      ),
    })),

  onPlayerData: (msg) =>
    set((state) => {
      if (!state.localPlayer) {
        logger.warn("onPlayerData received before localPlayer exists - ignoring");
        return {};
      }
      logger.game("Player data received - applying skills/inventory/equipment");
      return {
        localPlayer: {
          ...state.localPlayer,
          skills: msg.skills,
          inventory: msg.inventory,
          equipment: msg.equipment,
        },
      };
    }),

  onPlayerMoveAck: (path: Coords[], pace: ResolvedPace) => {
    set((state) => {
      const last = path.at(-1);
      if (!last || !state.localPlayer) return { pendingPath: { path, pace } };
      return {
        pendingPath: { path, pace },
        localPlayer: {
          ...state.localPlayer,
          x: last.x,
          y: last.y,
          floor: last.floor,
          z: last.z,
          isMoving: true,
        },
      };
    });
  },

  clearPendingPath: () => {
    set({ pendingPath: null });
  },

  updateSettings: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    const updated = patchSettings(key, value);
    logger.game(`Settings updated - ${key}:`, value);
    set({ settings: updated });
  },
}));
