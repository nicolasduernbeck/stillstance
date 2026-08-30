import { useEffect, useState } from 'react';
import { elapsedMs, type EngineState } from './engine';

// rAF-driven display clock: re-renders the consuming component only when the
// whole second changes. Elapsed is always recomputed from timestamps, so a
// visibility change after backgrounding snaps to the correct value instantly.
export function useElapsedSeconds(engine: EngineState, ticking: boolean): number {
  const [seconds, setSeconds] = useState(() => Math.floor(elapsedMs(engine, Date.now()) / 1000));

  useEffect(() => {
    const update = () => setSeconds(Math.floor(elapsedMs(engine, Date.now()) / 1000));
    update();
    if (!ticking) return;
    let raf = 0;
    const loop = () => {
      update();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    document.addEventListener('visibilitychange', update);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', update);
    };
  }, [engine, ticking]);

  return seconds;
}
