import type { EngineState } from '../engine';
import { useElapsedSeconds } from '../useElapsedSeconds';
import { ControlButton } from '../components/ControlButton';
import { ProgressRing } from '../components/ProgressRing';
import { ScreenLabel } from '../components/ScreenLabel';
import { TimeDisplay } from '../components/TimeDisplay';

interface PausedScreenProps {
  engine: EngineState;
  onResume: () => void;
  onStop: () => void;
}

export function PausedScreen({ engine, onResume, onStop }: PausedScreenProps) {
  const seconds = useElapsedSeconds(engine, false);

  return (
    <div className="flex h-full flex-col items-center">
      <header className="pt-2">
        <ScreenLabel tone="warn">Paused</ScreenLabel>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <ProgressRing progress={(seconds % 60) / 60}>
          <TimeDisplay ms={seconds * 1000} dimmed />
        </ProgressRing>
      </main>

      <footer className="flex w-full gap-3 pb-2">
        <ControlButton variant="primary" onClick={onResume}>
          Resume
        </ControlButton>
        <ControlButton variant="danger" onClick={onStop}>
          Stop
        </ControlButton>
      </footer>
    </div>
  );
}
