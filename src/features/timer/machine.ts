import { type EngineState, IDLE_ENGINE, elapsedMs, pauseEngine, resumeEngine, startEngine } from './engine';

export type Phase = 'idle' | 'preparing' | 'running' | 'paused' | 'finished';

export interface SessionState {
  readonly phase: Phase;
  readonly engine: EngineState;
  readonly prepMs: number;
  readonly finalMs: number | null;
}

export const INITIAL_SESSION: SessionState = {
  phase: 'idle',
  engine: IDLE_ENGINE,
  prepMs: 0,
  finalMs: null,
};

export type SessionEvent =
  | { type: 'START'; now: number; prepMs: number }
  | { type: 'COUNTDOWN_COMPLETE'; now: number }
  | { type: 'CANCEL' }
  | { type: 'PAUSE'; now: number }
  | { type: 'RESUME'; now: number }
  | { type: 'STOP'; now: number }
  | { type: 'AGAIN'; now: number; prepMs: number }
  | { type: 'DONE' };

function beginSession(now: number, prepMs: number): SessionState {
  return {
    phase: prepMs > 0 ? 'preparing' : 'running',
    engine: startEngine(now),
    prepMs,
    finalMs: null,
  };
}

// Invalid (phase, event) pairs return state unchanged — this is the guard
// against double-taps, stale timeouts, and race conditions.
export function sessionReducer(state: SessionState, event: SessionEvent): SessionState {
  switch (state.phase) {
    case 'idle':
      if (event.type === 'START') return beginSession(event.now, event.prepMs);
      break;

    case 'preparing':
      if (event.type === 'COUNTDOWN_COMPLETE') {
        if (elapsedMs(state.engine, event.now) < state.prepMs) return state;
        // Gap-free handoff: the hold starts exactly when the countdown ended,
        // not when the (possibly late) tick fired.
        const anchor = (state.engine.runningSince ?? event.now) + state.prepMs;
        return { ...state, phase: 'running', engine: startEngine(anchor) };
      }
      if (event.type === 'CANCEL') return INITIAL_SESSION;
      break;

    case 'running':
      if (event.type === 'PAUSE') {
        return { ...state, phase: 'paused', engine: pauseEngine(state.engine, event.now) };
      }
      if (event.type === 'STOP') {
        return { ...state, phase: 'finished', finalMs: elapsedMs(state.engine, event.now) };
      }
      break;

    case 'paused':
      if (event.type === 'RESUME') {
        return { ...state, phase: 'running', engine: resumeEngine(state.engine, event.now) };
      }
      if (event.type === 'STOP') {
        return { ...state, phase: 'finished', finalMs: elapsedMs(state.engine, event.now) };
      }
      break;

    case 'finished':
      if (event.type === 'AGAIN') return beginSession(event.now, event.prepMs);
      if (event.type === 'DONE') return INITIAL_SESSION;
      break;
  }
  return state;
}
