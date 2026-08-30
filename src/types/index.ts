export type PrepSeconds = 0 | 3 | 5 | 10;

export interface Settings {
  prepSeconds: PrepSeconds;
  milestonesEnabled: boolean;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  keepAwakeEnabled: boolean;
}

// Reserved for the future local-history feature; not persisted in MVP.
export interface Session {
  id: string;
  startedAt: number;
  durationMs: number;
}
