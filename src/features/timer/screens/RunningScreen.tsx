import type { EngineState } from '../engine';
import { useElapsedSeconds } from '../useElapsedSeconds';
import { useMilestones } from '../../feedback/useMilestones';
import { ControlButton } from '../components/ControlButton';
import { ProgressRing } from '../components/ProgressRing';
import { ScreenLabel } from '../components/ScreenLabel';
import { TimeDisplay } from '../components/TimeDisplay';

interface RunningScreenProps {
  engine: EngineState;
  milestonesEnabled: boolean;
  onMilestone: () => void;
  onPause: () => void;
  onStop: () => void;
}

export function RunningScreen({ engine, milestonesEnabled, onMilestone, onPause, onStop }: RunningScreenProps) {
  const seconds = useElapsedSeconds(engine, true);
  useMilestones(seconds, milestonesEnabled, onMilestone);

  return (
    <div className="flex h-full flex-col items-center">
      <header className="pt-2">
        <ScreenLabel>Hold</ScreenLabel>
      </header>

      <main className="flex flex-1 items-center justify-center">
        {/* Minute-cycle ring: fills over 60 s and resets — honest about an open-ended hold. */}
        <ProgressRing progress={(seconds % 60) / 60} active cycleKey={Math.floor(seconds / 60)}>
          <TimeDisplay ms={seconds * 1000} />
        </ProgressRing>
      </main>

      <footer className="flex w-full gap-3 pb-2">
        <ControlButton onClick={onPause}>Pause</ControlButton>
        <ControlButton variant="danger" onClick={onStop}>
          Stop
        </ControlButton>
      </footer>
    </div>
  );
}
