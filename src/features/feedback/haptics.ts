export function vibrate(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Unsupported — silent.
  }
}

export const haptics = {
  countdownTick: () => vibrate(10),
  start: () => vibrate(35),
  milestone: () => vibrate([15, 60, 15]),
  stop: () => vibrate([20, 50, 20]),
};
