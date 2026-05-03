import { Scene, StandardMaterial, Color3 } from "@babylonjs/core";

/*
 * Shared material factories for the OSRS low-poly aesthetic.
 * No specular shine, no PBR — flat diffuse only.
 * StandardMaterial is intentional; PBRMaterial fights the aesthetic.
 */
export function makeTerrainMaterial(name: string, color: Color3, scene: Scene): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = color;
  mat.specularColor = Color3.Black();
  mat.specularPower = 0;
  mat.ambientColor = new Color3(0.15, 0.15, 0.15);
  mat.backFaceCulling = false;
  return mat;
}

/*
 * Flat emissive material for dev overlays (outlines, wireframes).
 * Unaffected by scene lighting so it stays readable regardless of time-of-day.
 */
export function makeDevMaterial(name: string, color: Color3, scene: Scene): StandardMaterial {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = Color3.Black();
  mat.emissiveColor = color;
  mat.specularColor = Color3.Black();
  mat.wireframe = true;
  return mat;
}
