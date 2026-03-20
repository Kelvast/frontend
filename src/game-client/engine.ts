import { Engine, Scene, Color4 } from "@babylonjs/core";

export class GameEngine {
  public readonly engine: Engine;
  public readonly scene: Scene;
  private _resizeHandler: () => void;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });
    this.engine.resize();
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.53, 0.81, 0.98, 1);

    this._resizeHandler = () => this.engine.resize();
    window.addEventListener("resize", this._resizeHandler);
  }

  dispose() {
    window.removeEventListener("resize", this._resizeHandler);
    this.engine.dispose();
  }
}
