import { describe, expect, it } from "vitest";
import { elapsedMs } from "./engine";
import {
  INITIAL_SESSION,
  sessionReducer,
  type SessionEvent,
  type SessionState,
} from "./machine";

const HOLD = 30000;
const TRANSITION = 10000;

function run(...events: SessionEvent[]): SessionState {
  return events.reduce(sessionReducer, INITIAL_SESSION);
}

const start = (
  now = 0,
  holdMs = HOLD,
  transitionMs = TRANSITION,
): SessionEvent => ({
  type: "START",
  now,
  holdMs,
  transitionMs,
});

describe("session machine (countdown cycle)", () => {
  it("START enters GET READY using the transition time", () => {
    const s = run(start(1000));
    expect(s.phase).toBe("getReady");
    expect(s.engine.runningSince).toBe(1000);
    expect(s.transitionMs).toBe(TRANSITION);
  });

  it("phase completion is ignored while time remains", () => {
    const s = run(start(0), { type: "PHASE_COMPLETE", now: 9000 });
    expect(s.phase).toBe("getReady");
  });

  it("GET READY transitions to HOLDING with a gap-free anchor", () => {
    const s = run(start(0), { type: "PHASE_COMPLETE", now: 10250 }); // late tick
    expect(s.phase).toBe("holding");
    expect(s.engine.runningSince).toBe(10000);
    expect(s.cycle).toBe(1);
    expect(elapsedMs(s.engine, 10250)).toBe(250);
  });

  it("HOLDING transitions to TRANSITIONING and accumulates hold time", () => {
    const s = run(
      start(0),
      { type: "PHASE_COMPLETE", now: 10000 }, // → holding
      { type: "PHASE_COMPLETE", now: 40000 }, // → transitioning
    );
    expect(s.phase).toBe("transitioning");
    expect(s.holdAccumulatedMs).toBe(HOLD);
    expect(s.engine.runningSince).toBe(40000);
  });

  it("TRANSITIONING returns to HOLDING and the cycle repeats", () => {
    const s = run(
      start(0),
      { type: "PHASE_COMPLETE", now: 10000 }, // hold 1
      { type: "PHASE_COMPLETE", now: 40000 }, // transition
      { type: "PHASE_COMPLETE", now: 50000 }, // hold 2
      { type: "PHASE_COMPLETE", now: 80000 }, // transition
      { type: "PHASE_COMPLETE", now: 90000 }, // hold 3
    );
    expect(s.phase).toBe("holding");
    expect(s.cycle).toBe(3);
    expect(s.holdAccumulatedMs).toBe(2 * HOLD);
  });

  it("zero transition starts HOLDING immediately and chains hold to hold", () => {
    const started = run(start(0, HOLD, 0));
    expect(started.phase).toBe("holding");
    expect(started.cycle).toBe(1);

    const next = sessionReducer(started, {
      type: "PHASE_COMPLETE",
      now: 30000,
    });
    expect(next.phase).toBe("holding");
    expect(next.cycle).toBe(2);
    expect(next.holdAccumulatedMs).toBe(HOLD);
    expect(next.engine.runningSince).toBe(30000);
  });

  it("pause preserves the phase and the exact remaining time", () => {
    const s = run(
      start(0),
      { type: "PHASE_COMPLETE", now: 10000 },
      { type: "PAUSE", now: 22000 }, // 12 s into the hold → 18 s remaining
    );
    expect(s.phase).toBe("paused");
    expect(s.pausedPhase).toBe("holding");
    expect(elapsedMs(s.engine, 99999999)).toBe(12000);
  });

  it("resume continues the same phase from the remaining time, not from the start", () => {
    const s = run(
      start(0),
      { type: "PHASE_COMPLETE", now: 10000 },
      { type: "PAUSE", now: 22000 },
      { type: "RESUME", now: 60000 },
    );
    expect(s.phase).toBe("holding");
    // 12 s already elapsed; 5 s after resume → 17 s elapsed, 13 s remaining.
    expect(elapsedMs(s.engine, 65000)).toBe(17000);
  });

  it("completion after resume fires at the correct shifted deadline", () => {
    const s = run(
      start(0),
      { type: "PHASE_COMPLETE", now: 10000 },
      { type: "PAUSE", now: 22000 },
      { type: "RESUME", now: 60000 },
      { type: "PHASE_COMPLETE", now: 77000 }, // hold not done yet (17 s < 30 s)
    );
    expect(s.phase).toBe("holding");
    const done = sessionReducer(s, { type: "PHASE_COMPLETE", now: 78000 });
    expect(done.phase).toBe("transitioning");
  });

  it("STOP during a hold finishes with completed plus partial hold time", () => {
    const s = run(
      start(0),
      { type: "PHASE_COMPLETE", now: 10000 },
      { type: "PHASE_COMPLETE", now: 40000 },
      { type: "PHASE_COMPLETE", now: 50000 },
      { type: "STOP", now: 57000 }, // 7 s into hold 2
    );
    expect(s.phase).toBe("finished");
    expect(s.finalMs).toBe(HOLD + 7000);
  });

  it("STOP during a transition counts only completed holds", () => {
    const s = run(
      start(0),
      { type: "PHASE_COMPLETE", now: 10000 },
      { type: "PHASE_COMPLETE", now: 40000 },
      { type: "STOP", now: 45000 },
    );
    expect(s.finalMs).toBe(HOLD);
  });

  it("STOP during GET READY cancels back to idle", () => {
    const s = run(start(0), { type: "STOP", now: 5000 });
    expect(s).toEqual(INITIAL_SESSION);
  });

  it("STOP while paused in GET READY cancels; while paused in a hold it finishes frozen", () => {
    const cancelled = run(
      start(0),
      { type: "PAUSE", now: 5000 },
      { type: "STOP", now: 9000 },
    );
    expect(cancelled).toEqual(INITIAL_SESSION);

    const finished = run(
      start(0),
      { type: "PHASE_COMPLETE", now: 10000 },
      { type: "PAUSE", now: 22000 },
      { type: "STOP", now: 99000 },
    );
    expect(finished.phase).toBe("finished");
    expect(finished.finalMs).toBe(12000);
  });

  it("AGAIN restarts a session and DONE returns to idle", () => {
    const finished = run(
      start(0),
      { type: "PHASE_COMPLETE", now: 10000 },
      { type: "STOP", now: 15000 },
    );
    const again = sessionReducer(finished, {
      type: "AGAIN",
      now: 20000,
      holdMs: HOLD,
      transitionMs: TRANSITION,
    });
    expect(again.phase).toBe("getReady");
    expect(again.holdAccumulatedMs).toBe(0);
    expect(again.finalMs).toBeNull();

    expect(sessionReducer(finished, { type: "DONE" })).toEqual(INITIAL_SESSION);
  });

  it("ignores invalid events (double-tap protection)", () => {
    const started = run(start(0));
    expect(sessionReducer(started, start(9000))).toBe(started);
    expect(sessionReducer(started, { type: "RESUME", now: 9000 })).toBe(
      started,
    );
    expect(sessionReducer(INITIAL_SESSION, { type: "PAUSE", now: 1 })).toBe(
      INITIAL_SESSION,
    );
    expect(
      sessionReducer(INITIAL_SESSION, { type: "PHASE_COMPLETE", now: 1 }),
    ).toBe(INITIAL_SESSION);

    const paused = run(start(0), { type: "PAUSE", now: 5000 });
    expect(sessionReducer(paused, { type: "PAUSE", now: 6000 })).toBe(paused);
    expect(sessionReducer(paused, { type: "PHASE_COMPLETE", now: 99999 })).toBe(
      paused,
    );
  });

  it("double STOP keeps the first final duration", () => {
    const s = run(
      start(0),
      { type: "PHASE_COMPLETE", now: 10000 },
      { type: "STOP", now: 15000 },
    );
    expect(sessionReducer(s, { type: "STOP", now: 90000 })).toBe(s);
  });
});
