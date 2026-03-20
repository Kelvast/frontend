import { Engine, Scene, Color4 } from "@babylonjs/core";
import { logger } from "../utils/logger";

export class GameEngine {
  public readonly engine: Engine;
  public readonly scene: Scene;
  private _resizeHandler: () => void;

  constructor(canvas: HTMLCanvasElement) {
    logger.game("Creating Babylon engine");
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });
    this.engine.resize();

    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.53, 0.81, 0.98, 1);
    this.scene.constantlyUpdateMeshUnderPointer = true;

    this._resizeHandler = () => {
      this.engine.resize();
      logger.game("Canvas resized");
    };
    window.addEventListener("resize", this._resizeHandler);
    logger.game("Engine ready");
  }

  dispose(): void {
    logger.game("Disposing engine");
    window.removeEventListener("resize", this._resizeHandler);
    this.engine.dispose();
  }
}
