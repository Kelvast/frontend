import { Region } from "../../../../types";
import { buildRegionFromContext } from "../build-region";

const ctx: RequireContext = require.context(".", false, /^\.\/((?!index)\d+-\d+)\.ts$/);

export function buildRegion(): Region {
  return buildRegionFromContext(ctx, "spawn", "Spawn");
}

export default buildRegion();
