import { ArcRotateCamera, Scene, Vector3 } from '@babylonjs/core';

const MIN_ZOOM = 5;
const MAX_ZOOM = 40;
const DEFAULT_ALPHA = -Math.PI / 2;
const DEFAULT_BETA = Math.PI / 3;
const DEFAULT_RADIUS = 20;
const FOLLOW_SPEED = 0.1;
const ROTATE_SPEED = 0.02;

export class GameCamera {
  public readonly camera: ArcRotateCamera;
  private rotateLeft = false;
  private rotateRight = false;

  constructor(scene: Scene) {
    this.camera = new ArcRotateCamera(
      'gameCamera',
      DEFAULT_ALPHA,
      DEFAULT_BETA,
      DEFAULT_RADIUS,
      Vector3.Zero(),
      scene
    );

    this.camera.attachControl(scene.getEngine().getRenderingCanvas()!, true);

    // Zoom limits
    this.camera.lowerRadiusLimit = MIN_ZOOM;
    this.camera.upperRadiusLimit = MAX_ZOOM;

    // Vertical angle limits (prevent going underground or flipping)
    this.camera.lowerBetaLimit = 0.2;
    this.camera.upperBetaLimit = (Math.PI / 2) * 0.95;

    // Free rotation via middle mouse — already default on ArcRotateCamera
    this.camera.angularSensibilityX = 500;
    this.camera.angularSensibilityY = 500;

    this._setupKeyboardRotation(scene);
  }

  private _setupKeyboardRotation(scene: Scene) {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyA') this.rotateLeft = true;
      if (e.code === 'KeyD') this.rotateRight = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyA') this.rotateLeft = false;
      if (e.code === 'KeyD') this.rotateRight = false;
    });

    scene.onBeforeRenderObservable.add(() => {
      if (this.rotateLeft) this.camera.alpha -= ROTATE_SPEED;
      if (this.rotateRight) this.camera.alpha += ROTATE_SPEED;
    });
  }

  followPlayer(target: Vector3) {
    const smoothed = Vector3.Lerp(this.camera.target, target, FOLLOW_SPEED);
    this.camera.setTarget(smoothed);
  }

  dispose() {
    window.removeEventListener('keydown', () => {});
    window.removeEventListener('keyup', () => {});
  }
}
