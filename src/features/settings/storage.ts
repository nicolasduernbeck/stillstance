import type { PrepSeconds, Settings } from '../../types';

const KEY = 'stillstance:settings:v1';

export const PREP_OPTIONS: readonly PrepSeconds[] = [0, 3, 5, 10];

export const DEFAULT_SETTINGS: Settings = {
  prepSeconds: 3,
  milestonesEnabled: false,
  vibrationEnabled: true,
  soundEnabled: false,
  keepAwakeEnabled: true,
};

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

// Per-field fallback: corrupt or partial data can never crash startup.
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const data: unknown = JSON.parse(raw);
    if (typeof data !== 'object' || data === null) return DEFAULT_SETTINGS;
    const d = data as Record<string, unknown>;
    return {
      prepSeconds: PREP_OPTIONS.includes(d.prepSeconds as PrepSeconds)
        ? (d.prepSeconds as PrepSeconds)
        : DEFAULT_SETTINGS.prepSeconds,
      milestonesEnabled: bool(d.milestonesEnabled, DEFAULT_SETTINGS.milestonesEnabled),
      vibrationEnabled: bool(d.vibrationEnabled, DEFAULT_SETTINGS.vibrationEnabled),
      soundEnabled: bool(d.soundEnabled, DEFAULT_SETTINGS.soundEnabled),
      keepAwakeEnabled: bool(d.keepAwakeEnabled, DEFAULT_SETTINGS.keepAwakeEnabled),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Storage unavailable (private mode, quota) — settings just won't persist.
  }
}
