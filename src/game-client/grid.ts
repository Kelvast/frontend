import { MeshBuilder, Color3, Vector3, Scene } from '@babylonjs/core';

export class GameGrid {
  constructor(private scene: Scene) {
    this.createGrid();
  }

  private createGrid() {
    const lineArrays: Vector3[][] = [];

    for (let x = -50; x <= 50; x += 5) {
      lineArrays.push([
        new Vector3(x, 0.01, -50),
        new Vector3(x, 0.01, 50),
      ]);
    }

    for (let z = -50; z <= 50; z += 5) {
      lineArrays.push([
        new Vector3(-50, 0.01, z),
        new Vector3(50, 0.01, z),
      ]);
    }

    const grid = MeshBuilder.CreateLineSystem('grid', { lines: lineArrays }, this.scene);
    grid.color = new Color3(0.4, 0.4, 0.4);
  }
}
