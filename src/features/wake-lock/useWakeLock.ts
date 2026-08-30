import { useEffect } from "react";

// Progressive enhancement: acquire while active, reacquire after visibility
// loss or OS revocation, release on deactivate. All failures are silent —
// the app must work identically without wake lock support.
export function useWakeLock(active: boolean): void {
  useEffect(() => {
    if (!active || !("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let disposed = false;

    const request = async () => {
      if (disposed || document.visibilityState !== "visible") return;
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (disposed) {
          void lock.release().catch(() => {});
          return;
        }
        sentinel = lock;
        lock.addEventListener("release", () => {
          sentinel = null;
          // OS-revoked while still visible (e.g. low battery) — try again.
          if (!disposed && document.visibilityState === "visible")
            void request();
        });
      } catch {
        // Permission denied or unsupported — silently degrade.
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible" && !sentinel) void request();
    };

    void request();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true;
      document.removeEventListener("visibilitychange", onVisibility);
      void sentinel?.release().catch(() => {});
    };
  }, [active]);
}
