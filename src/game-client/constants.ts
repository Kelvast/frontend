export const WORLD = {
  TILE_SIZE: 1, // visual size of a single tile in Babylon world units
  CHUNK_SIZE: 16, // tiles per chunk edge — 16×16 = 256 tiles per chunk
} as const;

export const CAMERA = {
  MIN_ZOOM: 5, // closest the camera can zoom in (world units)
  MAX_ZOOM: 40, // furthest the camera can zoom out (world units)
  DEFAULT_ALPHA: -Math.PI / 2, // default horizontal orbit — directly behind player
  DEFAULT_BETA: Math.PI / 3, // default vertical angle — ~60° above ground
  DEFAULT_RADIUS: 20, // default zoom distance from player on load
  ANGULAR_SENSIBILITY: 500, // mouse drag sensitivity — higher = slower rotation
  ORBIT_SPEED: 0.02, // W/S tilt speed in radians per frame
} as const;

export const PLAYER = {
  SIZE: 2, // player mesh bounding box size (width, height, depth)
  Y_OFFSET: 1, // vertical offset so player sits on ground (SIZE / 2)
  LERP_SPEED: 0.12, // lerp factor for smoothing remote player position updates
} as const;

export const CHUNK_MANAGER = {
  LOAD_RADIUS: 1, // chunks to keep loaded in each direction — 1 = 3×3 grid, 2 = 5×5
} as const;

export const INPUT = {
  MOVE_SPEED: 5, // units per second for camera pan (WASD, future use)
} as const;

export const MOVEMENT = {
  TILE_DURATION_MS: 600, // ms to traverse one tile at full walking speed
  EASE_IN_TILES: 2, // tiles at path start to accelerate over
  EASE_OUT_TILES: 1, // tiles at path end to decelerate over
  MAX_PATH_LENGTH: 25, // max tiles that can be queued in a single click-to-move
} as const;
