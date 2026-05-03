import { Engine, Scene, AssetsManager, AudioEngine } from "@babylonjs/core";
import { logger } from "../../utils/logger";
import { setupScene } from "./scene-setup";
import type { SceneLighting } from "./scene-setup";
import type { OnLoadEvent } from "../../types/mmo/loading";

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
   * bootAudio — unlock the AudioEngine so the browser permits audio playback.
   * No sounds are registered yet; this primes the context so the first
   * in-game sound doesn't stall waiting for user-gesture unlock.
   */
  bootAudio(): void {
    logger.game("  ▶ Audio");
    try {
      AudioEngine.audioEngine?.unlock();
    } catch {
      /* AudioEngine may not be available in all environments */
    }
    logger.game("  ✓ Audio");
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
