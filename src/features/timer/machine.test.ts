import { describe, expect, it } from 'vitest';
import { elapsedMs } from './engine';
import { INITIAL_SESSION, sessionReducer, type SessionEvent, type SessionState } from './machine';

function run(...events: SessionEvent[]): SessionState {
  return events.reduce(sessionReducer, INITIAL_SESSION);
}

describe('session machine', () => {
  it('START with prep enters PREPARING', () => {
    const s = run({ type: 'START', now: 1000, prepMs: 3000 });
    expect(s.phase).toBe('preparing');
    expect(s.engine.runningSince).toBe(1000);
  });

  it('START with zero prep skips straight to RUNNING', () => {
    const s = run({ type: 'START', now: 1000, prepMs: 0 });
    expect(s.phase).toBe('running');
  });

  it('countdown completion is ignored while prep time remains', () => {
    const s = run(
      { type: 'START', now: 1000, prepMs: 3000 },
      { type: 'COUNTDOWN_COMPLETE', now: 2000 },
    );
    expect(s.phase).toBe('preparing');
  });

  it('countdown completion anchors the hold gap-free at prep end', () => {
    const s = run(
      { type: 'START', now: 1000, prepMs: 3000 },
      { type: 'COUNTDOWN_COMPLETE', now: 4250 }, // late tick
    );
    expect(s.phase).toBe('running');
    expect(s.engine.runningSince).toBe(4000);
    expect(elapsedMs(s.engine, 4250)).toBe(250);
  });

  it('CANCEL during prep returns to IDLE', () => {
    const s = run({ type: 'START', now: 1000, prepMs: 3000 }, { type: 'CANCEL' });
    expect(s).toEqual(INITIAL_SESSION);
  });

  it('pause and resume keep elapsed accurate', () => {
    const s = run(
      { type: 'START', now: 0, prepMs: 0 },
      { type: 'PAUSE', now: 10000 },
      { type: 'RESUME', now: 60000 },
    );
    expect(s.phase).toBe('running');
    expect(elapsedMs(s.engine, 65000)).toBe(15000);
  });

  it('STOP from running finalizes the duration', () => {
    const s = run({ type: 'START', now: 0, prepMs: 0 }, { type: 'STOP', now: 137000 });
    expect(s.phase).toBe('finished');
    expect(s.finalMs).toBe(137000);
  });

  it('STOP from paused finalizes with the frozen duration', () => {
    const s = run(
      { type: 'START', now: 0, prepMs: 0 },
      { type: 'PAUSE', now: 42000 },
      { type: 'STOP', now: 99000 },
    );
    expect(s.finalMs).toBe(42000);
  });

  it('AGAIN restarts a session from FINISHED', () => {
    const s = run(
      { type: 'START', now: 0, prepMs: 0 },
      { type: 'STOP', now: 5000 },
      { type: 'AGAIN', now: 6000, prepMs: 3000 },
    );
    expect(s.phase).toBe('preparing');
    expect(s.finalMs).toBeNull();
  });

  it('DONE returns to IDLE', () => {
    const s = run(
      { type: 'START', now: 0, prepMs: 0 },
      { type: 'STOP', now: 5000 },
      { type: 'DONE' },
    );
    expect(s).toEqual(INITIAL_SESSION);
  });

  it('ignores invalid events (double-tap protection)', () => {
    const started = run({ type: 'START', now: 0, prepMs: 0 });
    // Second START while running must not reset the anchor.
    expect(sessionReducer(started, { type: 'START', now: 9000, prepMs: 0 })).toBe(started);
    // RESUME while running, PAUSE while idle, stale COUNTDOWN_COMPLETE — all no-ops.
    expect(sessionReducer(started, { type: 'RESUME', now: 9000 })).toBe(started);
    expect(sessionReducer(INITIAL_SESSION, { type: 'PAUSE', now: 1 })).toBe(INITIAL_SESSION);
    expect(sessionReducer(started, { type: 'COUNTDOWN_COMPLETE', now: 9000 })).toBe(started);
  });

  it('double STOP keeps the first final duration', () => {
    const s = run({ type: 'START', now: 0, prepMs: 0 }, { type: 'STOP', now: 5000 });
    expect(sessionReducer(s, { type: 'STOP', now: 9000 })).toBe(s);
  });
});
