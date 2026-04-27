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
  SIZE: 0.75, // Mesh collision radius - visual only, not game logic
  HEIGHT: PLAYER_HEIGHT,
  Y_OFFSET: PLAYER_HEIGHT / 2, // Mesh origin is centre-mass, offset to sit on floor
  LERP_SPEED: 0.12, // Interpolation factor per frame toward target position
} as const;

export const FLOOR = {
  HEIGHT: PLAYER_HEIGHT + 0.5,
  FIRST_FLOOR: PLAYER_HEIGHT + 0.5,
  SECOND_FLOOR: (PLAYER_HEIGHT + 0.5) * 2,
  THIRD_FLOOR: (PLAYER_HEIGHT + 0.5) * 3,
} as const;

export const MOVEMENT = {
  TILE_DURATION_MS: 250, // Client-side animation duration per tile - visual feel only
} as const;
