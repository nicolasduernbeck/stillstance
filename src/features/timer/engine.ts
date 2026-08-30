// Timestamp-derived stopwatch: elapsed time is always computed from anchors, never tick-counted.

export interface EngineState {
  readonly accumulatedMs: number;
  readonly runningSince: number | null;
}

export const IDLE_ENGINE: EngineState = { accumulatedMs: 0, runningSince: null };

export function startEngine(anchor: number): EngineState {
  return { accumulatedMs: 0, runningSince: anchor };
}

export function pauseEngine(state: EngineState, now: number): EngineState {
  if (state.runningSince === null) return state;
  return { accumulatedMs: elapsedMs(state, now), runningSince: null };
}

export function resumeEngine(state: EngineState, now: number): EngineState {
  if (state.runningSince !== null) return state;
  return { accumulatedMs: state.accumulatedMs, runningSince: now };
}

export function elapsedMs(state: EngineState, now: number): number {
  // Negative deltas (device clock set back) clamp to 0 so elapsed never decreases.
  const delta = state.runningSince === null ? 0 : Math.max(0, now - state.runningSince);
  return state.accumulatedMs + delta;
}
