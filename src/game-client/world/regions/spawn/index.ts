import { Region } from "mmo-shared";

import chunk_n1_0 from "./-1_0";
import chunk_n1_1 from "./-1_1";
import chunk_0_n1 from "./0_-1";
import chunk_0_0 from "./0_0";
import chunk_0_1 from "./0_1";
import chunk_1_0 from "./1_0";
import chunk_1_1 from "./1_1";

const region: Region = {
  id: "spawn",
  name: "spawn",
  chunks: {
    "-1,0": { ...chunk_n1_0, chunkX: -1, chunkZ: 0, region: "spawn" },
    "-1,1": { ...chunk_n1_1, chunkX: -1, chunkZ: 1, region: "spawn" },
    "0,-1": { ...chunk_0_n1, chunkX: 0, chunkZ: -1, region: "spawn" },
    "0,0": { ...chunk_0_0, chunkX: 0, chunkZ: 0, region: "spawn" },
    "0,1": { ...chunk_0_1, chunkX: 0, chunkZ: 1, region: "spawn" },
    "1,0": { ...chunk_1_0, chunkX: 1, chunkZ: 0, region: "spawn" },
    "1,1": { ...chunk_1_1, chunkX: 1, chunkZ: 1, region: "spawn" },
  },
};

export default region;
