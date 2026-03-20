import { xpToLevel } from "../../utils/xp";

export const SKILL_NAMES = [
  "attack",
  "strength",
  "defence",
  "hitpoints",
  "ranged",
  "prayer",
  "magic",
  "cooking",
  "woodcutting",
  "fletching",
  "fishing",
  "firemaking",
  "crafting",
  "smithing",
  "mining",
  "herblore",
  "agility",
  "thieving",
  "slayer",
  "farming",
  "runecrafting",
  "hunter",
  "construction",
] as const;

export type SkillName = (typeof SKILL_NAMES)[number];

export interface Skill {
  level: number;
  xp: number;
}

export type Skills = Record<SkillName, Skill>;

export function skillFromXp(xp: number): Skill {
  return { level: xpToLevel(xp), xp };
}

export function defaultSkills(): Skills {
  return Object.fromEntries(SKILL_NAMES.map((name) => [name, skillFromXp(0)])) as Skills;
}
