import { describe, expect, it } from 'vitest';
import { formatDuration, formatDurationAria } from './format';

describe('formatDuration', () => {
  it('formats MM:SS', () => {
    expect(formatDuration(0)).toBe('00:00');
    expect(formatDuration(999)).toBe('00:00');
    expect(formatDuration(1000)).toBe('00:01');
    expect(formatDuration(137000)).toBe('02:17');
    expect(formatDuration(59 * 60 * 1000 + 59000)).toBe('59:59');
  });

  it('adds hours beyond 60 minutes', () => {
    expect(formatDuration(3600000)).toBe('1:00:00');
    expect(formatDuration(3723000)).toBe('1:02:03');
  });

  it('clamps negative input', () => {
    expect(formatDuration(-5000)).toBe('00:00');
  });
});

describe('formatDurationAria', () => {
  it('reads naturally for screen readers', () => {
    expect(formatDurationAria(0)).toBe('0 seconds');
    expect(formatDurationAria(1000)).toBe('1 second');
    expect(formatDurationAria(137000)).toBe('2 minutes 17 seconds');
    expect(formatDurationAria(3661000)).toBe('1 hour 1 minute 1 second');
  });
});
