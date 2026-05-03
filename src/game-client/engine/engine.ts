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
    logger.game("Creating Babylon engine");

    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });
    this.engine.resize();

    this.scene = new Scene(this.engine);
    this.scene.constantlyUpdateMeshUnderPointer = true;

    this.lighting = setupScene(this.scene);

    this.resizeHandler = () => {
      this.engine.resize();
      logger.game("Canvas resized");
    };
    window.addEventListener("resize", this.resizeHandler);

    logger.game("Engine ready");
  }

  startRenderLoop(): void {
    this.engine.runRenderLoop(() => this.scene.render());
  }

  dispose(): void {
    logger.game("Disposing engine");
    window.removeEventListener("resize", this.resizeHandler);
    this.engine.dispose();
  }
}
