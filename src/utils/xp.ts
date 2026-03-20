const XP_TABLE: number[] = (() => {
  const table = [0];
  for (let lvl = 1; lvl < 99; lvl++) {
    const points = Math.floor(lvl + 300 * Math.pow(2, lvl / 7));
    table.push(table[lvl - 1] + Math.floor(points / 4));
  }
  return table;
})();

export function xpToLevel(xp: number): number {
  let level = 1;
  for (let i = 1; i < XP_TABLE.length; i++) {
    if (xp >= XP_TABLE[i]) level = i + 1;
    else break;
  }
  return Math.min(level, 99);
}

export function levelToXp(level: number): number {
  return XP_TABLE[Math.max(0, level - 1)];
}

export function maxHpFromSkills(hitpointsLevel: number): number {
  return hitpointsLevel * 10;
}
