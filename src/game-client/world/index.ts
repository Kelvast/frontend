import { HemisphericLight, Vector3, Scene } from "@babylonjs/core";

export class GameWorld {
  constructor(private scene: Scene) {
    this.init();
  }

  private init() {
    const light = new HemisphericLight("worldLight", new Vector3(0, 1, 0), this.scene);
    light.intensity = 0.8;
  }
}
