import { Region } from "mmo-shared";

import chunk_0_0 from "./0_0";

const region: Region = {
  id: "spawn",
  name: "spawn",
  chunks: {
    "0,0": { ...chunk_0_0, chunkX: 0, chunkZ: 0, region: "spawn", objects: [], npcSpawns: [] },
  },
};

export default region;
