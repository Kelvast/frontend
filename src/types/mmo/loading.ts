export type LoadStage =
  | "authenticating"
  | "session"
  | "connecting"
  | "engine"
  | "world"
  | "player_data"
  | "connected"
  | "error";

export interface LoadEvent {
  stage: LoadStage;
  detail?: string;
}

export type OnLoadEvent = (event: LoadEvent) => void;
