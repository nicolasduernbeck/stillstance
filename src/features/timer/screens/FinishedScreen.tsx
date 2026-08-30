import { ControlButton } from "../components/ControlButton";
import { ScreenLabel } from "../components/ScreenLabel";
import { TimeDisplay } from "../components/TimeDisplay";

interface FinishedScreenProps {
  finalMs: number;
  onAgain: () => void;
  onDone: () => void;
}

export function FinishedScreen({
  finalMs,
  onAgain,
  onDone,
}: FinishedScreenProps) {
  return (
    <div className="flex h-full flex-col items-center">
      <header className="pt-2">
        <ScreenLabel tone="accent">Done</ScreenLabel>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-6">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
        <TimeDisplay ms={finalMs} />
        <p className="text-sm uppercase tracking-[0.25em] text-fg-muted">
          Time in position
        </p>
      </main>

      <footer className="flex w-full gap-3 pb-2">
        <ControlButton variant="primary" onClick={onAgain}>
          Again
        </ControlButton>
        <ControlButton onClick={onDone}>Done</ControlButton>
      </footer>
    </div>
  );
}
