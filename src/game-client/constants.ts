export const WORLD = {
  TILE_SIZE: 1,
  CHUNK_SIZE: 16,
} as const;

export const CAMERA = {
  MIN_ZOOM: 3,
  MAX_ZOOM: 30,
  DEFAULT_ALPHA: -Math.PI / 2,
  DEFAULT_BETA: Math.PI / 3,
  DEFAULT_RADIUS: 20,
  ANGULAR_SENSIBILITY: 500,
  ORBIT_SPEED: 0.02,
  WHEEL_PRECISION: 30,
} as const;

export const PLAYER = {
  SIZE: 0.75,
  Y_OFFSET: 0.375,
  LERP_SPEED: 0.12,
} as const;

export const MOVEMENT = {
  BASE_SPEED: 4,
  AGILITY_FACTOR: 0.05,
} as const;
