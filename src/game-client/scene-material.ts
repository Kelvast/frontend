import { Scene, StandardMaterial, Color3, Texture } from "@babylonjs/core";

/**
 * Builds a flat diffuse StandardMaterial in the OSRS low-poly style.
 * No specular shine, no PBR, no reflections - just a painted diffuse colour.
 * StandardMaterial is intentional here: PBRMaterial would fight the aesthetic.
 */
export function makeTerrainMaterial(name: string, color: Color3, scene: Scene): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = color;
  mat.specularColor = Color3.Black(); // zero shine
  mat.specularPower = 0;
  mat.ambientColor = new Color3(0.15, 0.15, 0.15); // subtle self-illumination so shadow areas aren't pure black
  mat.backFaceCulling = false;
  return mat;
}

/**
 * Builds a flat emissive material for dev overlays (outlines, labels).
 * Emissive so it's unaffected by scene lighting and always readable.
 */
export function makeDevMaterial(name: string, color: Color3, scene: Scene): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = Color3.Black();
  mat.emissiveColor = color;
  mat.specularColor = Color3.Black();
  mat.wireframe = true;
  return mat;
}
