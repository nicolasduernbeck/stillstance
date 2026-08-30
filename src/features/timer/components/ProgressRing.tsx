import type { ReactNode } from 'react';

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ProgressRingProps {
  /** 0..1 filled fraction of the ring. */
  progress: number;
  active?: boolean;
  /** Changing this remounts the arc so a wraparound doesn't animate backwards. */
  cycleKey?: number;
  children?: ReactNode;
}

// Progress is set via SVG presentation attributes (not inline styles) to stay
// compatible with a strict style-src 'self' CSP.
export function ProgressRing({ progress, active = false, cycleKey = 0, children }: ProgressRingProps) {
  const offset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));
  return (
    <div className="relative flex aspect-square w-[min(72vw,20rem)] items-center justify-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--color-line)" strokeWidth="1.5" />
        <circle
          key={cycleKey}
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={active ? 'var(--color-accent)' : 'var(--color-fg-muted)'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="ring-anim"
        />
      </svg>
      {children}
    </div>
  );
}
