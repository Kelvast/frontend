import { FreeCamera, Vector3, Scene, PointerInfo, PickingInfo } from '@babylonjs/core';

export class GameCamera {
  private camera: FreeCamera;

  constructor(scene: Scene) {
    this.camera = new FreeCamera('gameCamera', new Vector3(0, 15, -25), scene);
    this.camera.setTarget(Vector3.Zero());
    this.camera.attachControl(scene.getEngine().getRenderingCanvas()!, true);
    this.camera.speed = 0.3;
    this.camera.inertia = 0.9;

    // WASD + Click-to-move (MU Online)
    this.camera.keysUp.push(87); this.camera.keysDown.push(83);
    this.camera.keysLeft.push(65); this.camera.keysRight.push(68);

    scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
      if (pointerInfo.type === 4 && pointerInfo.pickInfo?.hit) {
        const pickInfo = pointerInfo.pickInfo as PickingInfo;
        if (pickInfo.pickedPoint) {
          this.camera.setTarget(pickInfo.pickedPoint);
        }
      }
    });

    this.camera.lowerBetaLimit = 0.1;
    this.camera.upperBetaLimit = (Math.PI / 2) * 0.99;
    this.camera.lowerRadiusLimit = 3;
  }

  followPlayerSmooth(target: Vector3, speed = 0.05) {
    const targetPos = new Vector3(target.x, target.y + 5, target.z + 10);
    this.camera.setPosition(Vector3.Lerp(this.camera.position, targetPos, speed));
  }

  followPlayer(target: Vector3) {
    this.camera.setTarget(target);
  }
}
