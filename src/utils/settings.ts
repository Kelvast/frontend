import { UserSettings, DEFAULT_SETTINGS } from "../types/mmo/settings";

const STORAGE_KEY = "mmo-settings";

export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_SETTINGS);
    return { ...structuredClone(DEFAULT_SETTINGS), ...JSON.parse(raw) };
  } catch {
    return structuredClone(DEFAULT_SETTINGS);
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function patchSettings<K extends keyof UserSettings>(
  key: K,
  value: UserSettings[K],
): UserSettings {
  const current = loadSettings();
  const updated = { ...current, [key]: { ...current[key], ...value } };
  saveSettings(updated);
  return updated;
}
