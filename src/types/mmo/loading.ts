export type LoadStage =
  | "authenticating"
  | "session"
  | "connecting"
  | "engine"
  | "scene"
  | "assets"
  | "audio"
  | "world"
  | "camera"
  | "players"
  | "input"
  | "connected"
  | "error";

export interface LoadEvent {
  stage: LoadStage;
  detail?: string;
}

export type OnLoadEvent = (event: LoadEvent) => void;
