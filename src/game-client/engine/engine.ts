import { Engine, Scene, AssetsManager, CreateAudioEngineAsync } from "@babylonjs/core";
import type { AudioEngineV2 } from "@babylonjs/core";
import { logger } from "../../utils/logger";
import { setupScene } from "./scene-setup";
import type { SceneLighting } from "./scene-setup";

export class GameEngine {
  public readonly engine: Engine;
  public readonly scene: Scene;
  public lighting!: SceneLighting;
  public assets!: AssetsManager;
  public audioEngine: AudioEngineV2 | null = null;

  private resizeHandler: () => void;

  constructor(canvas: HTMLCanvasElement) {
    logger.game("  ▶ Babylon Engine");
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });
    this.engine.resize();
    logger.game("  ✓ Babylon Engine");

    this.resizeHandler = () => {
      this.engine.resize();
      logger.game("canvas resized");
    };
    window.addEventListener("resize", this.resizeHandler);

    logger.game("  ▶ Scene");
    this.scene = new Scene(this.engine);
    this.scene.constantlyUpdateMeshUnderPointer = true;
    logger.game("  ✓ Scene");
  }

  bootScene(): void {
    this.lighting = setupScene(this.scene);
  }

  async bootAssets(): Promise<void> {
    logger.game("  ▶ Assets");
    this.assets = new AssetsManager(this.scene);
    this.assets.useDefaultLoadingScreen = false;
    await new Promise<void>((resolve) => {
      this.assets.onFinish = () => resolve();
      this.assets.load();
    });
    logger.game("  ✓ Assets (0 tasks)");
  }

  /*
   * bootAudio creates the AudioEngine and fires unlockAsync without awaiting it.
   * unlockAsync blocks until the browser receives a user gesture (click/keypress),
   * so awaiting it during programmatic boot would stall the entire sequence.
   * The AudioContext will unlock on the first real user interaction instead.
   */
  async bootAudio(): Promise<void> {
    logger.game("  ▶ Audio");
    try {
      this.audioEngine = await CreateAudioEngineAsync();
      this.audioEngine.unlockAsync().catch(() => {
        logger.game("  ⚠ Audio unlock deferred — waiting for user gesture");
      });
      logger.game("  ✓ Audio");
    } catch {
      logger.game("  ⚠ Audio unavailable — continuing without sound");
    }
  }

  startRenderLoop(): void {
    this.engine.runRenderLoop(() => this.scene.render());
  }

  dispose(): void {
    logger.game("▶ engine dispose");
    window.removeEventListener("resize", this.resizeHandler);
    this.audioEngine?.dispose();
    this.engine.dispose();
    logger.game("✓ engine dispose");
  }
}
