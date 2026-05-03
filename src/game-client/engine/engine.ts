import { Engine, Scene } from "@babylonjs/core";
import { logger } from "../../utils/logger";
import { setupScene } from "./scene-setup";
import type { SceneLighting } from "./scene-setup";

/*
 * GameEngine owns the Babylon Engine and Scene.
 * scene-setup.ts applies lighting — kept separate so lighting config
 * can be changed without touching the engine bootstrap.
 */
export class GameEngine {
  public readonly engine: Engine;
  public readonly scene: Scene;
  public readonly lighting: SceneLighting;

  private resizeHandler: () => void;

  constructor(canvas: HTMLCanvasElement) {
    logger.game("  ▶ Babylon Engine");
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });
    this.engine.resize();

    logger.game("  ▶ Scene");
    this.scene = new Scene(this.engine);
    this.scene.constantlyUpdateMeshUnderPointer = true;

    this.lighting = setupScene(this.scene);
    logger.game("  ✓ Scene + lighting");

    this.resizeHandler = () => {
      this.engine.resize();
      logger.game("canvas resized");
    };
    window.addEventListener("resize", this.resizeHandler);
  }

  startRenderLoop(): void {
    this.engine.runRenderLoop(() => this.scene.render());
  }

  dispose(): void {
    logger.game("▶ engine dispose");
    window.removeEventListener("resize", this.resizeHandler);
    this.engine.dispose();
    logger.game("✓ engine dispose");
  }
}
