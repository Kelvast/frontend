import { CAMERA } from "../../game-client/constants";

export interface CameraSettings {
  alpha: number;
  beta: number;
  radius: number;
}

export interface GraphicsSettings {
  renderDistance: number;
}

export interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
}

export interface UserSettings {
  camera: CameraSettings;
  graphics: GraphicsSettings;
  audio: AudioSettings;
}

export const DEFAULT_SETTINGS: UserSettings = {
  camera: {
    alpha: CAMERA.DEFAULT_ALPHA,
    beta: CAMERA.DEFAULT_BETA,
    radius: CAMERA.DEFAULT_RADIUS,
  },
  graphics: {
    renderDistance: 2,
  },
  audio: {
    masterVolume: 1,
    musicVolume: 0.5,
    sfxVolume: 0.8,
  },
};
