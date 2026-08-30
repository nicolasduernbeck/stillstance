import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-30T10:00:00Z'));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('runs a complete session: prep → hold → pause → resume → stop → again', () => {
    render(<App />);

    // IDLE
    expect(screen.getByText('Stillstance')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /start/i }));

    // PREPARING (default 3 s)
    expect(screen.getByText('Get ready')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(3100));

    // RUNNING
    expect(screen.getByText('Hold')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(65000));
    expect(screen.getByText('01:05')).toBeInTheDocument();

    // PAUSE freezes the clock
    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    expect(screen.getByText('Paused')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(30000));
    expect(screen.getByText('01:05')).toBeInTheDocument();

    // RESUME continues from the frozen time
    fireEvent.click(screen.getByRole('button', { name: /resume/i }));
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByText('01:10')).toBeInTheDocument();

    // STOP shows the final duration
    fireEvent.click(screen.getByRole('button', { name: /stop/i }));
    expect(screen.getByText('Time in position')).toBeInTheDocument();
    expect(screen.getByText('01:10')).toBeInTheDocument();

    // AGAIN starts a new prep countdown
    fireEvent.click(screen.getByRole('button', { name: /again/i }));
    expect(screen.getByText('Get ready')).toBeInTheDocument();
  });

  it('cancel during prep returns to idle', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.getByText('Stillstance')).toBeInTheDocument();
  });

  it('skips the countdown when prep time is 0', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /settings/i }));
    fireEvent.click(screen.getByRole('button', { name: '0s' }));
    fireEvent.click(screen.getByRole('button', { name: /^close$/i }));
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(screen.getByText('Hold')).toBeInTheDocument();
  });
});
