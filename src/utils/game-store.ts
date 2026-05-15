import { create } from "zustand";
import { logger } from "./logger";

type Identity = {
  uuid: string;
  playerName: string;
};

type GameStoreState = {
  identity: Identity | null;
  storeIdentity: (identity: Identity) => void;
  onLogout: () => Promise<void>;
};

export const useGameStore = create<GameStoreState>((set) => ({
  identity: null,

  storeIdentity: ({ uuid, playerName }) => {
    logger.auth("Identity stored - uuid:", uuid, "playerName:", playerName);
    set({ identity: { uuid, playerName } });
  },

  onLogout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ identity: null });
    logger.auth("Logged out - identity cleared");
  },
}));
