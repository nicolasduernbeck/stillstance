export type HoldSeconds = 15 | 20 | 30 | 45 | 60 | 90 | 120;
export type TransitionSeconds = 0 | 5 | 10 | 15 | 20 | 30;

export interface Settings {
  holdSeconds: HoldSeconds;
  transitionSeconds: TransitionSeconds;
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
