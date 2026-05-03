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

const PLAYER_HEIGHT = 1.8;

export const PLAYER = {
  SIZE: 0.75,
  HEIGHT: PLAYER_HEIGHT,
  Y_OFFSET: PLAYER_HEIGHT / 2,
  LERP_SPEED: 0.12,
} as const;

export const FLOOR = {
  HEIGHT: PLAYER_HEIGHT + 0.5,
  FIRST_FLOOR: PLAYER_HEIGHT + 0.5,
  SECOND_FLOOR: (PLAYER_HEIGHT + 0.5) * 2,
  THIRD_FLOOR: (PLAYER_HEIGHT + 0.5) * 3,
} as const;

export const MOVEMENT = {
  TILE_DURATION_MS: 250,
} as const;

/*
 * LOADER timing constants.
 * FADE_DURATION_MS  — how long the CSS opacity transition takes.
 * UNMOUNT_DELAY_MS  — how long GamePage waits before unmounting the loader
 *                     after "connected" fires. Must be > FADE_DURATION_MS
 *                     so the transition fully completes before DOM removal.
 */
export const LOADER = {
  FADE_DURATION_MS: 900,
  UNMOUNT_DELAY_MS: 1100,
} as const;
