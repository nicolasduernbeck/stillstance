import { describe, expect, it } from "vitest";
import {
  IDLE_ENGINE,
  elapsedMs,
  pauseEngine,
  resumeEngine,
  startEngine,
} from "./engine";

describe("engine", () => {
  it("idle engine reports zero elapsed", () => {
    expect(elapsedMs(IDLE_ENGINE, 123456)).toBe(0);
  });

  it("computes elapsed from the running anchor", () => {
    const e = startEngine(1000);
    expect(elapsedMs(e, 1000)).toBe(0);
    expect(elapsedMs(e, 6500)).toBe(5500);
  });

  it("pause accumulates and freezes elapsed", () => {
    const e = pauseEngine(startEngine(1000), 4000);
    expect(e.runningSince).toBeNull();
    expect(elapsedMs(e, 999999)).toBe(3000);
  });

  it("resume continues from accumulated time", () => {
    const paused = pauseEngine(startEngine(1000), 4000);
    const resumed = resumeEngine(paused, 10000);
    expect(elapsedMs(resumed, 12000)).toBe(5000);
  });

  it("pause on a paused engine is a no-op", () => {
    const paused = pauseEngine(startEngine(1000), 4000);
    expect(pauseEngine(paused, 8000)).toBe(paused);
  });

  it("resume on a running engine is a no-op", () => {
    const running = startEngine(1000);
    expect(resumeEngine(running, 5000)).toBe(running);
  });

  it("clamps negative deltas when the clock moves backwards", () => {
    const e = startEngine(10000);
    expect(elapsedMs(e, 5000)).toBe(0);
    const paused = pauseEngine(e, 5000);
    expect(elapsedMs(paused, 999999)).toBe(0);
  });

  it("survives long background gaps (timestamp-derived)", () => {
    const e = startEngine(0);
    expect(elapsedMs(e, 2 * 60 * 60 * 1000)).toBe(7200000);
  });
});
