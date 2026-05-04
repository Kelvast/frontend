import { ChunkData, TILES } from "mmo-shared";

const { G, D, S, GI1, GI2, GI3, GI4, GI5, GI6, GI7, GI8, GD1, GD2, GD3, GD4, GD5, GD6, DI2, DI4, DD2, DD4, DD6, SI3, SI5, SI8, SD3, SD5, SD8 } = TILES; // prettier-ignore

export default {
  pvp: false,
  tiles: [
    // Row 0 — gentle western rise, flat east
    [G, G, GI1, GI2, GI3, GI4, GI3, GI2, GI1, G, G, G, G, G, G, G],
    // Row 1 — hill begins to build
    [G, GI1, GI2, GI3, GI4, GI5, GI5, GI4, GI2, GI1, G, G, G, GD1, GD1, G],
    // Row 2 — peak of first hill, dirt path cuts through
    [G, GI2, GI4, GI6, GI7, GI8, GI8, GI6, GI4, GI2, G, D, DI2, DI4, DI2, D],
    // Row 3 — hill plateau with stone outcrop
    [G, GI1, GI3, GI5, GI7, GI8, GI8, GI7, GI5, GI3, SI3, SI5, SI8, SI5, DI4, D],
    // Row 4 — descent begins east side
    [G, G, GI2, GI4, GI6, GI7, GI8, GI7, GI6, GI4, SI5, SI8, SI5, SI3, DI2, D],
    // Row 5 — valley floor
    [G, G, G, GI1, GI3, GI5, GI6, GI5, GI3, GI1, G, S, SI3, D, D, D],
    // Row 6 — flat valley, stone road begins
    [G, G, G, G, GI1, GI2, GI3, GI2, GI1, G, G, S, S, S, DD2, GD1],
    // Row 7 — valley transitions to decline
    [G, G, G, G, G, GI1, GI1, G, G, G, S, S, SD3, SD3, GD3, GD2],
    // Row 8 — descent into dungeon entrance area
    [G, G, GD1, GD1, G, G, G, G, GD1, GD2, GD3, SD3, SD5, GD4, GD4, GD3],
    // Row 9 — dungeon slope steepens
    [G, GD1, GD2, GD3, GD2, GD1, G, GD1, GD2, GD4, GD5, GD5, SD5, SD8, GD5, GD4],
    // Row 10 — deep decline, stone walls close in
    [GD1, GD2, GD3, GD4, GD4, GD3, GD2, GD3, GD4, GD5, GD6, SD8, SD8, SD5, GD6, GD5],
    // Row 11 — dungeon entrance
    [GD2, GD3, GD4, GD5, GD5, GD4, GD4, GD5, GD5, GD6, GD6, GD6, SD8, GD6, GD6, GD6],
    // Row 12 — dungeon floor transitioning to flat stone
    [GD3, GD4, GD5, GD6, GD6, GD5, GD5, GD6, GD6, GD6, SD8, SD8, SD5, SD3, DD6, DD4],
    // Row 13 — underground cavern
    [GD4, GD5, GD6, GD6, GD6, GD6, GD6, GD6, SD8, SD8, SD8, SD5, SD3, DD4, DD4, DD2],
    // Row 14 — deeper cavern, dirt and stone mix
    [GD5, GD6, GD6, GD6, SD8, SD8, SD8, SD8, SD5, SD5, SD3, DD6, DD6, DD4, DD2, D],
    // Row 15 — cavern floor, flat deep dungeon base
    [GD6, GD6, SD8, SD8, SD8, SD5, SD3, DD6, DD6, DD4, DD4, DD2, D, D, D, D],
  ],
} satisfies Pick<ChunkData, "pvp" | "tiles">;
