"use client";
import { createContext, useContext, useState, useCallback, type FC, type ReactNode } from "react";
import { logger } from "../utils/logger";

type Identity = {
  uuid: string;
  playerName: string;
};

type AuthContextValue = {
  identity: Identity | null;
  setIdentity: (identity: Identity) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [identity, setIdentityState] = useState<Identity | null>(null);

  const setIdentity = useCallback((next: Identity) => {
    logger.auth("Identity set - playerName:", next.playerName);
    setIdentityState(next);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIdentityState(null);
    logger.auth("Logged out");
  }, []);

  return (
    <AuthContext.Provider value={{ identity, setIdentity, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
