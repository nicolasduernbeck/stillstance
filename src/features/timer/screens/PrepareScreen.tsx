import { useEffect, useRef } from 'react';
import type { EngineState } from '../engine';
import { useElapsedSeconds } from '../useElapsedSeconds';
import { ControlButton } from '../components/ControlButton';
import { ProgressRing } from '../components/ProgressRing';
import { ScreenLabel } from '../components/ScreenLabel';

interface PrepareScreenProps {
  engine: EngineState;
  prepMs: number;
  onCancel: () => void;
  onTick: () => void;
}

export function PrepareScreen({ engine, prepMs, onCancel, onTick }: PrepareScreenProps) {
  const prepSeconds = Math.round(prepMs / 1000);
  const elapsedSeconds = useElapsedSeconds(engine, true);
  const remaining = Math.max(0, prepSeconds - elapsedSeconds);

  const lastTicked = useRef(remaining);
  useEffect(() => {
    if (remaining !== lastTicked.current) {
      lastTicked.current = remaining;
      if (remaining > 0) onTick();
    }
  }, [remaining, onTick]);

  return (
    <div className="flex h-full flex-col items-center">
      <header className="pt-2">
        <ScreenLabel>Get ready</ScreenLabel>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8">
        <ProgressRing progress={prepSeconds > 0 ? remaining / prepSeconds : 0} active>
          <div className="text-8xl font-extralight text-fg [font-variant-numeric:tabular-nums]">
            {Math.max(1, remaining)}
          </div>
        </ProgressRing>
        <p className="text-sm text-fg-muted">Get into position</p>
      </main>

      <footer className="w-full pb-2">
        <ControlButton onClick={onCancel}>Cancel</ControlButton>
      </footer>
    </div>
  );
}
