import { useCallback, useEffect, useReducer } from 'react';
import { elapsedMs } from './engine';
import { INITIAL_SESSION, sessionReducer, type SessionState } from './machine';

export interface SessionActions {
  start: () => void;
  cancel: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  again: () => void;
  done: () => void;
}

export function useSession(prepSeconds: number): { state: SessionState; actions: SessionActions } {
  const [state, dispatch] = useReducer(sessionReducer, INITIAL_SESSION);

  // Countdown auto-completion. The timestamp check makes it idempotent and
  // immune to timer throttling; visibilitychange resyncs after backgrounding.
  useEffect(() => {
    if (state.phase !== 'preparing') return;
    let timeout = 0;
    const check = () => {
      const remaining = state.prepMs - elapsedMs(state.engine, Date.now());
      if (remaining <= 0) {
        dispatch({ type: 'COUNTDOWN_COMPLETE', now: Date.now() });
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

  const prepMs = prepSeconds * 1000;
  const start = useCallback(() => dispatch({ type: 'START', now: Date.now(), prepMs }), [prepMs]);
  const again = useCallback(() => dispatch({ type: 'AGAIN', now: Date.now(), prepMs }), [prepMs]);
  const cancel = useCallback(() => dispatch({ type: 'CANCEL' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE', now: Date.now() }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME', now: Date.now() }), []);
  const stop = useCallback(() => dispatch({ type: 'STOP', now: Date.now() }), []);
  const done = useCallback(() => dispatch({ type: 'DONE' }), []);

  return { state, actions: { start, cancel, pause, resume, stop, again, done } };
}
