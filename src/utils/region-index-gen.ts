export function generateRegionIndexTs(regionId: string, chunkKeys: string[]): string {
  const imports = chunkKeys
    .map((k) => {
      const [x, z] = k.split("_");
      return `import chunk_${x.replace("-", "n")}_${z.replace("-", "n")} from "./${k}";`;
    })
    .join("\n");

  const entries = chunkKeys
    .map((k) => {
      const [x, z] = k.split("_");
      const chunkX = Number(x);
      const chunkZ = Number(z);
      const varName = `chunk_${x.replace("-", "n")}_${z.replace("-", "n")}`;
      return `  "${chunkX},${chunkZ}": { ...${varName}, chunkX: ${chunkX}, chunkZ: ${chunkZ}, region: "${regionId}" },`;
    })
    .join("\n");

  return `import { Region } from "../../../../types";

${imports}

const region: Region = {
  id: "${regionId}",
  name: "${regionId}",
  chunks: {
${entries}
  },
};

export default region;
`;
}

export function generateRegionsRootIndexTs(regionIds: string[]): string {
  const imports = regionIds
    .map((id) => `import ${id}Region from "./${id}";`)
    .join("\n");

  const exports = regionIds.map((id) => `  ${id}Region,`).join("\n");

  return `import { Region } from "../../../types";

${imports}

const REGIONS: Region[] = [
${exports}
];

export default REGIONS;
`;
}
