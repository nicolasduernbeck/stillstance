import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from './features/timer/useSession';
import { useSettings } from './features/settings/useSettings';
import { useWakeLock } from './features/wake-lock/useWakeLock';
import { haptics } from './features/feedback/haptics';
import { sounds, unlockAudio } from './features/feedback/sound';
import { IdleScreen } from './features/timer/screens/IdleScreen';
import { PrepareScreen } from './features/timer/screens/PrepareScreen';
import { RunningScreen } from './features/timer/screens/RunningScreen';
import { PausedScreen } from './features/timer/screens/PausedScreen';
import { FinishedScreen } from './features/timer/screens/FinishedScreen';
import { SettingsSheet } from './features/settings/SettingsSheet';
import { formatDurationAria } from './lib/format';

const PHASE_ANNOUNCEMENTS = {
  idle: 'Ready',
  preparing: 'Preparing',
  running: 'Hold started',
  paused: 'Timer paused',
  finished: 'Session done',
} as const;

export default function App() {
  const { settings, update } = useSettings();
  const { state, actions } = useSession(settings.prepSeconds);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useWakeLock(settings.keepAwakeEnabled && state.phase !== 'idle' && state.phase !== 'finished');

  // Transition feedback (start/stop), driven by phase changes.
  const prevPhase = useRef(state.phase);
  useEffect(() => {
    const prev = prevPhase.current;
    prevPhase.current = state.phase;
    if (prev === state.phase) return;
    if (state.phase === 'running' && prev !== 'paused') {
      if (settings.vibrationEnabled) haptics.start();
      if (settings.soundEnabled) sounds.start();
    }
    if (state.phase === 'finished') {
      if (settings.vibrationEnabled) haptics.stop();
      if (settings.soundEnabled) sounds.stop();
    }
  }, [state.phase, settings.vibrationEnabled, settings.soundEnabled]);

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

  const handleMilestone = useCallback(() => {
    if (settings.vibrationEnabled) haptics.milestone();
    if (settings.soundEnabled) sounds.milestone();
  }, [settings.vibrationEnabled, settings.soundEnabled]);

  return (
    <div className="h-full bg-bg text-fg">
      <div className="mx-auto h-full max-w-md px-6 pb-[max(env(safe-area-inset-bottom),1.25rem)] pt-[max(env(safe-area-inset-top),1.25rem)]">
        {state.phase === 'idle' && (
          <IdleScreen onStart={handleStart} onOpenSettings={() => setSettingsOpen(true)} />
        )}
        {state.phase === 'preparing' && (
          <PrepareScreen
            engine={state.engine}
            prepMs={state.prepMs}
            onCancel={actions.cancel}
            onTick={handleCountdownTick}
          />
        )}
        {state.phase === 'running' && (
          <RunningScreen
            engine={state.engine}
            milestonesEnabled={settings.milestonesEnabled}
            onMilestone={handleMilestone}
            onPause={actions.pause}
            onStop={actions.stop}
          />
        )}
        {state.phase === 'paused' && (
          <PausedScreen engine={state.engine} onResume={actions.resume} onStop={actions.stop} />
        )}
        {state.phase === 'finished' && (
          <FinishedScreen finalMs={state.finalMs ?? 0} onAgain={handleAgain} onDone={actions.done} />
        )}
      </div>

      {settingsOpen && (
        <SettingsSheet settings={settings} onUpdate={update} onClose={() => setSettingsOpen(false)} />
      )}

      <p className="sr-only" role="status">
        {PHASE_ANNOUNCEMENTS[state.phase]}
        {state.phase === 'finished' && state.finalMs !== null
          ? `. Time in position: ${formatDurationAria(state.finalMs)}`
          : ''}
      </p>
    </div>
  );
}
