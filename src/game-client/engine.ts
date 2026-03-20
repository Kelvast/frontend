import { Engine, Scene } from '@babylonjs/core';

export class GameEngine {
  public readonly engine: Engine;
  public readonly scene: Scene;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false
    });
    this.scene = new Scene(this.engine);
    
    this.engine.runRenderLoop(() => this.scene.render());
    window.addEventListener('resize', () => this.engine.resize());
  }
  
  dispose() {
    window.removeEventListener('resize', () => {});
    this.engine.dispose();
  }
}
