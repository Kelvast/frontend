import { 
  CreateLines, CreateGround, StandardMaterial, Color3, Color4, 
  Vector3, DynamicTexture, Scene, Mesh, Texture 
} from '@babylonjs/core';

export class GameGrid {
  constructor(private scene: Scene) {
    this.createGrid();
    this.createGroundTexture();
  }

  private createGrid() {
    const gridSize = 100;
    const lines: Vector3[] = [];
    
    for (let i = 0; i <= gridSize; i += 10) {
      lines.push(new Vector3(i - 50, 0.02, -50));
      lines.push(new Vector3(i - 50, 0.02, 50));
      lines.push(new Vector3(-50, 0.02, i - 50));
      lines.push(new Vector3(50, 0.02, i - 50));
    }

    const gridLines = CreateLines('grid', { points: lines }, this.scene);
    gridLines.color = new Color3(1, 1, 1);
  }

  private createGroundTexture() {
    const ground = CreateGround('groundTexture', { width: 100, height: 100 }, this.scene);
    
    const groundMat = new StandardMaterial('groundMat', this.scene);
    const texture = new DynamicTexture('grassTex', 512, this.scene, true);
    
    const context = texture.getContext();
    const imageData = context.getImageData(0, 0, 512, 512);
    
    for (let x = 0; x < 512; x += 32) {
      for (let z = 0; z < 512; z += 32) {
        const grassColor = (x + z) % 64 < 32 
          ? new Color4(0.1, 0.4, 0.1, 1)
          : new Color4(0.2, 0.5, 0.2, 1);
          
        for (let px = 0; px < 32; px++) {
          for (let pz = 0; pz < 32; pz++) {
            const idx = ((z + pz) * 512 + (x + px)) * 4;
            imageData.data[idx] = grassColor.r * 255;
            imageData.data[idx + 1] = grassColor.g * 255;
            imageData.data[idx + 2] = grassColor.b * 255;
            imageData.data[idx + 3] = 255;
          }
        }
      }
    }
    
    context.putImageData(imageData, 0, 0);
    
    // ✅ FIXED: Required samplingMode argument
    texture.updateSamplingMode(Texture.TRILINEAR_SAMPLINGMODE);
    
    groundMat.diffuseTexture = texture;
    ground.material = groundMat;
  }
}
