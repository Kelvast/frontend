export function generateRegionIndexTs(regionId: string, regionName: string): string {
  return `import { Region } from "../../../../types";
import { buildRegionFromContext } from "../build-region";

const ctx: RequireContext = require.context(".", false, /^\\.\\/((?!index)-?\\d+_-?\\d+)\\.ts$/);

export function buildRegion(): Region {
  return buildRegionFromContext(ctx, "${regionId}", "${regionName}");
}

export default buildRegion();
`;
}
