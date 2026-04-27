import {
  Scene,
  HemisphericLight,
  DirectionalLight,
  Vector3,
  Color3,
  Color4,
  ShadowGenerator,
} from "@babylonjs/core";
import { logger } from "../utils/logger";

// Warm afternoon sun angle - slightly from the side for readable tile shadows
const SUN_DIRECTION = new Vector3(-1, -2, -0.5);

// Classic OSRS sky - muted blue, not saturated
const SKY_COLOR = new Color4(0.49, 0.62, 0.73, 1);

export interface SceneLighting {
  shadowGenerator: ShadowGenerator;
}

/**
 * Applies OSRS-inspired lighting to the scene:
 * warm directional sun, cool-tinted ambient fill, flat sky colour.
 * Returns the ShadowGenerator so chunk meshes can be registered as shadow casters.
 */
export function setupScene(scene: Scene): SceneLighting {
  scene.clearColor = SKY_COLOR;

  // Soft cool ambient - fills shadows without washing out silhouettes
  const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), scene);
  ambient.intensity = 0.55;
  ambient.diffuse = new Color3(0.78, 0.85, 0.95); // cool skylight
  ambient.groundColor = new Color3(0.28, 0.24, 0.18); // warm ground bounce

  // Warm directional sun - restrained intensity to keep the low-poly read clean
  const sun = new DirectionalLight("sun", SUN_DIRECTION, scene);
  sun.intensity = 0.9;
  sun.diffuse = new Color3(1.0, 0.92, 0.72); // slightly warm afternoon

  // Short-range shadow map - readable but not cinematic
  const shadowGenerator = new ShadowGenerator(512, sun);
  shadowGenerator.useExponentialShadowMap = true;
  shadowGenerator.depthScale = 30;
  shadowGenerator.bias = 0.003;

  logger.game("Scene set up");
  return { shadowGenerator };
}
