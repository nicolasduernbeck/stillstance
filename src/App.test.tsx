import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

// Defaults: hold 30 s, transition 10 s.
describe("App flow (countdown cycle)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-30T10:00:00Z"));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("cycles get ready → hold → next position → hold, with pause/resume and stop", () => {
    render(<App />);

    // IDLE
    expect(screen.getByText("Stillstance")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /start/i }));

    // GET READY counts down from the transition time
    expect(screen.getByText("Get ready")).toBeInTheDocument();
    expect(screen.getByText("00:10")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(4050));
    expect(screen.getByText("00:06")).toBeInTheDocument();

    // → HOLD counts down from the hold duration
    act(() => vi.advanceTimersByTime(6100));
    expect(screen.getByText("Hold")).toBeInTheDocument();
    expect(screen.getByText("00:30")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(12000));
    expect(screen.getByText("00:18")).toBeInTheDocument();

    // PAUSE freezes the remaining time
    fireEvent.click(screen.getByRole("button", { name: /pause/i }));
    expect(screen.getByText("Paused")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(45000));
    expect(screen.getByText("00:18")).toBeInTheDocument();

    // RESUME continues from the same remaining time (no phase restart)
    fireEvent.click(screen.getByRole("button", { name: /resume/i }));
    expect(screen.getByText("Hold")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText("00:15")).toBeInTheDocument();

    // Hold completes → NEXT POSITION
    act(() => vi.advanceTimersByTime(15100));
    expect(screen.getByText("Next position")).toBeInTheDocument();
    expect(
      screen.getByText("Move into your next position"),
    ).toBeInTheDocument();

    // Transition completes → next HOLD (cycle repeats)
    act(() => vi.advanceTimersByTime(10100));
    expect(screen.getByText("Hold")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText("00:25")).toBeInTheDocument();

    // STOP → finished with total hold time (30 s completed + 5 s partial)
    fireEvent.click(screen.getByRole("button", { name: /stop/i }));
    expect(screen.getByText("Time in position")).toBeInTheDocument();
    expect(screen.getByText("00:35")).toBeInTheDocument();

    // AGAIN starts a new session
    fireEvent.click(screen.getByRole("button", { name: /again/i }));
    expect(screen.getByText("Get ready")).toBeInTheDocument();
  });

  it("multiple missed phases are caught up from timestamps (background recovery)", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /start/i }));
    // 10 s get-ready + 30 s hold + 10 s transition + 12 s into the second hold
    act(() => vi.advanceTimersByTime(62050));
    expect(screen.getByText("Hold")).toBeInTheDocument();
    expect(screen.getByText("00:18")).toBeInTheDocument();
  });

  it("cancel during get ready returns to idle", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /start/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.getByText("Stillstance")).toBeInTheDocument();
  });

  it("zero transition starts holding immediately and chains holds", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /settings/i }));
    fireEvent.click(screen.getByRole("button", { name: "0s" }));
    fireEvent.click(screen.getByRole("button", { name: /^close$/i }));

    fireEvent.click(screen.getByRole("button", { name: /start/i }));
    expect(screen.getByText("Hold")).toBeInTheDocument();
    expect(screen.getByText("00:30")).toBeInTheDocument();

    // First hold completes → next hold begins directly, no transition screen
    act(() => vi.advanceTimersByTime(30100));
    expect(screen.getByText("Hold")).toBeInTheDocument();
    expect(screen.queryByText("Next position")).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByText("00:28")).toBeInTheDocument();
  });
});
