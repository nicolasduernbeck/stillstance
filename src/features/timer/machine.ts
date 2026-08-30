import {
  type EngineState,
  IDLE_ENGINE,
  elapsedMs,
  pauseEngine,
  resumeEngine,
  startEngine,
} from './engine';

export type ActivePhase = 'getReady' | 'holding' | 'transitioning';
export type Phase = 'idle' | ActivePhase | 'paused' | 'finished';

export interface SessionState {
  readonly phase: Phase;
  /** Which phase is frozen while paused. */
  readonly pausedPhase: ActivePhase | null;
  /** Measures elapsed time within the current phase. */
  readonly engine: EngineState;
  readonly holdMs: number;
  readonly transitionMs: number;
  /** Holds started so far — distinguishes back-to-back holds when transition is 0. */
  readonly cycle: number;
  /** Total time from completed hold phases. */
  readonly holdAccumulatedMs: number;
  /** Total time in position, set on finish. */
  readonly finalMs: number | null;
}

export const INITIAL_SESSION: SessionState = {
  phase: 'idle',
  pausedPhase: null,
  engine: IDLE_ENGINE,
  holdMs: 0,
  transitionMs: 0,
  cycle: 0,
  holdAccumulatedMs: 0,
  finalMs: null,
};

export type SessionEvent =
  | { type: 'START'; now: number; holdMs: number; transitionMs: number }
  | { type: 'PHASE_COMPLETE'; now: number }
  | { type: 'PAUSE'; now: number }
  | { type: 'RESUME'; now: number }
  | { type: 'STOP'; now: number }
  | { type: 'AGAIN'; now: number; holdMs: number; transitionMs: number }
  | { type: 'DONE' };

export function isActivePhase(phase: Phase): phase is ActivePhase {
  return phase === 'getReady' || phase === 'holding' || phase === 'transitioning';
}

export function phaseDurationMs(state: SessionState): number {
  const phase = state.phase === 'paused' ? state.pausedPhase : state.phase;
  return phase === 'holding' ? state.holdMs : state.transitionMs;
}

function beginSession(now: number, holdMs: number, transitionMs: number): SessionState {
  // Zero transition skips GET READY and goes straight into the first hold.
  const startsHolding = transitionMs === 0;
  return {
    ...INITIAL_SESSION,
    phase: startsHolding ? 'holding' : 'getReady',
    engine: startEngine(now),
    holdMs,
    transitionMs,
    cycle: startsHolding ? 1 : 0,
  };
}

function finish(state: SessionState, now: number): SessionState {
  const activePhase = state.phase === 'paused' ? state.pausedPhase : state.phase;
  const partialHold = activePhase === 'holding' ? elapsedMs(state.engine, now) : 0;
  return {
    ...state,
    phase: 'finished',
    pausedPhase: null,
    finalMs: state.holdAccumulatedMs + partialHold,
  };
}

// Invalid (phase, event) pairs return state unchanged — this is the guard
// against double-taps, stale timeouts, and race conditions.
export function sessionReducer(state: SessionState, event: SessionEvent): SessionState {
  switch (state.phase) {
    case 'idle':
      if (event.type === 'START') return beginSession(event.now, event.holdMs, event.transitionMs);
      break;

    case 'getReady':
    case 'holding':
    case 'transitioning': {
      if (event.type === 'PHASE_COMPLETE') {
        const duration = phaseDurationMs(state);
        if (elapsedMs(state.engine, event.now) < duration) return state;
        // Gap-free handoff: the next phase starts exactly when this one ended,
        // not when the (possibly late) tick fired. Pauses shift the deadline,
        // so only the still-missing portion counts from the running anchor.
        const anchor =
          state.engine.runningSince !== null
            ? state.engine.runningSince + (duration - state.engine.accumulatedMs)
            : event.now;
        const engine = startEngine(anchor);
        if (state.phase === 'holding') {
          const holdAccumulatedMs = state.holdAccumulatedMs + state.holdMs;
          // Zero transition chains directly into the next hold.
          return state.transitionMs === 0
            ? { ...state, engine, holdAccumulatedMs, cycle: state.cycle + 1 }
            : { ...state, phase: 'transitioning', engine, holdAccumulatedMs };
        }
        // getReady or transitioning → next hold begins.
        return { ...state, phase: 'holding', engine, cycle: state.cycle + 1 };
      }
      if (event.type === 'PAUSE') {
        return {
          ...state,
          phase: 'paused',
          pausedPhase: state.phase,
          engine: pauseEngine(state.engine, event.now),
        };
      }
      if (event.type === 'STOP') {
        // Stopping before the first hold ever started is a cancel, not a result.
        return state.phase === 'getReady' ? INITIAL_SESSION : finish(state, event.now);
      }
      break;
    }

    case 'paused':
      if (event.type === 'RESUME') {
        return {
          ...state,
          phase: state.pausedPhase ?? 'holding',
          pausedPhase: null,
          engine: resumeEngine(state.engine, event.now),
        };
      }
      if (event.type === 'STOP') {
        return state.pausedPhase === 'getReady' ? INITIAL_SESSION : finish(state, event.now);
      }
      break;

    case 'finished':
      if (event.type === 'AGAIN') return beginSession(event.now, event.holdMs, event.transitionMs);
      if (event.type === 'DONE') return INITIAL_SESSION;
      break;
  }
  return state;
}
