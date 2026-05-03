import { Engine, Scene, AssetsManager, CreateAudioEngineAsync } from "@babylonjs/core";
import type { AudioEngineV2 } from "@babylonjs/core";
import { logger } from "../../utils/logger";
import { setupScene } from "./scene-setup";
import type { SceneLighting } from "./scene-setup";

/*
 * GameEngine owns the Babylon Engine, Scene, AssetsManager, and AudioEngine.
 *
 * Construction is intentionally split into explicit async steps so bootGame
 * can emit a loader event between each one. Nothing heavy happens in the
 * constructor — call the boot* methods in sequence after construction.
 */
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

  /*
   * bootScene — apply lighting and scene config.
   * Kept separate from constructor so bootGame can emit the "scene" stage
   * between engine init and scene setup.
   */
  bootScene(): void {
    this.lighting = setupScene(this.scene);
  }

  /*
   * bootAssets — initialise AssetsManager and load any registered assets.
   * Currently no assets are registered; the manager is created so future
   * texture/mesh loading has a home without changing the boot sequence.
   */
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
   * bootAudio — create the v2 AudioEngine and attempt to unlock it.
   * No sounds are registered yet; this primes the AudioContext so the
   * first in-game sound doesn't stall waiting for a user-gesture unlock.
   * Failure is non-fatal — the game runs silently if audio is unavailable.
   */
  async bootAudio(): Promise<void> {
    logger.game("  ▶ Audio");
    try {
      this.audioEngine = await CreateAudioEngineAsync();
      await this.audioEngine.unlockAsync();
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
