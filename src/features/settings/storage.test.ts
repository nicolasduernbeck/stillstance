import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from './storage';

const KEY = 'stillstance:settings:v1';

describe('settings storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns defaults when nothing is stored', () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('round-trips settings', () => {
    const custom = { ...DEFAULT_SETTINGS, prepSeconds: 10 as const, soundEnabled: true };
    saveSettings(custom);
    expect(loadSettings()).toEqual(custom);
  });

  it('falls back per field on corrupt values', () => {
    localStorage.setItem(KEY, JSON.stringify({ prepSeconds: 7, soundEnabled: true, vibrationEnabled: 'yes' }));
    const s = loadSettings();
    expect(s.prepSeconds).toBe(3);
    expect(s.soundEnabled).toBe(true);
    expect(s.vibrationEnabled).toBe(true);
  });

  it('survives unparseable JSON', () => {
    localStorage.setItem(KEY, '{not json');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
