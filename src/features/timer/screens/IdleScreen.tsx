import { ControlButton } from "../components/ControlButton";
import { ProgressRing } from "../components/ProgressRing";

interface IdleScreenProps {
  onStart: () => void;
  onOpenSettings: () => void;
}

export function IdleScreen({ onStart, onOpenSettings }: IdleScreenProps) {
  return (
    <div className="flex h-full flex-col items-center">
      <header className="flex w-full items-center justify-between pt-2">
        <h1 className="text-xs font-semibold uppercase tracking-[0.4em] text-fg-secondary">
          Stillstance
        </h1>
        <button
          type="button"
          aria-label="Settings"
          onClick={onOpenSettings}
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-fg-muted transition hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </header>

      <main className="flex flex-1 items-center justify-center">
        <ProgressRing progress={0}>
          <div className="text-6xl font-extralight tracking-tight text-fg-muted [font-variant-numeric:tabular-nums] sm:text-7xl">
            00:00
          </div>
        </ProgressRing>
      </main>

      <footer className="w-full pb-2">
        <ControlButton variant="primary" onClick={onStart}>
          Start
        </ControlButton>
      </footer>
    </div>
  );
}
