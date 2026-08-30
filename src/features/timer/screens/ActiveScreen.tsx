import { useEffect, useRef } from 'react';
import type { EngineState } from '../engine';
import type { ActivePhase } from '../machine';
import { useElapsedSeconds } from '../useElapsedSeconds';
import { ControlButton } from '../components/ControlButton';
import { ProgressRing } from '../components/ProgressRing';
import { ScreenLabel } from '../components/ScreenLabel';
import { TimeDisplay } from '../components/TimeDisplay';

const PHASE_TEXT: Record<ActivePhase, { label: string; caption: string }> = {
  getReady: { label: 'Get ready', caption: 'Get into position' },
  holding: { label: 'Hold', caption: 'Stay in position' },
  transitioning: { label: 'Next position', caption: 'Move into your next position' },
};

interface ActiveScreenProps {
  phase: ActivePhase;
  engine: EngineState;
  durationMs: number;
  onPause: () => void;
  onStop: () => void;
  onTick: () => void;
}

export function ActiveScreen({ phase, engine, durationMs, onPause, onStop, onTick }: ActiveScreenProps) {
  const durationSeconds = Math.round(durationMs / 1000);
  const elapsedSeconds = useElapsedSeconds(engine, true);
  const remaining = Math.max(0, durationSeconds - elapsedSeconds);
  const { label, caption } = PHASE_TEXT[phase];

  // Subtle cue on the last three seconds of a transition phase.
  const lastTicked = useRef(remaining);
  useEffect(() => {
    if (remaining !== lastTicked.current) {
      lastTicked.current = remaining;
      if (phase !== 'holding' && remaining >= 1 && remaining <= 3) onTick();
    }
  }, [remaining, phase, onTick]);

  return (
    <div className="flex h-full flex-col items-center">
      <header className="pt-2">
        <ScreenLabel>{label}</ScreenLabel>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8">
        {/* Ring drains with the countdown; remount per phase instance to avoid a reverse sweep. */}
        <ProgressRing
          progress={durationSeconds > 0 ? remaining / durationSeconds : 0}
          active
          cycleKey={engine.runningSince ?? 0}
        >
          <TimeDisplay ms={remaining * 1000} />
        </ProgressRing>
        <p className="text-sm text-fg-muted">{caption}</p>
      </main>

      <footer className="flex w-full gap-3 pb-2">
        <ControlButton onClick={onPause}>Pause</ControlButton>
        <ControlButton variant="danger" onClick={onStop}>
          {phase === 'getReady' ? 'Cancel' : 'Stop'}
        </ControlButton>
      </footer>
    </div>
  );
}
