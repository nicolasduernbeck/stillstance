import { useCallback, useEffect, useReducer } from 'react';
import { elapsedMs } from './engine';
import {
  INITIAL_SESSION,
  isActivePhase,
  phaseDurationMs,
  sessionReducer,
  type SessionState,
} from './machine';

export interface SessionActions {
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  again: () => void;
  done: () => void;
}

export function useSession(
  holdSeconds: number,
  transitionSeconds: number,
): {
  state: SessionState;
  actions: SessionActions;
} {
  const [state, dispatch] = useReducer(sessionReducer, INITIAL_SESSION);

  // Phase auto-completion. The timestamp check makes it idempotent and immune
  // to timer throttling; visibilitychange resyncs after backgrounding, and
  // phases missed in the background are caught up by chained dispatches.
  useEffect(() => {
    if (!isActivePhase(state.phase)) return;
    const duration = phaseDurationMs(state);
    let timeout = 0;
    const check = () => {
      const remaining = duration - elapsedMs(state.engine, Date.now());
      if (remaining <= 0) {
        dispatch({ type: 'PHASE_COMPLETE', now: Date.now() });
      } else {
        timeout = window.setTimeout(check, Math.min(remaining + 5, 500));
      }
    };
    check();
    document.addEventListener('visibilitychange', check);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', check);
    };
  }, [state]);

  const holdMs = holdSeconds * 1000;
  const transitionMs = transitionSeconds * 1000;
  const start = useCallback(
    () => dispatch({ type: 'START', now: Date.now(), holdMs, transitionMs }),
    [holdMs, transitionMs],
  );
  const again = useCallback(
    () => dispatch({ type: 'AGAIN', now: Date.now(), holdMs, transitionMs }),
    [holdMs, transitionMs],
  );
  const pause = useCallback(() => dispatch({ type: 'PAUSE', now: Date.now() }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME', now: Date.now() }), []);
  const stop = useCallback(() => dispatch({ type: 'STOP', now: Date.now() }), []);
  const done = useCallback(() => dispatch({ type: 'DONE' }), []);

  return { state, actions: { start, pause, resume, stop, again, done } };
}
