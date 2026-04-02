import { Scene, HemisphericLight, DirectionalLight, Vector3, Color3 } from "@babylonjs/core";
import { logger } from "../utils/logger";

/**
 * Configures ambient and directional lighting for the game scene.
 * Called once during world initialisation — extracted from GameWorld to keep
 * world.ts focused on region/chunk state management.
 */
export function setupLighting(scene: Scene): void {
  const ambient = new HemisphericLight("ambient", new Vector3(0, 1, 0), scene);
  ambient.intensity = 0.6;
  ambient.diffuse = new Color3(1, 1, 1);
  ambient.groundColor = new Color3(0.3, 0.3, 0.3);

  const sun = new DirectionalLight("sun", new Vector3(-1, -2, -1), scene);
  sun.intensity = 0.8;
  sun.diffuse = new Color3(1, 0.95, 0.8);
  logger.game("Lighting set up");
}
