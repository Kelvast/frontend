import { LinesBuilder, Scene, Color3, Vector3 } from '@babylonjs/core';

export class GameGrid {
  constructor(private scene: Scene) {
    this.createGrid();
  }

  private createGrid() {
    const gridSize = 100;
    const lines: Vector3[] = [];
    
    // X axis lines
    for (let i = 0; i <= gridSize; i += 5) {
      lines.push(new Vector3(i - gridSize/2, 0, -gridSize/2));
      lines.push(new Vector3(i - gridSize/2, 0, gridSize/2));
    }
    
    // Z axis lines
    for (let i = 0; i <= gridSize; i += 5) {
      lines.push(new Vector3(-gridSize/2, 0, i - gridSize/2));
      lines.push(new Vector3(gridSize/2, 0, i - gridSize/2));
    }

    const gridLines = LinesBuilder.CreateLines('grid', { points: lines });
    gridLines.color = new Color3(0.3, 0.3, 0.3);
  }
}
