import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "./features/timer/useSession";
import {
  isActivePhase,
  phaseDurationMs,
  type Phase,
} from "./features/timer/machine";
import { useSettings } from "./features/settings/useSettings";
import { useWakeLock } from "./features/wake-lock/useWakeLock";
import { haptics } from "./features/feedback/haptics";
import { sounds, unlockAudio } from "./features/feedback/sound";
import { IdleScreen } from "./features/timer/screens/IdleScreen";
import { ActiveScreen } from "./features/timer/screens/ActiveScreen";
import { PausedScreen } from "./features/timer/screens/PausedScreen";
import { FinishedScreen } from "./features/timer/screens/FinishedScreen";
import { SettingsSheet } from "./features/settings/SettingsSheet";
import { formatDurationAria } from "./lib/format";

const PHASE_ANNOUNCEMENTS: Record<Phase, string> = {
  idle: "Ready",
  getReady: "Preparing",
  holding: "Hold started",
  transitioning: "Change position now",
  paused: "Timer paused",
  finished: "Session done",
};

export default function App() {
  const { settings, update } = useSettings();
  const { state, actions } = useSession(
    settings.holdSeconds,
    settings.transitionSeconds,
  );
  const [settingsOpen, setSettingsOpen] = useState(false);

  useWakeLock(
    settings.keepAwakeEnabled &&
      state.phase !== "idle" &&
      state.phase !== "finished",
  );

  // Phase-transition feedback. Debounced so catching up on phases missed in
  // the background doesn't fire a burst of cues.
  const prevRef = useRef({ phase: state.phase, cycle: state.cycle });
  const lastFeedbackAt = useRef(0);
  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = { phase: state.phase, cycle: state.cycle };
    if (prev.phase === state.phase && prev.cycle === state.cycle) return;

    const now = Date.now();
    if (now - lastFeedbackAt.current < 500) return;

    const holdStarted =
      state.phase === "holding" &&
      prev.phase !== "paused" &&
      (prev.phase !== "holding" || prev.cycle !== state.cycle);
    const changePosition =
      state.phase === "transitioning" && prev.phase === "holding";
    const sessionDone = state.phase === "finished" && prev.phase !== "finished";

    if (holdStarted) {
      lastFeedbackAt.current = now;
      if (settings.vibrationEnabled) haptics.start();
      if (settings.soundEnabled) sounds.start();
    } else if (changePosition) {
      lastFeedbackAt.current = now;
      if (settings.vibrationEnabled) haptics.nextPosition();
      if (settings.soundEnabled) sounds.nextPosition();
    } else if (sessionDone) {
      lastFeedbackAt.current = now;
      if (settings.vibrationEnabled) haptics.stop();
      if (settings.soundEnabled) sounds.stop();
    }
  }, [
    state.phase,
    state.cycle,
    settings.vibrationEnabled,
    settings.soundEnabled,
  ]);

  // Audio contexts may only be created inside a user gesture.
  const handleStart = useCallback(() => {
    if (settings.soundEnabled) unlockAudio();
    actions.start();
  }, [settings.soundEnabled, actions]);

  const handleAgain = useCallback(() => {
    if (settings.soundEnabled) unlockAudio();
    actions.again();
  }, [settings.soundEnabled, actions]);

  const handleCountdownTick = useCallback(() => {
    if (settings.vibrationEnabled) haptics.countdownTick();
    if (settings.soundEnabled) sounds.countdownTick();
  }, [settings.vibrationEnabled, settings.soundEnabled]);

  return (
    <div className="h-full bg-bg text-fg">
      <div className="mx-auto h-full max-w-md px-6 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-[max(env(safe-area-inset-top),1.25rem)]">
        {state.phase === "idle" && (
          <IdleScreen
            onStart={handleStart}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}
        {isActivePhase(state.phase) && (
          <ActiveScreen
            phase={state.phase}
            engine={state.engine}
            durationMs={phaseDurationMs(state)}
            onPause={actions.pause}
            onStop={actions.stop}
            onTick={handleCountdownTick}
          />
        )}
        {state.phase === "paused" && (
          <PausedScreen
            engine={state.engine}
            durationMs={phaseDurationMs(state)}
            onResume={actions.resume}
            onStop={actions.stop}
          />
        )}
        {state.phase === "finished" && (
          <FinishedScreen
            finalMs={state.finalMs ?? 0}
            onAgain={handleAgain}
            onDone={actions.done}
          />
        )}
      </div>

      {settingsOpen && (
        <SettingsSheet
          settings={settings}
          onUpdate={update}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      <p className="sr-only" role="status">
        {PHASE_ANNOUNCEMENTS[state.phase]}
        {state.phase === "finished" && state.finalMs !== null
          ? `. Time in position: ${formatDurationAria(state.finalMs)}`
          : ""}
      </p>
    </div>
  );
}
