import type { HoldSeconds, Settings, TransitionSeconds } from '../../types';

// v2: countdown-cycle settings (hold + transition) replaced the v1 prep-time model.
const KEY = 'stillstance:settings:v2';

export const HOLD_OPTIONS: readonly HoldSeconds[] = [15, 20, 30, 45, 60, 90, 120];
export const TRANSITION_OPTIONS: readonly TransitionSeconds[] = [0, 5, 10, 15, 20, 30];

export const DEFAULT_SETTINGS: Settings = {
  holdSeconds: 30,
  transitionSeconds: 10,
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
      holdSeconds: HOLD_OPTIONS.includes(d.holdSeconds as HoldSeconds)
        ? (d.holdSeconds as HoldSeconds)
        : DEFAULT_SETTINGS.holdSeconds,
      transitionSeconds: TRANSITION_OPTIONS.includes(d.transitionSeconds as TransitionSeconds)
        ? (d.transitionSeconds as TransitionSeconds)
        : DEFAULT_SETTINGS.transitionSeconds,
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
