import { Region } from "../../../../types";

import chunk_0_n1 from "./0_-1";
import chunk_0_0 from "./0_0";

const region: Region = {
  id: "spawn",
  name: "spawn",
  chunks: {
  "0,-1": { ...chunk_0_n1, chunkX: 0, chunkZ: -1, region: "spawn" },
  "0,0": { ...chunk_0_0, chunkX: 0, chunkZ: 0, region: "spawn" },
  },
};

export default region;
