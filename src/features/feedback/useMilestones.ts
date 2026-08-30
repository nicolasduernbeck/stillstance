import { useEffect, useRef } from 'react';

export const MILESTONES_SECONDS = [30, 60, 90, 120] as const;

// Fires feedback exactly when a milestone second is displayed. Milestones
// crossed while hidden or skipped (background catch-up) are marked silently.
export function useMilestones(seconds: number, enabled: boolean, onMilestone: () => void): void {
  const fired = useRef<Set<number>>(new Set());

  useEffect(() => {
    for (const m of MILESTONES_SECONDS) {
      if (seconds >= m && !fired.current.has(m)) {
        fired.current.add(m);
        if (enabled && seconds === m && document.visibilityState === 'visible') onMilestone();
      }
    }
  }, [seconds, enabled, onMilestone]);
}
