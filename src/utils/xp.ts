// All XP/level logic lives in mmo-shared. This file re-exports what the
// client needs so import paths inside the client stay short and consistent.
//
// maxHpFromSkills is client-only (no combat on the server yet) so it
// lives here rather than in mmo-shared.

export { xpToLevel, levelToXp, xpToNextLevel, getSkillLevel, addXp } from "mmo-shared";
import { getSkillLevel } from "mmo-shared";
import type { Skills } from "mmo-shared";

export function maxHpFromSkills(skills: Skills): number {
  return getSkillLevel(skills, 0) * 10; // skill 0 = hitpoints
}
