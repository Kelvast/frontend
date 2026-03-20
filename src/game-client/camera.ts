import { 
  ArcRotateCamera, Vector3, Scene, PointerInfo, PickingInfo, 
  ActionManager, ExecuteCodeAction 
} from '@babylonjs/core';

export class GameCamera {
  public readonly camera: ArcRotateCamera;

  constructor(scene: Scene) {
    this.camera = new ArcRotateCamera(
      'gameCamera', 
      Math.PI / 2, Math.PI / 4, 20, 
      Vector3.Zero(), scene
    );
    this.camera.attachControl(scene.getEngine().getRenderingCanvas()!, true);
    
    this.camera.lowerBetaLimit = 0.1;
    this.camera.upperBetaLimit = (Math.PI / 2) * 0.99;
    this.camera.lowerRadiusLimit = 3;

    // ✅ FIXED: Click-to-move for ArcRotateCamera
    scene.actionManager = new ActionManager(scene);
    scene.actionManager.registerAction(
      new ExecuteCodeAction(
        ActionManager.OnLeftPickTrigger,
        (evt) => {
          const pickInfo = evt.source?.pickInfo as PickingInfo;
          if (pickInfo.hit && pickInfo.pickedPoint) {
            // Move camera target to clicked world point
            this.camera.setTarget(pickInfo.pickedPoint);
            
            // Broadcast to server (your WS)
            window.dispatchEvent(new CustomEvent('playerMove', {
              detail: {
                x: pickInfo.pickedPoint.x,
                y: 0,
                z: pickInfo.pickedPoint.z
              }
            }));
          }
        }
      )
    );

    // Mouse wheel zoom
    this.camera.inputs.addMouseWheel();
  }

  followPlayer(target: Vector3) {
    this.camera.setTarget(target);
  }

  followPlayerSmooth(target: Vector3, speed = 0.05) {
    const smoothed = Vector3.Lerp(this.camera.target, target, speed);
    this.camera.setTarget(smoothed);
  }
}
