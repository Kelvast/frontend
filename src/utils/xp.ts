// All XP/level logic lives in mmo-shared. This file re-exports what the
// client needs so import paths inside the client stay short and consistent.
//
// maxHpFromSkills is client-only (no combat on the server yet) so it
// lives here rather than in mmo-shared.

import { getSkillLevel, Skill } from "kelvast-shared";
import type { Skills } from "kelvast-shared";

export function maxHpFromSkills(skills: Skills): number {
  return getSkillLevel(skills, Skill.Hitpoints) * 10;
}
