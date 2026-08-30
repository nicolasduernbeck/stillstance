import type { EngineState } from "../engine";
import { useElapsedSeconds } from "../useElapsedSeconds";
import { ControlButton } from "../components/ControlButton";
import { ProgressRing } from "../components/ProgressRing";
import { ScreenLabel } from "../components/ScreenLabel";
import { TimeDisplay } from "../components/TimeDisplay";

interface PausedScreenProps {
  engine: EngineState;
  durationMs: number;
  onResume: () => void;
  onStop: () => void;
}

export function PausedScreen({
  engine,
  durationMs,
  onResume,
  onStop,
}: PausedScreenProps) {
  const durationSeconds = Math.round(durationMs / 1000);
  const seconds = useElapsedSeconds(engine, false);
  const remaining = Math.max(0, durationSeconds - seconds);

  return (
    <div className="flex h-full flex-col items-center">
      <header className="pt-2">
        <ScreenLabel tone="warn">Paused</ScreenLabel>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <ProgressRing
          progress={durationSeconds > 0 ? remaining / durationSeconds : 0}
        >
          <TimeDisplay ms={remaining * 1000} dimmed />
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
