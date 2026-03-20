import { HemisphericLight, MeshBuilder, StandardMaterial, Color3, Vector3, Scene } from '@babylonjs/core';

export class GameWorld {
  constructor(private scene: Scene) {
    this.init();
  }

  private init() {
    const light = new HemisphericLight('worldLight', new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.8;

    const ground = MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, this.scene);
    const groundMat = new StandardMaterial('groundMat', this.scene);
    groundMat.diffuseColor = new Color3(0.2, 0.6, 0.2);
    groundMat.specularColor = new Color3(0, 0, 0);
    ground.material = groundMat;
  }
}
